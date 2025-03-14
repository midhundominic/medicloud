import apiClient from "../api";

export const startConsultation = async (appointmentId) => {
  try {
    const response = await apiClient.post(`/consultation/appointments/${appointmentId}/start-consultation`);
    console.log('Start consultation response:', response.data);
    
    if (!response.data.consultation) {
      throw new Error('Invalid consultation data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Start consultation error:', error);
    throw error;
  }
};

export const joinConsultation = async (appointmentId) => {
  try {
    const response = await apiClient.post(`/consultation/appointments/${appointmentId}/join-consultation`);
    console.log('Join consultation response:', response.data);
    
    if (!response.data.consultation) {
      throw new Error('Invalid consultation data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Join consultation error:', error);
    throw error;
  }
};

export const endConsultation = async (appointmentId) => {
  try {
    const response = await apiClient.post(`/consultation/appointments/${appointmentId}/end-consultation`);
    return response.data;
  } catch (error) {
    console.error('End consultation error:', error);
    throw error;
  }
};