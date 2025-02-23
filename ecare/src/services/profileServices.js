import {
  fetchCoordinatorProfile,
  fetchDoctorProfile,
  fetchPatientProfile,
  updatePatientProfile,
  updateDoctorProfile,
} from "../api/profile";
import apiClient from "../api";

export const getProfileCoordinator = async () => {
  try {
    const response = await fetchCoordinatorProfile();
    return response;
  } catch (error) {
    console.error("Error Fetching Coordinator", error);
    throw error;
  }
};

export const getProfilePatient = async () => {
  try {
    const response = await fetchPatientProfile();
    console.log(response);
    return response;
  } catch (error) {
    console.error("Error Fetching Patient", error);
  }
};

export const updateProfilePatient = async (payload) => {
  try {
    const response = await updatePatientProfile(payload);  // Added update service for PUT request
    return response.data;
  } catch (error) {
    console.error("Error updating Patient profile", error);
    throw error;
  }
};

export const getProfileDoctor = async () => {
  try {
    const response = await fetchDoctorProfile();
    return response;
  } catch (error) {
    console.error("Error Fetching Patient", error);
  }
};

// export const uploadDoctorProfilePic = async (formData) => {
//   try {
//     const response = await uploadDoctorProfileImage(formData);
//     console.log("API Response:", response);
//     return response.data;
//   } catch (error) {
//     console.error("Error uploading doctor profile image", error);
//     throw error;
//   }
// }

// export const getDoctorProfilePhoto = async () => {
//   try {
//     const response = await getDoctorPhoto();
//     return response;
//   } catch (error) {
//     console.error("Error Fetching Patient", error);
//   }
// };
export const uploadDoctorProfilePic = async (formData) => {
  try {
    // Debug logging
    for (let pair of formData.entries()) {
      console.log('FormData:', pair[0], pair[1]);
    }

    const response = await apiClient.post("/doctor-profile-photo", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
        // Authorization header is added by the interceptor
      }
    });

    return response;
  } catch (error) {
    console.error('Error uploading profile pic:', error);
    throw error;
  }
};

export const uploadPatientProfilePic = async (formData) => {
  try {
    // Debug logging
    for (let pair of formData.entries()) {
      console.log('FormData:', pair[0], pair[1]);
    }

    const response = await apiClient.post("/patient-profile-photo", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response;
  } catch (error) {
    console.error('Error uploading profile pic:', error);
    throw error;
  }
};

export const updateProfileDoctor = async (payload) => {
  try {
    const response = await updateDoctorProfile(payload);  
    return response.data;
  } catch (error) {
    console.error("Error updating Patient profile", error);
    throw error;
  }
};
