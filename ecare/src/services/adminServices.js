import { adminSignin } from "../api/admin";
import { doctorView } from "../api/doctor";
import apiClient from "../api/index";

export const postSignin = async (payload) => {
    try {
      const response = await adminSignin(payload);
      return response;
    } catch (error) {
      console.error("Error on signin Admin", error);
      throw error;
    }
  };

  export const getDoctors = async (payload) => {
    try {
      const response = await doctorView();
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors list", error);
      throw error;
    }
  };


  export const toggleUserStatus = async (userType, id, isDisabled) => {
    try {
      const response = await apiClient.patch(`admin/toggle-status/${userType}/${id}`, { isDisabled });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  };
  
  export const editUserDetails = async (userType, id, updateData) => {
    try {
      const response = await apiClient.patch(`/admin/edit-user/${userType}/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error editing user details:', error);
      throw error;
    }
  };

  export const getAllAppointments = async () => {
    try {
      const response = await apiClient.get("/appointments");
      console.log('Appointments response:', response.data);
      return response.data.appointments;
    } catch (error) {
      console.error("Error fetching appointments", error);
      throw error;
    }
  };
  
  // Cancel an appointment
  export const cancelAppointment = async (appointmentId) => {
    try {
      const response = await apiClient.put(`/admin/cancel-appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error("Error canceling appointment", error);
      throw error;
    }
  };
  
  // Reschedule an appointment
  export const rescheduleAppointment = async (appointmentId, rescheduleData) => {
    try {
      const response = await apiClient.put(`/admin/reschedule-appointment/${appointmentId}`, rescheduleData);
      return response.data;
    } catch (error) {
      console.error("Error rescheduling appointment", error);
      throw error;
    }
  };

  export const getUnavailableTimeSlots = async (doctorId, date) => {
    try {
      const response = await apiClient.get(`/appointments/unavailable-slots`, {
        params: { doctorId, date },
      });
      return response.data.unavailableSlots || [];
    } catch (error) {
      console.error("Error fetching unavailable time slots", error);
      return [];
    }
  };

  export const getLeaveRequests = async () => {
    try {
      const response = await apiClient.get("/leaves");
      console.log("111",response);
      return response;
    } catch (error) {
      console.error("Error fetching leave requests", error);
      throw error;
    }
  };
  
  // Update the status of a doctor's leave (approve or reject)
  export const updateLeaveStatus = async (leaveData) => {
    try {
      const response = await apiClient.post("/leaves/status", leaveData);
      return response.data;
    } catch (error) {
      console.error("Error updating leave status", error);
      throw error;
    }
  };

  export const getDashboardStats = async () => {
    try {
      const response = await apiClient.get('/admin/dashboardstats');
      console.log("dashboard",response);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  };