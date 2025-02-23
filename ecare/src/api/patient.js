import apiClient from "./index";

export const patientSignup = async (payload) => {
  try {
    const response = await apiClient.post("/patient-signup", payload, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const patientSignin = async (payload) => {
  try {
    const response = await apiClient.post("/patient-signin", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authWithGoogle = async (payload) => {
  try {
    const response = await apiClient.post("/patientauthWithGoogle", payload);
    return response;
  } catch (error) {
    console.error(
      "Error on signin patient",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const patientView= async(payload)=>{
  try{
    const response= await apiClient.get("/patients-view",payload);
    return response.data;
  }catch(error){
    throw error;
  }
}
