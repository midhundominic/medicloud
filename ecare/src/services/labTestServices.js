import apiClient from "../api";



export const getAllTests = async () => {
    try {
      const response = await apiClient.get('/laboratory/tests');
      return response.data;
    } catch (error) {
      throw error;
    }
  };
  
  export const createTest = async (testData) => {
    try {
      const response = await apiClient.post('/laboratory/tests', testData);
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  export const updateTest = async (testId, testData) => {
    try {
      const response = await apiClient.put(`/laboratory/tests/${testId}`, testData);
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  export const deleteTest = async (testId) => {
    try {
      const response = await apiClient.delete(`/laboratory/tests/${testId}`);
      return response;
    } catch (error) {
      throw error;
    }
  };
  
