import {
    varifyCode,
    resetPassword,
    forgotPassword
  } from "../api/forgotpassword";

export const passwordForgot = async(payload) =>{
    try{
      const response= await forgotPassword(payload);
      return response;
    }catch(error){
      throw error;
    }
    };

    export const codeVarify = async(payload) =>{
        try{
          const response= await varifyCode(payload);
          return response;
        }catch(error){
          throw error;
        }
        };  

    export const passwordReset = async(payload) =>{
        try{
          const response= await resetPassword(payload);
          return response;
        }catch(error){
          throw error;
        }
        };
