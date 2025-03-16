import apiClient from "../api";

// Create payment for prescription
export const createPrescriptionPayment = async (prescriptionId, patientId) => {
  try {
    const response = await apiClient.post('/prescription/payments/create', {
      prescriptionId,
      patientId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating prescription payment:', error);
    throw error;
  }
};

// Verify prescription payment
export const verifyPrescriptionPayment = async (paymentData) => {
  try {
    const response = await apiClient.post('/prescription/payments/verify', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying prescription payment:', error);
    throw error;
  }
};

// Get payment status for a prescription
export const getPrescriptionPaymentStatus = async (prescriptionId) => {
  try {
    const response = await apiClient.get(`/prescription/payments/status/${prescriptionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting prescription payment status:', error);
    return { 
      success: false, 
      message: 'Failed to get prescription payment status',
      error: error.message
    };
  }
};

// Get all prescription payments for a patient
export const getPatientPrescriptionPayments = async (patientId) => {
  try {
    const response = await apiClient.get(`/prescription/payments/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting patient prescription payments:', error);
    throw error;
  }
};

// Get all prescription payments (for coordinator/pharmacy)
export const getPrescriptionPayments = async () => {
  try {
    const response = await apiClient.get('/prescription/payments');
    return response.data;
  } catch (error) {
    console.error('Error getting all prescription payments:', error);
    return { success: false, message: 'Failed to fetch prescription payments' };
  }
};

// Update delivery status of a prescription
export const updateDeliveryStatus = async (prescriptionId, status) => {
  try {
    const response = await apiClient.put(`/prescription/payments/${prescriptionId}/delivery-status`, {
      status
    });
    return response.data;
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return { success: false, message: 'Failed to update delivery status' };
  }
}; 