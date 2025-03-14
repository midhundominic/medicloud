import apiClient from "../api";

export const startConsultation = async (appointmentId) => {
  const response = await apiClient.post(`/consultation/appointments/${appointmentId}/start-consultation`);
  return response.data;
};

export const joinConsultation = async (appointmentId) => {
  const response = await apiClient.post(`/consultation/appointments/${appointmentId}/join-consultation`);
  return response.data;
};

export const endConsultation = async (appointmentId) => {
  const response = await apiClient.post(`/consultation/appointments/${appointmentId}/end-consultation`);
  return response.data;
};