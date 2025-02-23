import React, { useState, useEffect } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditButton from "../../Common/EditButton/editButton";
import PersonalInfo from "./personalInfo";
import LogoutButton from "../../LogoutButton";
import {
  getProfilePatient,
  updateProfilePatient,
  uploadPatientProfilePic,
} from "../../../services/profileServices";
import styles from "./patientProfile.module.css";
import { Cloudinary } from "@cloudinary/url-gen";
import { toast } from "react-toastify";
import CircularProgress from "@mui/material/CircularProgress";
import { Fade } from "@mui/material";
import UpdateButtons from "./UpdateButtons/updateButtons";
import AddressInfo from "./addressInfo";
import BiometricSetup from './biometricSetup';
import FaceSetup from './faceSetup';

const Profile = () => {
  const [profileData, setProfileData] = useState(null); // Initialize with null
  const [profileImage, setProfileImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle");

  const cld = new Cloudinary({
    cloud: { cloudName: "ddrazuqb0" },
  });

  const userDataString = localStorage.getItem('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userId = userData?.userId;
  console.log("!111111",userId);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfilePatient();
        setProfileData(res.data); // Assign the profile data properly
        setProfileImage(res.data.profilePhoto || "");
      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file && file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit. Please Choose a smaller image");
      e.target.value = "";
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async () => {
    if (previewImage) {
      const file = document.querySelector('input[type="file"]').files[0];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", profileData.email);

      try {
        setIsLoading(true);
        const response = await uploadPatientProfilePic(formData);
        const res = response.data;

        if (res && res.success) {
          setProfileImage(res.profilePhoto);
          setPreviewImage("");
          setIsEditing(false);
          setUploadStatus("success");

          toast.success(res.message || "Profile photo updated successfully");

          localStorage.setItem("profilePhoto", res.profilePhoto);

          window.dispatchEvent(
            new CustomEvent("profilePhotoUpdated", {
              detail: { profilePhoto: res.profilePhoto },
            })
          );

          const updatedProfile = await getProfilePatient();
          setProfileData(updatedProfile.data);
        } else {
          throw new Error(res?.message || "Upload failed");
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        setUploadStatus("error");
        toast.error(
          error.message || "Error uploading photo. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.warn("Please select an image first");
    }
  };

  const handleCancel = () => {
    setPreviewImage("");
    setIsEditing(false);
    setUploadStatus("idle");
  };

  const handleSave = async (updatedData) => {
    try {
      await updateProfilePatient(updatedData); // Update profile on the backend

      // Directly update the local state with the updated form data
      setProfileData((prevData) => ({
        ...prevData,
        ...updatedData, // Merge updated data into profileData
      }));

      setIsEditing(false); // Exit edit mode
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  // Ensure profileData is defined and the profile has essential data (name, etc.)
  if (!profileData || !profileData.name) {
    return <div>Please complete your profile information.</div>;
  }
  console.log(profileData);
  return (
    <div className={styles.profileRoot}>
      <h2 className={styles.title}>Profile</h2>
      <div className={styles.titleContainer}>
        <div className={styles.titleWrapper}>
          <div className={styles.profileImageContainer}>
            {isLoading ? (
              <div className={styles.loadingOverlay}>
                <Fade in={true}>
                  <div className={styles.loadingContent}>
                    <CircularProgress size={40} thickness={4} />
                    <span>Uploading...</span>
                  </div>
                </Fade>
              </div>
            ) : profileImage || previewImage ? (
              previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile Preview"
                  className={styles.profileImage}
                />
              ) : (
                <img
                  src={profileImage}
                  alt="Profile"
                  className={styles.profileImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = AccountCircleIcon;
                  }}
                />
              )
            ) : (
              <img
                src={profileImage}
                alt="Profile"
                className={styles.profileImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = AccountCircleIcon;
                }}
              />
            )}
          </div>
          <div className={styles.nameContainer}>
            <span className={styles.profileName}>
              {profileData?.name || "No Name Provided"}
            </span>
            <span>{profileData?.email}</span>
          </div>
        </div>
        {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
      </div>

      {isEditing && (
        <>
          <input
            type="file"
            name="profilePhoto"
            onChange={handleImageChange}
            accept="image/*"
          />
          <UpdateButtons
            handleClickCancel={handleCancel}
            handleClickSave={handleSavePhoto}
          />
        </>
      )}

      <LogoutButton />

      <PersonalInfo
        profileData={profileData} // Pass the correct profile data
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSave={handleSave}
      />
      <AddressInfo
        profileData={profileData}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSave={handleSave}
      />
      <BiometricSetup userId={userId} />
      {/* <FaceSetup userId={userId} /> */}
    </div>
  );
};

export default Profile;
