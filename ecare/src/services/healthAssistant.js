import apiClient from "../api";

export const analyzeHealthData = async (healthData) => {
  try {
    const response = await apiClient.post('/health/analyze', healthData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to analyze health data');
  }
};

export const getChatResponse = async (message, context) => {
  try {
    const response = await apiClient.post('/health/chat', { message, context });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get AI response');
  }
};
