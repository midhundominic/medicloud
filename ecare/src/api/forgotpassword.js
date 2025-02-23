import apiClient from "./index";

export const forgotPassword= async(payload)=>{
    try{
      const response= await apiClient.post("/forgot-password",payload);
      return response.data;
    }catch(error){
      throw error;
    }
  }

  export const varifyCode= async(payload)=>{
    try{
      const response= await apiClient.post("/varifycode",payload);
      return response.data;
    }catch(error){
      throw error;
    }
  }

  export const resetPassword= async(payload)=>{
    try{
      const response= await apiClient.post("/reset-password",payload);
      return response.data;
    }catch(error){
      throw error;
    }
  }