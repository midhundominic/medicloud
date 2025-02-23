import React, { useState, useEffect } from "react";
import {
  getProfileDoctor,
  uploadDoctorProfilePic,
  updateProfileDoctor,
} from "../../../services/profileServices";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditButton from "../../Common/EditButton/editButton";
import UpdateButtons from "./updateButtons/updateButtons";
import LogoutButton from "../../LogoutButton";
import styles from "./doctorProfile.module.css";
import PersonalInfo from "./personalInfo";
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { toast } from "react-toastify";
import CircularProgress from '@mui/material/CircularProgress';
import { Fade } from '@mui/material';

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle');
  
  const cld = new Cloudinary({
    cloud: { cloudName: 'ddrazuqb0' }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfileDoctor();
        setProfileData(res);
        setProfileImage(res.profilePhoto || "");
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    // Check file size (5MB limit)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file && file.size > MAX_FILE_SIZE) {
      toast.error("File size exceeds 5MB limit. Please choose a smaller image.");
      e.target.value = ''; // Clear the file input
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
  
  const handleSaveProfile = async(updatedData) =>{
    try{
      await updateProfileDoctor(updatedData);

      setProfileData(prevData => ({
        ...prevData,
        ...updatedData,
      }));

      setIsEditing(false);
      toast.success("Profile Updated Successfully");

      const updatedProfile = await getProfileDoctor();
      setProfileData(updatedProfile);
    }catch(error){
      console.error("Error updating profile",error);
      toast.error("Error updating profile")
    }
  };


  const handleSavePhoto = async () => {
    if (previewImage) {
      const file = document.querySelector('input[type="file"]').files[0];
      
      // Double-check file size before upload
      const MAX_FILE_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size exceeds 5MB limit. Please choose a smaller image.");
        return;
      }
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", profileData.email);
  
      try {
        setIsLoading(true);
        const response = await uploadDoctorProfilePic(formData);
        const res = response.data;
        
        if (res && res.success) {
          // Update UI with new image
          setProfileImage(res.profilePhoto);
          setPreviewImage("");
          setIsEditing(false);
          setUploadStatus('success');
          
          // Show success message
          toast.success(res.message || "Profile photo updated successfully");
          
          // Update local storage with the new profile photo URL
          localStorage.setItem("profilePhoto", res.profilePhoto);
          
          // Dispatch a custom event to notify other components
          window.dispatchEvent(new CustomEvent('profilePhotoUpdated', {
            detail: { profilePhoto: res.profilePhoto }
          }));
          
          // Refresh profile data
          const updatedProfile = await getProfileDoctor();
          setProfileData(updatedProfile);
        } else {
          throw new Error(res?.message || 'Upload failed');
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        setUploadStatus('error');
        toast.error(error.message || "Error uploading photo. Please try again.");
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
    setUploadStatus('idle');
  };


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
            ) : (
            profileImage || previewImage ? (
             previewImage ? (
            <img
              src={previewImage}
              alt="Profile Preview"
              className={styles.profileImage}
            />
          ) : (
            <img
              src={profileImage} // This will now be a Cloudinary URL
              alt="Profile"
              className={styles.profileImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = AccountCircleIcon;
              }}
            />
          )
        ) : (
              <AccountCircleIcon
                style={{ color: "gray", fontSize: "84px" }}
                className={styles.accountIcon}
              />
            ))}
          </div>
          <div className={styles.nameContainer}>
            <span className={styles.profileName}>
              {profileData.firstName} {profileData.lastName}
            </span>
            <span>{profileData.email}</span>
            <span>{profileData.phone}</span>
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
        handleSave={handleSaveProfile}
      />
    </div>
  );
};

export default Profile;
