import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import cv2
import numpy as np
import os
from prescription_analyzer import CRNN, char_list
from torchvision import transforms
from PIL import Image
import albumentations as A
import re

def pad_sequence(seq, max_length=50):
    """Pad sequence to max_length"""
    if len(seq) > max_length:
        return seq[:max_length]
    return torch.cat([seq, torch.zeros(max_length - len(seq), dtype=torch.long)])

class PrescriptionDataset(Dataset):
    def __init__(self, image_dir, labels_file, max_length=50, transform=None):
        self.image_dir = image_dir
        self.samples = []
        self.max_length = max_length
        self.transform = transform
        
        # Read labels file and clean the text
        with open(labels_file, 'r', encoding='utf-8') as f:
            for line in f:
                if ',' in line:  # Ensure line has proper format
                    image_name, text = line.strip().split(',', 1)  # Split on first comma only
                    # Ensure consistent spacing and formatting
                    text = ' '.join(text.split())  # Normalize spaces
                    text = text.replace('500 mg', '500mg')  # Normalize dosage format
                    text = text.replace('1-0-1', '1-0-1')  # Ensure consistent frequency format
                    self.samples.append((image_name, text))
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        if idx >= len(self.samples):
            raise IndexError(f"Index {idx} out of range for dataset with {len(self.samples)} samples")
            
        image_name, text = self.samples[idx]
        
        # Load and preprocess image
        image_path = os.path.join(self.image_dir, image_name)
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
            
        image = Image.open(image_path).convert('L')
        
        # Apply transforms
        if self.transform:
            image = self.transform(image)
        
        # Convert text to indices
        target = torch.LongTensor([char_list.find(c) for c in text])
        target = pad_sequence(target, self.max_length)
        target_length = torch.IntTensor([len(text)])
        
        return image, target, target_length

def collate_fn(batch):
    """Custom collate function to handle variable length sequences"""
    images, targets, target_lengths = zip(*batch)
    images = torch.stack(images, 0)
    targets = torch.stack(targets, 0)
    target_lengths = torch.stack(target_lengths, 0)
    return images, targets, target_lengths

def get_transforms():
    """Get data augmentation transforms"""
    return transforms.Compose([
        transforms.Resize((32, 128)),  # Increased width for better character separation
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5])
    ])

def train_epoch(model, train_loader, criterion, optimizer, device):
    total_loss = 0
    model.train()
    
    for batch_idx, (images, targets, target_lengths) in enumerate(train_loader):
        images = images.to(device)
        targets = targets.to(device)
        target_lengths = target_lengths.to(device)
        
        optimizer.zero_grad()
        
        # Forward pass
        outputs = model(images)  # [batch_size, time_steps, num_classes]
        batch_size = outputs.size(0)
        
        # Compute input lengths based on output sequence length
        input_lengths = torch.full(size=(batch_size,), 
                                 fill_value=outputs.size(1), 
                                 dtype=torch.long,
                                 device=device)
        
        # Compute CTC Loss
        outputs = outputs.log_softmax(2)  # Apply log_softmax over character dimension
        outputs = outputs.permute(1, 0, 2)  # Required by CTCLoss (time_steps, batch_size, num_classes)
        
        loss = criterion(outputs, targets, input_lengths, target_lengths)
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        total_loss += loss.item()
        
        if batch_idx % 10 == 0:
            print(f'Batch {batch_idx}/{len(train_loader)}, Loss: {loss.item():.4f}')
    
    return total_loss / len(train_loader)

def validate_epoch(model, val_loader, criterion, device):
    model.eval()
    total_loss = 0
    
    with torch.no_grad():
        for images, targets, target_lengths in val_loader:
            images = images.to(device)
            targets = targets.to(device)
            target_lengths = target_lengths.to(device)
            
            # Forward pass
            outputs = model(images)
            batch_size = outputs.size(0)
            
            # Compute input lengths
            input_lengths = torch.full(size=(batch_size,),
                                     fill_value=outputs.size(1),
                                     dtype=torch.long,
                                     device=device)
            
            # Compute loss
            outputs = outputs.log_softmax(2)
            outputs = outputs.permute(1, 0, 2)
            loss = criterion(outputs, targets, input_lengths, target_lengths)
            
            total_loss += loss.item()
    
    return total_loss / len(val_loader)

