import apiClient from "./index";

export const coordinatorSignup = async (payload) => {
  try {
    const response = await apiClient.post("/coordinator-registration", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const coordinatorSignin = async (payload) => {
  try {
    localStorage.setItem("token", response.token);
    const response = await apiClient.post("/coordinator-signin", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const coordinatorView = async (payload) => {
  try {
    const response = await apiClient.get("/coordinator-view", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const coordinatorUpdate = async(payload) => {
  try{
    const response = await apiClient.put("/coordinator-update", payload);
    return response.datal
  }catch(error) {
    throw error;
  }
}
