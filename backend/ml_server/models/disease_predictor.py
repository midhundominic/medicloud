import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DiseasePredictor:
    def __init__(self):
        self.model = None
        self.le = LabelEncoder()
        self.symptoms_list = None
        self.base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.join(self.base_path, 'models', 'disease_prediction_model.joblib')
        self.load_or_train_model()

    def load_or_train_model(self):
        if os.path.exists(self.model_path):
            self.load_model()
        else:
            self.train_model()

    def load_model(self):
        model_data = joblib.load(self.model_path)
        self.model = model_data['model']
        self.le = model_data['label_encoder']
        self.symptoms_list = model_data['symptoms_list']

    def clean_symptom(self, symptom):
        """Clean symptom text by removing extra spaces and standardizing format"""
        if pd.isna(symptom):
            return symptom
        # Remove extra spaces and convert to lowercase
        symptom = str(symptom).strip().lower()
        # Fix common inconsistencies
        replacements = {
            'dischromic _patches': 'dischromic_patches',
            'spotting_ urination': 'spotting_urination',
            'foul_smell_of urine': 'foul_smell_of_urine',
            'foul_smell_ofurine': 'foul_smell_of_urine',
            'yellowish_skin ': 'yellowish_skin',
            'yellow_crust': 'yellow_crust_ooze',
            'dischromic patches': 'dischromic_patches'
        }
        # Replace spaces with underscores and remove multiple underscores
        symptom = '_'.join(symptom.split())
        return replacements.get(symptom, symptom)

    def preprocess_data(self):
        try:
            # Load datasets with proper paths
            dataset_path = os.path.join(self.base_path, 'data', 'dataset.csv')
            severity_path = os.path.join(self.base_path, 'data', 'Symptom-severity.csv')
            
            logger.info(f"Loading dataset from: {dataset_path}")
            logger.info(f"Loading severity data from: {severity_path}")
            
            df = pd.read_csv(dataset_path)
            severity_df = pd.read_csv(severity_path)
            
            logger.info(f"Dataset shape: {df.shape}")
            logger.info(f"Severity data shape: {severity_df.shape}")

            # Clean and preprocess symptoms
            severity_df['Symptom'] = severity_df['Symptom'].str.strip().str.lower()
            severity_dict = severity_df.set_index('Symptom')['weight'].to_dict()

            # Get unique symptoms
            symptoms = []
            for col in df.columns:
                if col.startswith('Symptom_'):
                    # Clean symptoms in the dataset
                    df[col] = df[col].str.strip().str.lower() if df[col].dtype == object else df[col]
                    symptoms.extend(df[col].dropna().unique())
            
            self.symptoms_list = list(set(symptoms))
            logger.info(f"Total unique symptoms: {len(self.symptoms_list)}")

            # Create features matrix
            X = pd.DataFrame(0, index=range(len(df)), columns=self.symptoms_list)
            
            for i, row in df.iterrows():
                for col in df.columns:
                    if col.startswith('Symptom_'):
                        symptom = row[col]
                        if pd.notna(symptom):
                            symptom = symptom.strip().lower()
                            if symptom in severity_dict:
                                X.loc[i, symptom] = severity_dict[symptom]
                            else:
                                logger.warning(f"Symptom '{symptom}' not found in severity data")

            # Prepare target variable
            y = self.le.fit_transform(df['Disease'])
            
            logger.info(f"Features matrix shape: {X.shape}")
            logger.info(f"Target vector shape: {y.shape}")
            
            return X, y

        except Exception as e:
            logger.error(f"Error in preprocessing data: {str(e)}")
            raise

    def train_model(self):
        try:
            logger.info("Starting model training...")
            X, y = self.preprocess_data()
            
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            logger.info("Training Random Forest Classifier...")
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.model.fit(X_train, y_train)
            
            # Calculate and log accuracy
            train_accuracy = self.model.score(X_train, y_train)
            test_accuracy = self.model.score(X_test, y_test)
            logger.info(f"Training accuracy: {train_accuracy:.2%}")
            logger.info(f"Testing accuracy: {test_accuracy:.2%}")

            # Save the model
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            joblib.dump({
                'model': self.model,
                'label_encoder': self.le,
                'symptoms_list': self.symptoms_list
            }, self.model_path)
            logger.info(f"Model saved to: {self.model_path}")

        except Exception as e:
            logger.error(f"Error in training model: {str(e)}")
            raise

    def predict_disease(self, symptoms):
        try:
            if not self.model:
                raise Exception("Model not loaded")

            # Create feature vector
            X = pd.DataFrame(0, index=[0], columns=self.symptoms_list)
            severity_df = pd.read_csv(os.path.join(self.base_path, 'data', 'Symptom-severity.csv'))
            severity_dict = severity_df.set_index('Symptom')['weight'].to_dict()

            # Process symptoms
            for symptom in symptoms:
                symptom = symptom.strip().lower()
                if symptom in self.symptoms_list:
                    if symptom in severity_dict:
                        X.loc[0, symptom] = severity_dict[symptom]
                    else:
                        logger.warning(f"Severity not found for symptom: {symptom}")

            # Make prediction
            prediction = self.model.predict(X)
            probabilities = self.model.predict_proba(X)
            disease = self.le.inverse_transform(prediction)[0]
            confidence = float(probabilities.max())

            # Get description and precautions
            description_df = pd.read_csv(os.path.join(self.base_path, 'data', 'symptom_Description.csv'))
            precaution_df = pd.read_csv(os.path.join(self.base_path, 'data', 'symptom_precaution.csv'))

            description = description_df[
                description_df['Disease'].str.lower() == disease.lower()
            ]['Description'].values[0]

            precautions = precaution_df[
                precaution_df['Disease'].str.lower() == disease.lower()
            ].iloc[0, 1:].dropna().tolist()

            return {
                'disease': disease,
                'description': description,
                'precautions': precautions,
                'confidence': confidence
            }

        except Exception as e:
            logger.error(f"Error in prediction: {str(e)}")
            raise