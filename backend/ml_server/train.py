from models.disease_predictor import DiseasePredictor
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_model(predictor):
    test_cases = [
        ['itching', 'skin_rash', 'nodal_skin_eruptions'],  # Fungal infection
        ['continuous_sneezing', 'chills', 'watering_from_eyes'],  # Allergy
        ['stomach_pain', 'acidity', 'vomiting']  # GERD
    ]
    
    logger.info("\nTesting model with sample cases:")
    for symptoms in test_cases:
        prediction = predictor.predict_disease(symptoms)
        logger.info(f"\nSymptoms: {', '.join(symptoms)}")
        logger.info(f"Predicted Disease: {prediction['disease']}")
        logger.info(f"Confidence: {prediction['confidence']:.2%}")
        logger.info(f"Description: {prediction['description'][:100]}...")
        logger.info(f"Precautions: {', '.join(prediction['precautions'])}")

def main():
    logger.info("Starting model training...")
    try:
        predictor = DiseasePredictor()
        test_model(predictor)
        logger.info("\nModel training and testing completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during training: {str(e)}")
        raise

if __name__ == "__main__":
    main()