import apiClient from "../api";

export const submitPrescription = async (prescriptionData) => {
  try {
    const response = await apiClient.post(
      `/prescriptions/create`,
      prescriptionData
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting prescription", error);
    throw error;
  }
};

export const updatePrescription = async (appointmentId, prescriptionData) => {
  try {
    const response = await apiClient.put(
      `/prescriptions/update/${appointmentId}`,
      prescriptionData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating prescription", error);
    throw error;
  }
};

export const getPrescriptionHistory = async (patientId) => {
  try {
    const response = await apiClient.get(`/prescriptions/patient/${patientId}`);
    return response;
  } catch (error) {
    console.error("Error fetching prescription history", error);
    throw error;
  }
};

export const getPrescriptionDetails = async () => {
  try {
    const response = await apiClient.get('/prescriptions/pending-tests'); // Updated endpoint
    return response.data;
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    throw new Error(error.response?.data?.message || 'Error fetching prescription details');
  }
};

export const uploadTestResult = async (formData) => {
  try {
    const token = localStorage.getItem('token'); // Get token from localStorage
    const response = await apiClient.post('/laboratory/upload-result', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}` // Add the token to the headers
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const downloadTestResult = async (resultId) => {
  try {
    const response = await apiClient.get(`/download-result/${resultId}`, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `test_result_${resultId}.pdf`);
    
    document.body.appendChild(link);
    
    link.click();
    
    link.parentNode.removeChild(link);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getPrescriptionByAppointment = async (appointmentId) => {
  try {
    const response = await apiClient.get(`/prescriptions/appointment/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCompletedTests = async () => {
  try {
    const response = await apiClient.get('/laboratory/completed-tests');
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateTestResult = async (resultId, formData) => {
  try {
    const response = await apiClient.put(`/laboratory/results/${resultId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getPendingTests = async () => {
  try {
    const response = await apiClient.get('/laboratory/pending-tests');
    console.log("Pending Tests",response);
    return response;
    
  } catch (error) {
    throw error;
  }
};

export const getAllTests = async () => {
  try {
    const response = await apiClient.get('/laboratory/tests');
    return response;
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

