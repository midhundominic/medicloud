import { doctorSignup, doctorSignin, doctorView } from "../api/doctor";
import apiClient from "../api/index";

export const regDoctor = async (payload) => {
  try {
    const response = await doctorSignup(payload);
    return response;
  } catch (error) {
    console.error("Error on Doctor register", error);
    throw error;
  }
};

export const postSigninDoctor = async (payload) => {
  try {
    const response = await doctorSignin(payload);
    return response;
  } catch (error) {
    console.error("Error on signin patient", error);
    throw error;
  }
};

export const getDoctors = async (payload) => {
  try {
    const response = await doctorView();
    return response;
  } catch (error) {
    console.error("Error fetching doctors list", error);
    throw error;
  }
};

export const getDoctorById = async (id) => {
  try {
    const response = await apiClient.get(`/doctor/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching doctor by ID", error);
    throw error;
  }
};

export const deleteDoctor = async (id) => {
  try {
    const response = await apiClient.delete(`/doctor/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting doctor", error);
    throw error;
  }
};

export const getDoctorAppointments = async (doctorId) => {
  try {
    const response = await apiClient.get(`/doctor-appointments/${doctorId}`);
    console.log("doctorappointments",response);
    return response;
  } catch (error) {
    console.error("Error fetching doctor appointments", error);
    throw error;
  }
};

export const applyForLeave = async (leaveData) => {
  try {
    const response = await apiClient.post(`/leaves/apply/${leaveData.doctorId}`, leaveData);
    return response.data;
  } catch (error) {
    console.error("Error applying for leave", error);
    throw error;
  }
};

// New method to fetch leave status
export const fetchLeaveStatus = async (doctorId) => {
  try {
    const response = await apiClient.get(`/leaves/${doctorId}`);
    console.log("111111111",response.data.leaveRequests);
    return response.data.leaveRequests; // Adjust based on your API response
  } catch (error) {
    console.error("Error fetching leave status", error);
    throw error;
  }
};

export const cancelLeave = async (leaveId) => {
  try {
    const response = await apiClient.delete(`/leaves/cancel/${leaveId}`);
    return response.data; // Return the response message
  } catch (error) {
    console.error("Error canceling leave", error);
    throw error;
  }
};


export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await apiClient.get(`/appointments/${appointmentId}`);
    console.log("1111",response)
    return response.data;
    
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    throw error;
  }
};



export const markPatientAbsent = async (appointmentId) => {
  try {
    const response = await apiClient.put(`/appointments/${appointmentId}/absent`);
    return response.data;
  } catch (error) {
    console.error("Error marking patient as absent", error);
    throw error;
  }
};

export const startConsultation = async (appointmentId) => {
  try {
    const response = await apiClient.put(`/appointments/${appointmentId}/start-consultation`);
    return response.data;
  } catch (error) {
    console.error("Error starting consultation", error);
    throw error;
  }
};



export const submitPrescription = async (appointmentId, prescriptionData) => {
  try {
    const response = await apiClient.post(`/appointments/${appointmentId}/prescription`, prescriptionData);
    console.log("```````",response);
    return response.data;
  } catch (error) {
    console.error("Error submitting prescription", error.response?.data || error.message);
    throw error;
  }
};

export const getDoctorDashboardStats = async (doctorId) => {
  try {
    const response = await apiClient.get(`/doctors/${doctorId}/dashboard-stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor dashboard stats:', error);
    throw error;
  }
};

export const getPrescriptionHistory = async (patientId) => {
  try {
    const response = await apiClient.get(`/prescriptions/doctor/${patientId}`);
    console.log('record response:', response); // For debugging

    return {
      data: {
        appointments: response.data.appointments || [],
      },
    };
  } catch (error) {
    console.error("Error fetching prescription history", error);
    throw error;
  }
};

export const getConsultedPatients = async (doctorId) => {
  try {
    const response = await apiClient.get(`/doctor/patients/${doctorId}`);
    return response;
  } catch (error) {
    console.error('Error fetching consulted patients:', error);
    throw error;
  }
};

export const getPatientPrescriptions = async (patientId) => {
  try {
    const response = await apiClient.get(`/doctor/prescriptions/${patientId}`);
    console.log("doctorpatientPrescription",response);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    throw error;
  }
};
