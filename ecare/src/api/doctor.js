import apiClient from "./index";

export const doctorSignup = async (payload) => {
  try {
    const response = await apiClient.post("/doctor-registration", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const doctorSignin = async (payload) => {
  try {
    const response = await apiClient.post("/doctor-signin", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const doctorView = async (payload) => {
  try {
    const response = await apiClient.get("/doctors-view", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
