import apiClient from "../api";

// Helper function to handle both base64 and blob data
const ensureBase64 = async (data) => {
  // If data is already a base64 string, return it
  if (typeof data === 'string' && data.includes('base64')) {
    return data;
  }

  // If data is a blob, convert it to base64
  if (data instanceof Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(data);
    });
  }

  throw new Error('Invalid face data format');
};

// Register face for authentication
export const registerFace = async (userId, faceData) => {
  try {
    const base64Image = await ensureBase64(faceData);
    const response = await apiClient.post('/face-auth/register', {
      userId,
      faceData: base64Image
    });
    return response.data;
  } catch (error) {
    console.error('Error registering face:', error);
    throw error;
  }
};

// Verify face for login
export const verifyFace = async (faceData) => {
  try {
    const base64Image = await ensureBase64(faceData);
    const response = await apiClient.post('/face-auth/verify', {
      faceData: base64Image
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying face:', error);
    throw error;
  }
};