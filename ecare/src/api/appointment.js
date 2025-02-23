import apiClient from "./index";

export const scheduleAppointment = async (payload) => {
  try {
    const response = await apiClient.post("/appointments/schedule", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const rescheduleAppointment = async (payload) => {
  try {
    const response = await apiClient.put("/appointments/reschedule", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelAppointment = async (payload) => {
  try {
    const response = await apiClient.put("/appointments/cancel", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
