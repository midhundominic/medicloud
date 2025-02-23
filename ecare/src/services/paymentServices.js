import apiClient from "../api";

// Create a payment order
export const createPaymentOrder = async (amount) => {
  try {
    const response = await apiClient.post("/payment/order", {
      amount,
      currency: "INR",
    });
    console.log("Create payment order response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating payment order:", error.response?.data || error.message);
    throw error;
  }
};

// Verify payment
export const verifyPayment = async (paymentData) => {
    try {
      const response = await apiClient.post("/payment/verify", paymentData);
      console.log("Payment verification response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error verifying payment:", error.response?.data || error.message);
      throw error;
    }
  };

// Save payment details
export const savePaymentDetails = async (paymentDetails) => {
    try {
      console.log("Saving payment details:", paymentDetails);
      const response = await apiClient.post("/payment/save", paymentDetails);
      console.log("Save payment details response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error saving payment details:", error.response?.data || error.message);
      throw error;
    }
  };

  export const getPatientPayments = async (userId) => {
    try {
      const response = await apiClient.get(`/payment/user/${userId}`);
      return response;
    } catch (error) {
      console.error("Error fetching patient records", error);
      throw error;
    }
  };
  