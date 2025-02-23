import apiClient from '../api/index';

// Get all patients
export const getPatients = async () => {
  const response = await apiClient.get('/healthdata-patients');
  return response.data;
};

// Add new health record
export const addHealthRecord = async (data) => {
  const response = await apiClient.post('/healthdata-records', data);
  return response.data;
};

// Get all records for a patient
export const getPatientRecords = async (patientId) => {
  const response = await apiClient.get(`/healthdata-records/${patientId}`);
  return response.data;
};

// Update a health record
export const updateHealthRecord = async (id, data) => {
  const response = await apiClient.put(`/healthdata-records/${id}`, data);
  return response.data;
};
