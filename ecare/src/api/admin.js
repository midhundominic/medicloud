import apiClient from "./index";

export const adminSignin = async (payload) => {
  try {
    const response = await apiClient.post("/admin-signin", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
