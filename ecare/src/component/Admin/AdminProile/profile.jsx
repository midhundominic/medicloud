import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import styles from "./adminProfile.module.css";
import EditButton from "../../Common/EditButton/editButton";
import LogoutButton from "../../LogoutButton"; 

const Profile = () => {
  return (
    <div className={styles.profileRoot}>
      <h2 className={styles.title}>Profile</h2>
      <div className={styles.titleContainer}>
        <div className={styles.titleWrapper}>
          <AccountCircleIcon style={{ color: "gray", fontSize: "84px" }} />
          <div className={styles.nameContainer}>
            <span className={styles.profileName}>Admin</span>
            <span>admin@ecare.com</span>
          </div>
        </div>
        <EditButton />
      </div>
      <LogoutButton /> 
    </div>
  );
};

export default Profile;
