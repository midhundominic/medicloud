import apiClient from "../api";

// Get medicine suggestions from OpenFDA/RxNorm API
export const getMedicineSuggestions = async (searchTerm) => {
  try {
    const response = await apiClient.get(`/medicines/suggestions?query=${encodeURIComponent(searchTerm)}`);
    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch suggestions');
    }
  } catch (error) {
    console.error('Error fetching medicine suggestions:', error);
    throw error;
  }
};

// Get all medicines
export const getMedicinesList = async () => {
  try {
    const response = await apiClient.get('/medicines/list');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add new medicine
export const addMedicine = async (medicineData) => {
  try {
    const response = await apiClient.post('/medicines/add', medicineData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update medicine stock
export const updateMedicineStock = async (medicineId, stockData) => {
  try {
    const response = await apiClient.patch(`/medicines/stock/${medicineId}`, stockData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete medicine
export const deleteMedicine = async (medicineId) => {
  try {
    const response = await apiClient.delete(`/medicines/${medicineId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get medicine details
export const getMedicineDetails = async (medicineId) => {
  try {
    if (!medicineId) {
      throw new Error('Medicine ID is required');
    }
    
    const response = await apiClient.get(`/medicines/${medicineId}`);
    
    // Check if response exists and has data
    if (!response || !response.data) {
      throw new Error('No data received from server');
    }
    
    // Check if the response indicates success
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch medicine details');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in getMedicineDetails:', error);
    throw error; // Propagate the error with its original message
  }
};

// Get medicine stock details
export const getMedicineStock = async (medicineId) => {
  try {
    const response = await apiClient.get(`/medicines/${medicineId}/stock`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update medicine details
export const updateMedicine = async (medicineId, medicineData) => {
  try {
    const response = await apiClient.put(`/medicines/${medicineId}`, medicineData);
    return response.data;
  } catch (error) {
    throw error;
  }
};