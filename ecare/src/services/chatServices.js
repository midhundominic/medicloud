import apiClient from "../api";

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const chatWithBot = async (message) => {
  try {
    const response = await apiClient.post(
      '/chat', 
      { message },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('Chat error:', error.response || error);
    throw error.response?.data || error;
  }
};

export const getChatHistory = async () => {
  try {
    const response = await apiClient.get(
      '/chat/history',
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    console.error('History error:', error.response || error);
    throw error.response?.data || error;
  }
};