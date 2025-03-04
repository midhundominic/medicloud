import apiClient from "../api";

export const chatWithBot = async (message,patientId) => {
  try {
    const response = await apiClient.post(`/gemini/chat/${patientId}`, { message });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get chatbot response');
  }
};

export const getChatHistory = async (patientId) => {
  try {
    const response = await apiClient.get(`/gemini/chat/history/${patientId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch chat history');
  }
};