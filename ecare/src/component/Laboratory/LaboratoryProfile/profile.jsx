import React, { useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import styles from "./laboratory.module.css";
import LogoutButton from "../../LogoutButton"; 

const Profile = () => {
  // State to store user data from localStorage
  const [userData, setUserData] = useState({ name: '', email: '' });

  // Fetch data from localStorage on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
    }
  }, []); // Empty dependency array to run only once on mount

  return (
    <div className={styles.profileRoot}>
      <h2 className={styles.title}>Profile</h2>
      <div className={styles.titleContainer}>
        <div className={styles.titleWrapper}>
          <AccountCircleIcon style={{ color: "gray", fontSize: "84px" }} />
          <div className={styles.nameContainer}>
            <span className={styles.profileName}>{userData?.name || 'Laboratory'}</span>
            <span>{userData?.email || 'laboratory@ecare.com'}</span>
          </div>
        </div>
      </div>
      <LogoutButton />
    </div>
  );
};

export default Profile;
