// coordinatorProfile.jsx
import React, { useState, useEffect } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditButton from "../../Common/EditButton/editButton";
import PersonalInfo from "./personalInfo";
import LogoutButton from "../../LogoutButton";
import { getProfileCoordinator } from "../../../services/profileServices";
import styles from "./coordinatorProfile.module.css";

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch profile data from backend
    const fetchProfile = async () => {
      try {
        const res = await getProfileCoordinator();
        setProfileData(res);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (updatedData) => {
    try {
      const res = await axios.put("/api/coordinator/profile", updatedData);
      setProfileData(res.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.profileRoot}>
      <h2 className={styles.title}>Profile</h2>
      <div className={styles.titleContainer}>
        <div className={styles.titleWrapper}>
          <AccountCircleIcon style={{ color: "gray", fontSize: "84px" }} />
          <div className={styles.nameContainer}>
            <span className={styles.profileName}>
              {profileData.firstName} {profileData.lastName}
            </span>
            <span>{profileData.email}</span>
            <span>{profileData.phone}</span>
          </div>
        </div>
        <EditButton onClick={() => setIsEditing(true)} />
      </div>

      <LogoutButton />

      <PersonalInfo
        profileData={profileData}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleSave={handleSave}
      />
    </div>
  );
};

export default Profile;
