import apiClient from '../api'

export const analyzePrescription = async (prescriptionImage) => {
    try {
        const formData = new FormData();
        formData.append('prescription', prescriptionImage);

        const response = await apiClient.post("/ml/analyze-prescription", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 second timeout
        });
        
        if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to analyze prescription');
        }

        // Ensure the response has the expected structure
        if (!response.data.result || !response.data.result.analysis) {
            throw new Error('Invalid response format from server');
        }

        console.log("Response from Python:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error in analyzePrescription:', error);
        throw new Error(error.response?.data?.error || error.message || 'Failed to analyze prescription');
    }
};

export const predictDisease = async (symptoms) => {
    try {
        const response = await apiClient.post("/ml/predict-disease", {
            symptoms: symptoms
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Prediction failed');
        }

        return response.data.prediction;
    } catch (error) {
        console.error('Error in predictDisease:', error);
        throw new Error(error.response?.data?.error || error.message || 'Failed to predict disease');
    }
};