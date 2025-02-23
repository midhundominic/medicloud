from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from models.prescription_analyzer import PrescriptionAnalyzer
from werkzeug.utils import secure_filename
import logging
from models.disease_predictor import DiseasePredictor

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize prescription analyzer
prescription_analyzer = PrescriptionAnalyzer()

# Initialize disease predictor
disease_predictor = DiseasePredictor()

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/ml/analyze-prescription', methods=['POST'])
def analyze_prescription():
    try:
        logger.info("Received prescription analysis request")
        
        if 'prescription' not in request.files:
            logger.error("No prescription file in request")
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
            
        file = request.files['prescription']
        if file.filename == '':
            logger.error("Empty filename")
            return jsonify({'success': False, 'error': 'No file selected'}), 400
            
        if not allowed_file(file.filename):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({'success': False, 'error': 'Invalid file type'}), 400
            
        # Create upload directory if it doesn't exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Save and process file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        logger.info(f"File saved to {filepath}")
        
        # Extract text from prescription
        extracted_text = prescription_analyzer.extract_text(filepath)
        logger.info(f"Extracted text: {extracted_text}")
        
        if not extracted_text:
            logger.error("No text extracted from image")
            return jsonify({
                'success': False,
                'error': 'Could not extract text from image'
            }), 400
        
        # Analyze prescription
        analysis_result = prescription_analyzer.analyze_prescription(extracted_text)
        logger.info(f"Analysis result: {analysis_result}")
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'result': {
                'extracted_text': extracted_text,
                'analysis': analysis_result
            }
        })
        
    except Exception as e:
        logger.error(f"Error processing prescription: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ml/train', methods=['POST'])
def train_model():
    try:
        from models.train_crnn import train_crnn
        train_crnn()
        return jsonify({'success': True, 'message': 'Model training completed'})
    except Exception as e:
        logger.error(f"Error training model: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ml/predict-disease', methods=['POST'])
def predict_disease():
    try:
        data = request.get_json()
        if not data or 'symptoms' not in data:
            return jsonify({'success': False, 'error': 'No symptoms provided'}), 400

        symptoms = data['symptoms']
        prediction = disease_predictor.predict_disease(symptoms)
        
        return jsonify({
            'success': True,
            'prediction': prediction
        })

    except Exception as e:
        logger.error(f"Error predicting disease: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    port = int(os.getenv('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)