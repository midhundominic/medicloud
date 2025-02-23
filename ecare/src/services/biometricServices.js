import apiClient from "../api";


export const registerBiometric = async (userId, email) => {
  try {
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    const response = await apiClient.post('/biometric/register', { 
      userId,
      email 
    });
    return response.data;
  } catch (error) {
    console.error('Error registering biometric:', error);
    throw error;
  }
};

export const verifyBiometric = async (credential) => {
  try {
    const response = await apiClient.post('/biometric/verify', { credential });
    return response.data;
  } catch (error) {
    console.error('Error verifying biometric:', error);
    throw error;
  }
};

export const verifyBiometricRegistration = async (userId, credential) => {
  try {
    // Convert ArrayBuffer to base64url string
    const attestationObject = credential.response.attestationObject instanceof ArrayBuffer
      ? arrayBufferToBase64(credential.response.attestationObject)
      : credential.response.attestationObject;

    const clientDataJSON = credential.response.clientDataJSON instanceof ArrayBuffer
      ? arrayBufferToBase64(credential.response.clientDataJSON)
      : credential.response.clientDataJSON;

    // Ensure credential.id is base64url encoded
    const credentialId = credential.id instanceof ArrayBuffer
      ? arrayBufferToBase64(credential.id)
      : credential.id;

    const rawId = credential.rawId instanceof ArrayBuffer
      ? arrayBufferToBase64(credential.rawId)
      : credential.rawId;

    const response = await apiClient.post('/biometric/verify-registration', {
      userId,
      credential: {
        id: credentialId,
        rawId: rawId,
        type: credential.type,
        response: {
          attestationObject,
          clientDataJSON,
          transports: credential.response.transports,
        },
        clientExtensionResults: credential.clientExtensionResults,
        authenticatorAttachment: credential.authenticatorAttachment
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying biometric registration:', error);
    throw error;
  }
};

// Helper function to convert ArrayBuffer to base64url string
const arrayBufferToBase64 = (buffer) => {
  if (!buffer) return '';
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// New functions for biometric authentication
export const getBiometricAuthOptions = async () => {
  try {
    const response = await apiClient.post('/biometric/authenticate-biometric', {}, {
      withCredentials: true
    });
    
    if (!response.data || !response.data.options) {
      throw new Error('Invalid authentication options received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting biometric auth options:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
};

export const verifyBiometricAuth = async (credential) => {
  try {
    // Ensure proper base64url encoding for all credential data
    const formattedCredential = {
      id: credential.id,
      rawId: credential.rawId instanceof ArrayBuffer
        ? arrayBufferToBase64(credential.rawId)
        : credential.rawId,
      type: credential.type,
      response: {
        authenticatorData: credential.response.authenticatorData instanceof ArrayBuffer
          ? arrayBufferToBase64(credential.response.authenticatorData)
          : credential.response.authenticatorData,
        clientDataJSON: credential.response.clientDataJSON instanceof ArrayBuffer
          ? arrayBufferToBase64(credential.response.clientDataJSON)
          : credential.response.clientDataJSON,
        signature: credential.response.signature instanceof ArrayBuffer
          ? arrayBufferToBase64(credential.response.signature)
          : credential.response.signature,
        userHandle: credential.response.userHandle instanceof ArrayBuffer
          ? arrayBufferToBase64(credential.response.userHandle)
          : credential.response.userHandle
      }
    };

    const response = await apiClient.post('/biometric/verify-authentication', {
      credential: formattedCredential
    }, {
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    console.error('Error verifying biometric authentication:', error);
    throw error;
  }
};