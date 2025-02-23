import apiClient from "../api";

export const createAppointment = async (appointmentData) => {
  try {
    const response = await apiClient.post(
      "/create-appointment",
      appointmentData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating appointment", error);
    throw error;
  }
};

export const getUnavailableTimeSlots = async (doctorId, date) => {
  try {
    const response = await apiClient.get("/availability", {
      params: { doctorId, date },
    });
    return response;
  } catch (error) {
    console.error("Error fetching unavailable time slots", error);
    throw error;
  }
};

export const getAppointments = async (patientId) => {
  try {
    const response = await apiClient.get(`/patient-appointments/${patientId}`);
    return response;
  } catch (error) {
    console.error("Error fetching appointments", error);
    throw error;
  }
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await apiClient.put(
      `/cancel-appointment/${appointmentId}`
    );
    return response;
  } catch (error) {
    console.error("Error canceling appointment", error);
    throw error;
  }
};

// Reschedule an appointment
export const rescheduleAppointment = async (appointmentId, rescheduleData) => {
  try {
    const response = await apiClient.put(
      `/reschedule-appointment/${appointmentId}`,
      rescheduleData
    );
    return response.data;
  } catch (error) {
    console.error("Error rescheduling appointment", error);
    throw error;
  }
};

export const leaveCheck = async () => {
  try {
    const response = await apiClient.get(`/appointments/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error("Error rescheduling appointment", error);
    throw error;
  }
};

export const getCompletedAppointments = async (patientId) => {
  try {
    const response = await apiClient.get(`/completed/${patientId}`);
    return response;
  } catch (error) {
    console.error("Error Fetching Completed Appointments");
    throw error;
  }
};

export const submitReview = async (
  appointmentId,
  doctorId,
  patientId,
  rating,
  review
) => {
  try {
    const response = await apiClient.post(
      `/review/${appointmentId}/${doctorId}`,
      { patientId, rating, review }
    );
    return response.data;
  } catch (error) {
    console.error("Error Fetching Completed Appointments");
    throw error;
  }
};

export const getSubmittedReviews = async (patientId) => {
  try {
    const response = await apiClient.get(`/reviews/patient/${patientId}`);
    console.log("review",response);
    return response;
  } catch (error) {
    console.error("Error fetching submitted reviews");
    throw error;
  }
};

export const getAllReviews = async () => {
  try {
    const response = await apiClient.get('/reviews/all');
    console.log("adminreview",response);
    return response;
  } catch (error) {
    console.error("Error fetching all reviews");
    throw error;
  }
};
