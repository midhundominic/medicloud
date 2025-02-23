import { coordinatorSignin, coordinatorSignup, coordinatorView } from "../api/coordinator";
import apiClient from "../api/index";

export const regCoordinator = async (payload) => {
  try {
    const response = await coordinatorSignup(payload);
    return response;
  } catch (error) {
    console.error("Error on Doctor register", error);
    throw error;
  }
};

export const postSigninCoordinator = async (payload) => {
    try {
      const response = await coordinatorSignin(payload);
      return response;
    } catch (error) {
      console.error("Error on signin Coordinator", error);
      throw error;
    }
  };

  export const getCoordinator = async () => {
    try {
      const response = await coordinatorView();
      return response.data;
    } catch (error) {
      console.error("Error fetching coordinator list", error);
      throw error;
    }
  };

  export const updateCoordinator= async () => {
    try {
      const response = await coordinatorUpdate();
      return response;
    }catch(error) {
      console.error("Error Updating coordinator");
      throw error;
    }
  }

  export const deleteCoordinator = async (id) => {
    try {
      const response = await apiClient.delete(`/coordinator/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting coordinator", error);
      throw error;
    }
  };

  export const getPendingTests = async () => {
    try {
      const response = await apiClient.get('/care-coordinator/pending-tests');
      return response.data;
    } catch (error) {
      console.error("Error fetching pending tests", error);
      throw error;
    }
  };

  export const getCompletedTests = async () => {
    try {
      const response = await apiClient.get('/care-coordinator/completed-tests');
      return response.data;
    } catch (error) {
      console.error("Error fetching completed tests", error);
      throw error;
    }
  };
  
  export const submitTestResults = async (appointmentId,testId, result) => {
    try {
      const response = await apiClient.put(`/care-coordinator/test-results/${appointmentId}/${testId}`, { result });
      return response.data;
    } catch (error) {
      console.error("Error submitting test results", error);
      throw error;
    }
  };


  export const updateTestResult = async (appointmentId, testId, result) => {
    try {
      const response = await apiClient.put(`/update-test-result/${appointmentId}/${testId}`, { result });
      return response.data;
    } catch (error) {
      console.error("Error updating test result", error);
      throw error;
    }
  };