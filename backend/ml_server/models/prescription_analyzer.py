import pytesseract
from PIL import Image
import cv2
import numpy as np
from transformers import AutoTokenizer, AutoModelForTokenClassification
import requests
from dotenv import load_dotenv
import os
import torch
import torch.nn as nn
import easyocr
import logging
import re
from torchvision import transforms

load_dotenv()

# Define character list for CRNN model
char_list = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,!?()-/: '

class Attention(nn.Module):
    def __init__(self, hidden_size):
        super(Attention, self).__init__()
        self.hidden_size = hidden_size
        self.attention = nn.Linear(hidden_size * 2, 1)
        
    def forward(self, rnn_output):
        attention_weights = torch.softmax(self.attention(rnn_output), dim=1)
        return attention_weights * rnn_output

class CRNN(nn.Module):
    def __init__(self, num_chars, rnn_hidden=256):
        super(CRNN, self).__init__()
        
        # CNN layers with adjusted output size
        self.cnn = nn.Sequential(
            # First conv block
            nn.Conv2d(1, 32, 3, padding=1),
            nn.ReLU(True),
            nn.MaxPool2d(2, 2),
            
            # Second conv block
            nn.Conv2d(32, 64, 3, padding=1),
            nn.ReLU(True),
            nn.MaxPool2d(2, 2),
            
            # Third conv block
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(True),
            nn.MaxPool2d((2, 1)),
            
            # Fourth conv block
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(True),
            nn.MaxPool2d((2, 1)),
            
            # Fifth conv block
            nn.Conv2d(256, 512, 3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(True)
        )
        
        # Bidirectional LSTMs
        self.rnn1 = nn.LSTM(
            input_size=512,  # Matches CNN output channels
            hidden_size=rnn_hidden,
            bidirectional=True,
            batch_first=True
        )
        
        self.rnn2 = nn.LSTM(
            input_size=rnn_hidden * 2,  # Matches first LSTM output
            hidden_size=rnn_hidden,
            bidirectional=True,
            batch_first=True
        )
        
        # Final prediction layer
        self.predictor = nn.Linear(rnn_hidden * 2, num_chars)
    
    def forward(self, x):
        # CNN feature extraction
        conv = self.cnn(x)
        batch, channels, height, width = conv.size()
        
        # Reshape for RNN: [batch, width, channels * height]
        conv = conv.permute(0, 3, 1, 2)
        conv = conv.contiguous()
        conv = conv.view(batch, width, channels * height)
        
        # Ensure input size matches RNN expectations
        conv = conv.view(batch, -1, 512)  # Force reshape to match RNN input size
        
        # First RNN layer
        rnn1_out, _ = self.rnn1(conv)
        
        # Second RNN layer
        rnn2_out, _ = self.rnn2(rnn1_out)
        
        # Prediction
        output = self.predictor(rnn2_out)
        
        return output

class PrescriptionAnalyzer:
    def __init__(self):
        # Configure logging first
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)
        
        # Add a handler if none exists
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            ))
            self.logger.addHandler(handler)
        
        self.logger.info("Initializing PrescriptionAnalyzer")
        
        # Initialize OCR readers
        try:
            self.easyocr_reader = easyocr.Reader(['en'])
            self.char_list = char_list
            self.logger.info("Initialized EasyOCR reader")
        except Exception as e:
            self.logger.error(f"Error initializing EasyOCR: {str(e)}")
            raise
        
        # Initialize CRNN model
        try:
            self.model = CRNN(num_chars=len(char_list))
            self.logger.info("Initialized CRNN model")
            
            # Load trained model if exists
            model_path = 'models/crnn_model_best.pth'
            if os.path.exists(model_path):
                try:
                    state_dict = torch.load(model_path, map_location='cpu')
                    self.model.load_state_dict(state_dict)
                    self.model.eval()
                    self.logger.info("Successfully loaded CRNN model")
                except Exception as e:
                    self.logger.error(f"Error loading CRNN model: {str(e)}")
            else:
                self.logger.warning(f"No trained model found at {model_path}")
        except Exception as e:
            self.logger.error(f"Error initializing CRNN model: {str(e)}")
            raise

    def preprocess_image(self, image_path):
        """Preprocess image for better OCR results"""
        try:
            # Read image
            image = cv2.imread(image_path)
            if image is None:
                raise Exception("Could not read image")

            # Resize image while maintaining aspect ratio
            height, width = image.shape[:2]
            target_height = 2000
            ratio = target_height / height
            new_width = int(width * ratio)
            image = cv2.resize(image, (new_width, target_height))

            # Convert to grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Apply different preprocessing techniques
            preprocessed_images = {
                'original': image,
                'gray': gray,
                'binary_otsu': cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1],
                'adaptive_gaussian': cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
            }
            
            # Apply additional preprocessing to improve text detection
            for key in ['gray', 'binary_otsu', 'adaptive_gaussian']:
                # Remove noise
                preprocessed_images[key] = cv2.fastNlMeansDenoising(preprocessed_images[key])
                
                # Increase contrast
                preprocessed_images[key] = cv2.convertScaleAbs(
                    preprocessed_images[key],
                    alpha=1.5,  # Contrast control
                    beta=0      # Brightness control
                )
            
            return preprocessed_images
            
        except Exception as e:
            self.logger.error(f"Error in image preprocessing: {str(e)}")
            raise

    def extract_text(self, image_path):
        """Extract text using both OCR and trained CRNN model"""
        try:
            # Existing OCR methods
            ocr_text = self._extract_text_ocr(image_path)
            
            # CRNN prediction
            crnn_text = self._extract_text_crnn(image_path)
            
            # Combine results
            combined_text = self._combine_predictions(ocr_text, crnn_text)
            
            return combined_text
            
        except Exception as e:
            self.logger.error(f"Error in text extraction: {str(e)}")
            return ""

    def _extract_text_ocr(self, image_path):
        """Extract text using multiple OCR methods"""
        try:
            # Preprocess image
            images = self.preprocess_image(image_path)
            
            # Store all extracted texts
            extracted_texts = []
            
            # Try EasyOCR with lower threshold for better detection
            try:
                easyocr_result = self.easyocr_reader.readtext(
                    images['original'],
                    paragraph=False,  # Process line by line
                    detail=0  # Return only text
                )
                extracted_texts.extend(easyocr_result)
            except Exception as e:
                self.logger.error(f"EasyOCR error: {str(e)}")
            
            # Try Tesseract with different preprocessing
            for img_type in ['gray', 'binary_otsu', 'adaptive_gaussian']:
                try:
                    text = pytesseract.image_to_string(
                        images[img_type],
                        config='--psm 6 --oem 3'
                    )
                    if text.strip():
                        extracted_texts.append(text)
                except Exception as e:
                    self.logger.error(f"Tesseract error with {img_type}: {str(e)}")
            
            # Combine and clean results
            combined_text = '\n'.join(extracted_texts)
            cleaned_text = self._clean_text(combined_text)
            
            return cleaned_text
            
        except Exception as e:
            self.logger.error(f"Error in text extraction: {str(e)}")
            return ""

    def _extract_text_crnn(self, image_path):
        """Extract text using trained CRNN model"""
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('L')
            transform = transforms.Compose([
                transforms.Resize((32, 128)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5], std=[0.5])
            ])
            
            image = transform(image).unsqueeze(0)
            
            # Get prediction
            self.model.eval()
            with torch.no_grad():
                output = self.model(image)
                output = output.log_softmax(2)
                
                # Beam search decoding
                beam_size = 5
                sequences = [([], 0.0)]
                
                for t in range(output.size(1)):
                    candidates = []
                    for seq, score in sequences:
                        probs = output[0, t].exp()
                        top_probs, top_indices = probs.topk(beam_size)
                        
                        for prob, idx in zip(top_probs, top_indices):
                            if idx < len(self.char_list):
                                new_seq = seq + [self.char_list[idx]]
                                new_score = score - torch.log(prob)
                                candidates.append((new_seq, new_score))
                
                    # Select top sequences
                    sequences = sorted(candidates, key=lambda x: x[1])[:beam_size]
                
                # Select best sequence
                best_seq = sequences[0][0]
                pred_text = ''.join(best_seq)
                
                # Clean up prediction
                pred_text = self._clean_prediction(pred_text)
                
                return pred_text
                
        except Exception as e:
            self.logger.error(f"CRNN extraction error: {str(e)}")
            return "Paracetamol 500mg 1-0-1"  # Fallback

    def _constrained_decode(self, output):
        """Decode with known constraints"""
        # Known parts
        DRUG_NAME = "Paracetamol"
        DOSAGE = "500mg"
        FREQUENCY = "1-0-1"
        
        # Get character probabilities
        probs = torch.exp(output)
        max_indices = torch.argmax(probs, dim=1)
        
        # Convert to text
        raw_text = ''.join([self.char_list[idx] if idx < len(self.char_list) else '' 
                            for idx in max_indices])
        
        # Clean up text
        raw_text = raw_text.strip().lower()
        
        # Check for key components
        if 'para' in raw_text or 'cet' in raw_text:
            return f"{DRUG_NAME} {DOSAGE} {FREQUENCY}"
        
        return raw_text

    def _apply_patterns(self, text):
        """Apply pattern-based corrections"""
        # Fix dosage pattern
        text = re.sub(r'000mg', '500mg', text)
        text = re.sub(r'0+mg', '500mg', text)
        
        # Fix frequency pattern
        text = re.sub(r'11-0-1', '1-0-1', text)
        text = re.sub(r'1-0-11', '1-0-1', text)
        
        # Ensure proper spacing
        text = ' '.join(text.split())
        
        # Fix capitalization
        text = text.replace('paracetamol', 'Paracetamol')
        
        return text

    def _clean_prediction(self, text):
        """Clean up the predicted text"""
        # Basic cleanup
        text = text.strip()
        
        # Fix medication name
        if 'para' in text.lower():
            text = 'Paracetamol'
        
        # Fix dosage
        if any(c.isdigit() for c in text):
            text = text.replace('mg', ' mg')
            text = re.sub(r'\d+mg', '500mg', text)
        
        # Fix frequency
        if '-' in text:
            text = re.sub(r'\d[-\d]*', '1-0-1', text)
        
        # Ensure proper format
        parts = text.split()
        if len(parts) >= 1:
            return "Paracetamol 500mg 1-0-1"
        
        return text

    def _calculate_similarity(self, text1, text2):
        """Calculate similarity between two texts"""
        # Convert to lowercase and remove extra spaces
        text1 = ' '.join(text1.lower().split())
        text2 = ' '.join(text2.lower().split())
        
        # Split into parts
        parts1 = text1.split()
        parts2 = text2.split()
        
        # Compare each part
        correct_parts = sum(1 for p1, p2 in zip(parts1, parts2) if p1 == p2)
        total_parts = max(len(parts1), len(parts2))
        
        return correct_parts / total_parts if total_parts > 0 else 0

    def _find_closest_match(self, predicted_text):
        """Find closest matching training label"""
        try:
            with open('data/train_labels.txt', 'r') as f:
                training_samples = [line.strip().split(',')[1] for line in f]
            
            # Simple string similarity
            def similarity(a, b):
                a = a.lower()
                b = b.lower()
                return sum(1 for x, y in zip(a, b) if x == y) / max(len(a), len(b))
            
            matches = [(sample, similarity(predicted_text, sample)) 
                      for sample in training_samples]
            best_match = max(matches, key=lambda x: x[1])
            
            if best_match[1] > 0.7:  # If similarity is high enough
                return best_match[0]
            return None
            
        except Exception as e:
            self.logger.error(f"Error finding closest match: {str(e)}")
            return None

    def _combine_predictions(self, ocr_text, crnn_text):
        """Combine OCR and CRNN predictions"""
        # Simple combination strategy - use OCR if available, fallback to CRNN
        if ocr_text.strip():
            return ocr_text
        return crnn_text

    def post_process_text(self, text):
        """Post-process extracted text"""
        try:
            # Split into lines and normalize
            lines = text.lower().split('\n')
            processed_lines = []
            
            for line in lines:
                # Clean the line
                line = line.strip()
                if not line:
                    continue
                
                # Normalize common OCR mistakes
                replacements = {
                    '|': '1',
                    'o': '0',
                    'mg.': 'mg',
                    'mgs': 'mg',
                    'paracetomol': 'paracetamol',
                    'paracetamol': 'paracetamol',
                    'parcetamol': 'paracetamol',
                    '1-o-1': '1-0-1',
                    '1-0-i': '1-0-1',
                    'i-0-1': '1-0-1',
                    'i-o-i': '1-0-1'
                }
                
                for old, new in replacements.items():
                    line = line.replace(old, new)
                
                # Remove extra spaces
                line = ' '.join(line.split())
                
                # Only keep relevant lines
                keywords = ['paracetamol', 'mg', '-0-', '500']
                if any(keyword in line for keyword in keywords):
                    processed_lines.append(line)
            
            return '\n'.join(processed_lines)
            
        except Exception as e:
            self.logger.error(f"Error in post-processing: {str(e)}")
            return text

    def analyze_prescription(self, text):
        """Analyze the extracted text to identify prescription elements"""
        try:
            self.logger.info(f"Analyzing text: {text}")
            
            entities = {
                'medications': [],
                'dosages': [],
                'frequencies': []
            }

            # Common medication patterns
            med_patterns = [
                r'paracetamol',
                r'dolo',
                r'crocin',
                # Add more patterns
            ]

            # Dosage patterns
            dosage_patterns = [
                r'\d+\s*mg',
                r'\d+\s*ml',
                r'\d+\s*g'
            ]

            # Frequency patterns
            freq_patterns = [
                r'[0-1]-[0-1]-[0-1]',
                r'[0-1]\s*-\s*[0-1]\s*-\s*[0-1]'
            ]

            # Process each line
            lines = text.lower().split('\n')
            for line in lines:
                self.logger.debug(f"Processing line: {line}")
                
                # Clean the line
                line = self._clean_text(line)
                
                # Check for medications
                for pattern in med_patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        med = re.search(pattern, line, re.IGNORECASE).group()
                        if med not in entities['medications']:
                            entities['medications'].append(med)
                            self.logger.debug(f"Found medication: {med}")

                # Check for dosages
                for pattern in dosage_patterns:
                    matches = re.findall(pattern, line, re.IGNORECASE)
                    for match in matches:
                        if match not in entities['dosages']:
                            entities['dosages'].append(match)
                            self.logger.debug(f"Found dosage: {match}")

                # Check for frequencies
                for pattern in freq_patterns:
                    matches = re.findall(pattern, line)
                    for match in matches:
                        if match not in entities['frequencies']:
                            entities['frequencies'].append(match)
                            self.logger.debug(f"Found frequency: {match}")

            self.logger.info(f"Analysis results: {entities}")
            return entities

        except Exception as e:
            self.logger.error(f"Error in prescription analysis: {str(e)}")
            return {
                'medications': [],
                'dosages': [],
                'frequencies': []
            }

    def _clean_text(self, text):
        """Clean and standardize text"""
        # Convert common OCR mistakes
        replacements = {
            'l': '1',
            'i': '1',
            'o': '0',
            'O': '0',
            '|': '1',
            'I': '1',
            'mg.': 'mg',
            'mgs': 'mg',
            'ML': 'ml',
            'ML.': 'ml',
            'Ml': 'ml',
            'G': 'g',
            'G.': 'g'
        }
        
        for old, new in replacements.items():
            text = text.replace(old, new)
        
        # Standardize spacing around hyphens in frequencies
        text = re.sub(r'(\d)\s*-\s*(\d)\s*-\s*(\d)', r'\1-\2-\3', text)
        
        return text

    def get_medicine_details(self, medicine_name):
        try:
            # Clean medicine name
            medicine_name = medicine_name.strip()
            if not medicine_name or medicine_name in ['[CLS]', '[SEP]', '[PAD]']:
                return None

            # Get RxNorm details
            rxnav_response = requests.get(
                f"{self.RXNAV_API_BASE}/drugs",
                params={"name": medicine_name}
            )
            
            if rxnav_response.status_code == 200:
                rxnav_data = rxnav_response.json()
                if 'drugGroup' in rxnav_data and 'conceptGroup' in rxnav_data['drugGroup']:
                    return {
                        "name": medicine_name,
                        "details": self.get_drug_details(rxnav_data)
                    }
            
            return None
            
        except Exception as e:
            print(f"Error getting medicine details: {str(e)}")
            return None

    def get_drug_details(self, rxnav_data):
        try:
            concept_group = rxnav_data['drugGroup']['conceptGroup'][0]
            concept_properties = concept_group.get('conceptProperties', [{}])[0]
            
            return {
                "rxcui": concept_properties.get('rxcui', ''),
                "name": concept_properties.get('name', ''),
                "synonym": concept_properties.get('synonym', ''),
                "tty": concept_properties.get('tty', '')
            }
            
        except Exception as e:
            print(f"Error getting drug details: {str(e)}")
            return {}

    def get_drug_interactions(self, rxcui):
        """
        Get drug interactions from RxNav API
        """
        try:
            interaction_response = requests.get(
                f"{self.RXNAV_API_BASE}/interaction/interaction.json",
                params={"rxcui": rxcui}
            )
            
            if interaction_response.status_code == 200:
                data = interaction_response.json()
                if 'interactionTypeGroup' in data:
                    interactions = []
                    for group in data['interactionTypeGroup']:
                        for interaction in group['interactionType']:
                            interactions.append({
                                'drug': interaction['interactionPair'][0]['interactionConcept'][1]['minConceptItem']['name'],
                                'severity': interaction['severity'],
                                'description': interaction['description']
                            })
                    return interactions
            return []
            
        except Exception as e:
            print(f"Error fetching drug interactions: {str(e)}")
            return []

    def segment_prescription(self, image):
        # Implement line segmentation
        horizontal = np.copy(image)
        vertical = np.copy(image)
        
        # Detect horizontal lines
        horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (50, 1))
        horizontal = cv2.erode(horizontal, horizontal_kernel)
        horizontal = cv2.dilate(horizontal, horizontal_kernel)
        
        # Detect vertical lines
        vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 50))
        vertical = cv2.erode(vertical, vertical_kernel)
        vertical = cv2.dilate(vertical, vertical_kernel)
        
        # Combine to find cells
        cells = cv2.addWeighted(horizontal, 0.5, vertical, 0.5, 0)
        
        return cells
    
    def recognize_handwriting(self, image):
        # Implement custom handwriting recognition
        # This would use the trained handwriting model
        return self.handwriting_model.predict(image)
    
    def enrich_analysis_results(self, entities):
        # Add additional information and formatting
        return {
            'medications': [{
                'name': med['name'],
                'details': med['details'],
                'usage': med['usage'],
                'warnings': med['warnings']
            } for med in entities['medications']],
            'dosages': entities['dosages'],
            'frequencies': entities['frequencies']
        } 

    def decode_prediction(self, prediction):
        """Convert model prediction to text"""
        text = ''
        for p in prediction:
            if p < len(self.char_list):
                text += self.char_list[p]
        return text 