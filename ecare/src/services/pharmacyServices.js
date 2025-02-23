import apiClient from "../api";

export const regPharmacist = async (payload) => {
    try {
      const response = await apiClient.post("/pharmacist-registration", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const getAllLaboratory = async (payload) => {
    try {
      const response = await apiClient.get("/laboratory-view", payload);
      return response.data;
    } catch (error) {
      throw error;
    }
  };