import apiClient from '../api'


export const analyzePrescriptionImage = async (imageData) => {
    try {
        if (!imageData) {
            throw new Error('No image data provided');
        }

        const response = await apiClient.post(`/prescription/analyze`, {
            imageData
        });

        if (!response.data || !response.data.success) {
            throw new Error(response.data?.error || 'Failed to analyze prescription');
        }

        return response.data;
    } catch (error) {
        console.error('Prescription analysis error:', error);
        throw new Error(
            error.response?.data?.error || 
            error.message || 
            'Failed to analyze prescription'
        );
    }
};