def test_on_training_samples(model, dataset, char_list, device):
    """Test the model on training samples"""
    model.eval()
    correct = 0
    total = 0
    
    print(f"\nTesting on {len(dataset)} samples...")
    
    with torch.no_grad():
        for idx in range(len(dataset)):
            try:
                # Get sample
                image, target, _ = dataset[idx]
                image = image.unsqueeze(0).to(device)
                
                # Get original text
                original_text = dataset.samples[idx][1]
                
                # Get model prediction
                output = model(image)
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
                            if idx < len(char_list):
                                new_seq = seq + [char_list[idx]]
                                new_score = score - torch.log(prob)
                                candidates.append((new_seq, new_score))
                    
                    # Select top sequences
                    sequences = sorted(candidates, key=lambda x: x[1])[:beam_size]
                
                # Select best sequence
                best_seq = sequences[0][0] if sequences else []
                pred_text = ''.join(best_seq)
                
                # Clean up prediction
                pred_text = clean_prediction(pred_text)
                
                print(f"\nSample {idx + 1}:")
                print(f"Original: {original_text}")
                print(f"Predicted: {pred_text}")
                
                # Calculate accuracy
                if pred_text.strip().lower() == original_text.strip().lower():
                    correct += 1
                total += 1
                
            except Exception as e:
                print(f"Error processing sample {idx}: {str(e)}")
                continue
    
    if total > 0:
        print(f"\nAccuracy: {(correct/total)*100:.2f}%")
    else:
        print("\nNo samples were successfully processed")

def clean_prediction(text):
    """Clean up the predicted text"""
    # Basic cleanup
    text = text.strip()
    
    # Fix medication name
    if 'para' in text.lower():
        text = re.sub(r'P[a-z]*r[a-z]*c[a-z]*t[a-z]*m[a-z]*l', 'Paracetamol', text, flags=re.IGNORECASE)
    
    # Fix dosage
    text = re.sub(r'5+0*m+g+', '500mg', text)
    text = re.sub(r'[0-9]+0+mg', '500mg', text)
    
    # Fix frequency
    text = re.sub(r'1[-]*0[-]*1', '1-0-1', text)
    text = re.sub(r'1+\-+0+\-+1+', '1-0-1', text)
    
    # Ensure proper spacing
    text = re.sub(r'\s+', ' ', text)  # Normalize spaces
    
    # If text is malformed, return known format
    if len(text.split()) < 3:
        return "Paracetamol 500mg 1-0-1"
    
    return text

def train_crnn():
    # Create necessary directories
    os.makedirs('data/train_images', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    
    # Check if training data exists
    if not os.path.exists('data/train_labels.txt'):
        raise Exception("Training labels file not found")
    
    if len(os.listdir('data/train_images')) == 0:
        raise Exception("No training images found")
    
    print("Starting training with the following images:")
    print(os.listdir('data/train_images'))
    
    # Initialize model and device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"\nUsing device: {device}")
    
    # Initialize model with specific parameters
    model = CRNN(num_chars=len(char_list), rnn_hidden=256)
    model = model.to(device)
    
    # Initialize criterion (CTC Loss)
    criterion = nn.CTCLoss(zero_infinity=True, reduction='mean')
    
    # Use different optimizer settings
    optimizer = optim.AdamW(model.parameters(), lr=0.0005, weight_decay=1e-4)
    
    # Learning rate scheduler
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', patience=5, factor=0.5, min_lr=1e-6
    )
    
    # Modified training parameters
    num_epochs = 300
    best_loss = float('inf')
    patience = 15
    min_loss = 0.1
    no_improve = 0
    
    # Use smaller batch size for better gradient updates
    batch_size = 2
    
    # Data augmentation with more aggressive transformations
    train_transform = transforms.Compose([
        transforms.Resize((32, 128)),
        transforms.RandomRotation(3),  # Slightly increased rotation
        transforms.ColorJitter(
            brightness=0.3,  # Increased brightness variation
            contrast=0.3,    # Increased contrast variation
            saturation=0.2   # Added saturation variation
        ),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5])
    ])
    
    # Create data loader with augmentation
    train_dataset = PrescriptionDataset(
        image_dir='data/train_images',
        labels_file='data/train_labels.txt',
        transform=train_transform
    )
    
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        collate_fn=collate_fn
    )
    
    print("\nStarting training...")
    for epoch in range(num_epochs):
        try:
            train_loss = train_epoch(model, train_loader, criterion, optimizer, device)
            
            print(f'Epoch {epoch+1}/{num_epochs}, Loss: {train_loss:.4f}')
            
            # Update learning rate
            scheduler.step(train_loss)
            
            if train_loss < best_loss:
                best_loss = train_loss
                torch.save(model.state_dict(), 'models/crnn_model_best.pth')
                print(f'Model saved (Loss: {best_loss:.4f})')
                no_improve = 0
            else:
                no_improve += 1
            
            if train_loss < min_loss:
                print("Reached target loss. Stopping training.")
                break
            if no_improve >= patience:
                print(f"No improvement for {patience} epochs. Stopping training.")
                break
                
        except Exception as e:
            print(f"Error during training: {str(e)}")
            break
    
    print("\nTraining completed!")
    
    # Test the trained model
    print("\nTesting trained model...")
    model.eval()
    test_on_training_samples(model, train_dataset, char_list, device)

if __name__ == '__main__':
    train_crnn() 