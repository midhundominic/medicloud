import axios from "axios";
import { toast, Slide } from "react-toastify";


const apiClient = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
  timeout: 30000, // Optional: Set timeout
  headers: {
    "Content-Type": "application/json", // Default headers
  },
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 201) {
      return response;
    }
    if (response.status === 200) {
      return response;
    }
    // Handle non-200 responses
    // toast.error("Unexpected response status: " + response.status);
    return Promise.reject(new Error("Unexpected response status"));
  },
  (error) => {
    let errorMessage = "An error occurred. Please try again later.";

    // Check if the error is due to a network issue (backend is down)
    if (!error.response) {
      errorMessage =
        "Network error: Unable to reach the server. Please check your connection or try again later.";
    }
    // Check for specific HTTP status errors (e.g., 400 Bad Request)
    else if (error.response.status === 400) {
      errorMessage =
        error.response.data.message ||
        "Bad request: Please check your input and try again.";
    }
    
        if (error.response?.status === 401) {
          localStorage.clear();
          // window.location.href = Login;
          return Promise.reject(error);
        }
       
      
    // Handle other HTTP status errors if needed
    else if (error.response.status >= 500) {
      errorMessage =
        "Server error: Something went wrong on our end. Please try again later.";
    }
    // Show the error message in a toast notification
    toast.dismiss();
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default apiClient;

