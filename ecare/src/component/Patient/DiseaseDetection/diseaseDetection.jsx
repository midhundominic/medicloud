import React, { useState } from 'react';
import { predictDisease } from '../../../services/mlServices';
import { 
    Box, 
    Button, 
    Chip, 
    FormControl, 
    InputLabel, 
    MenuItem, 
    Select, 
    Typography, 
    Paper,
    CircularProgress,
    Alert,
    IconButton
} from '@mui/material';
import {
    WarningAmber,
    CheckCircle,
    ArrowForward,
    LocalHospital,
    Timeline
} from '@mui/icons-material';
import symptoms from './constant';
import styles from './diseaseDetection.module.css';

const DiseaseDetection = () => {
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [currentSymptom, setCurrentSymptom] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAddSymptom = () => {
        if (currentSymptom && !selectedSymptoms.includes(currentSymptom)) {
            setSelectedSymptoms([...selectedSymptoms, currentSymptom]);
            setCurrentSymptom('');
        }
    };

    const handleRemoveSymptom = (symptomToRemove) => {
        setSelectedSymptoms(selectedSymptoms.filter(symptom => symptom !== symptomToRemove));
    };

    const handlePredict = async () => {
        if (selectedSymptoms.length === 0) {
            setError('Please select at least one symptom');
            return;
        }

        setLoading(true);
        setError('');
        setPrediction(null);

        try {
            const result = await predictDisease(selectedSymptoms);
            setPrediction(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className={styles.container}>
            <Typography variant="h3" className={styles.title}>
                Disease Prediction
            </Typography>

            <Paper className={`${styles.card} ${styles.inputSection}`}>
                <FormControl fullWidth>
                    <InputLabel>Select Your Symptoms</InputLabel>
                    <Select
                        value={currentSymptom}
                        onChange={(e) => setCurrentSymptom(e.target.value)}
                        label="Select Your Symptoms"
                    >
                        {symptoms
                            .filter(symptom => !selectedSymptoms.includes(symptom))
                            .map((symptom) => (
                                <MenuItem key={symptom} value={symptom}>
                                    {symptom.replace(/_/g, ' ')}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    onClick={handleAddSymptom}
                    disabled={!currentSymptom}
                    sx={{ mt: 2, mb: 2 }}
                    endIcon={<ArrowForward />}
                >
                    Add Symptom
                </Button>

                <Box className={styles.chipContainer}>
                    {selectedSymptoms.map((symptom) => (
                        <Chip
                            key={symptom}
                            label={symptom.replace(/_/g, ' ')}
                            onDelete={() => handleRemoveSymptom(symptom)}
                            className={styles.chip}
                        />
                    ))}
                </Box>

                <Button
                    variant="contained"
                    onClick={handlePredict}
                    disabled={selectedSymptoms.length === 0 || loading}
                    className={styles.predictButton}
                    startIcon={<LocalHospital />}
                    fullWidth
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Predict Disease'}
                </Button>
            </Paper>

            {error && (
                <Alert severity="error" className={styles.errorMessage}>
                    {error}
                </Alert>
            )}

            {prediction && (
                <Paper className={styles.resultCard}>
                    <Typography variant="h5" gutterBottom color="primary">
                        <CheckCircle sx={{ mr: 1 }} />
                        Prediction Result
                    </Typography>
                    
                    <Typography variant="h4" sx={{ mt: 2, mb: 1 }} color="text.primary">
                        {prediction.disease}
                    </Typography>

                    <Box sx={{ mt: 2, mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Confidence Level: {(prediction.confidence * 100).toFixed(1)}%
                        </Typography>
                        <div className={styles.confidenceBar}>
                            <div 
                                className={styles.confidenceFill} 
                                style={{ width: `${prediction.confidence * 100}%` }}
                            />
                        </div>
                    </Box>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        <Timeline sx={{ mr: 1 }} />
                        Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {prediction.description}
                    </Typography>

                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        <WarningAmber sx={{ mr: 1 }} />
                        Precautions
                    </Typography>
                    <ul className={styles.precautionList}>
                        {prediction.precautions.map((precaution, index) => (
                            <li key={index} className={styles.precautionItem}>
                                <CheckCircle className={styles.precautionIcon} />
                                <Typography variant="body1">{precaution}</Typography>
                            </li>
                        ))}
                    </ul>
                </Paper>
            )}
        </Box>
    );
};

export default DiseaseDetection;
