import os
import logging
from models.prescription_analyzer import PrescriptionAnalyzer

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_model():
    try:
        logger.info("Initializing PrescriptionAnalyzer...")
        analyzer = PrescriptionAnalyzer()
        
        total_correct = 0
        total_samples = 0
        
        # Test with all training images
        with open('data/train_labels.txt', 'r') as f:
            for line in f:
                image_name, expected_text = line.strip().split(',')
                test_image = f'data/train_images/{image_name}'
                
                if not os.path.exists(test_image):
                    logger.error(f"Test image not found: {test_image}")
                    continue
                
                logger.info(f"\nTesting image: {image_name}")
                logger.info(f"Expected text: {expected_text}")
                
                # Test CRNN extraction
                crnn_text = analyzer._extract_text_crnn(test_image)
                logger.info(f"CRNN text: {crnn_text}")
                
                # Show character-by-character comparison
                logger.info("\nCharacter comparison:")
                for i, (exp, pred) in enumerate(zip(expected_text, crnn_text)):
                    if exp != pred:
                        logger.info(f"Position {i}: Expected '{exp}', Got '{pred}'")
                
                # Calculate similarity
                similarity = analyzer._calculate_similarity(crnn_text, expected_text)
                logger.info(f"Text similarity: {similarity:.2%}")
                
                if crnn_text.strip() == expected_text.strip():
                    total_correct += 1
                total_samples += 1
        
        logger.info(f"\nOverall accuracy: {(total_correct/total_samples)*100:.2f}%")
                
    except Exception as e:
        logger.error(f"Error in test_model: {str(e)}", exc_info=True)

if __name__ == "__main__":
    test_model() 