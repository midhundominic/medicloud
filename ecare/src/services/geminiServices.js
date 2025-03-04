import apiClient from "../api";

export const chatWithBot = async (message) => {
  try {
    const response = await apiClient.post('/gemini/chat', { message });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get chatbot response');
  }
};

export const getChatHistory = async () => {
  try {
    const response = await apiClient.get('/gemini/chat/history');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch chat history');
  }
};