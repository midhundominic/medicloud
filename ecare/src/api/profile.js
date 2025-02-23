import apiClient from "./index";

export const fetchCoordinatorProfile = async () => {
  try {
    const response = await apiClient.get("/coordinator-profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPatientProfile = async () => {
  try {
    const response = await apiClient.get("/patient-profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchDoctorProfile = async () => {
  try {
    const response = await apiClient.get("/doctor-profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const coordinatorprofileUpdate = async (payload) => {
  try {
    const response = await apiClient.get("/coordinator-update", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePatientProfile = async (payload) => {
  try {
    const response = await apiClient.put("/patient-profile", payload);  // PUT method to update profile
    return response;
  } catch (error) {
    throw error;
  }
};

export const uploadDoctorProfileImage = async (formData) => {
  try {
    const response = await apiClient.post("/doctor-profile-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateDoctorProfile = async (payload) => {
  try {
    const response = await apiClient.put("/doctor-profile", payload);  // PUT method to update profile
    return response;
  } catch (error) {
    throw error;
  }
};