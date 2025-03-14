import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  getProfileDoctor,
  getProfilePatient,
} from "../../services/profileServices"; // Ensure these functions are correctly implemented

import {
  NAV_CONTENT_ADMIN,
  NAV_CONTENT_COORDINATOR,
  NAV_CONTENT_DOCTOR,
  NAV_CONTENT_LABORATORY,
  NAV_CONTENT_PATIENT,
} from "./navContent";
import styles from "./sideNav.module.css";
import { ROUTES } from "../../router/routes";
import logo from "../../assets/images/logo.png";
import useAuth from "../../component/Authentication"

const SideNav = () => {
  useAuth();
  const [activeNav, setActiveNav] = useState(1);
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleProfilePhotoUpdate = (event) => {
      setProfileImage(event.detail.profilePhoto);
    };

    window.addEventListener("profilePhotoUpdated", handleProfilePhotoUpdate);

    // Cleanup
    return () => {
      window.removeEventListener(
        "profilePhotoUpdated",
        handleProfilePhotoUpdate
      );
    };
  }, []);

  // Fetch user data and profile image based on role
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("userData")); // Get from local storage
        setUserData(user);

        const storedProfilePhoto = localStorage.getItem("profilePhoto");
        if (storedProfilePhoto) {
          setProfileImage(storedProfilePhoto);
        }
        // Fetch specific profile data based on role
        if (user?.role === 2) {
          const doctorProfile = await getProfileDoctor();
          if (doctorProfile.profilePhoto) {
            setProfileImage(doctorProfile.profilePhoto);
            localStorage.setItem("profilePhoto", doctorProfile.profilePhoto);
          }
        } else if (user?.role === 1) {
          const patientProfile = await getProfilePatient();
          if (patientProfile.data.profilePhoto) {
            setProfileImage(patientProfile.data.profilePhoto);
            localStorage.setItem("profilePhoto", patientProfile.profilePhoto);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      }
    };
    fetchProfile();
  }, []);

  // Role-based navigation items
  const roleBasedSlideNav = useMemo(() => {
    switch (userData?.role) {
      case 0:
        return NAV_CONTENT_ADMIN;
      case 1:
        return NAV_CONTENT_PATIENT;
      case 2:
        return NAV_CONTENT_DOCTOR;
      case 3:
        return NAV_CONTENT_COORDINATOR;
      case 4:
        return NAV_CONTENT_LABORATORY;
      default:
        return NAV_CONTENT_PATIENT;
    }
  }, [userData?.role]);

  // Set active navigation item based on URL
  useEffect(() => {
    if (roleBasedSlideNav.length > 0) {
      const activeNavItem = roleBasedSlideNav.find(
        (item) => item.link === location.pathname
      );
      setActiveNav(activeNavItem?.id || null);
    }
  }, [location.pathname, roleBasedSlideNav]);

  // Navigate to the respective profile page based on user role
  const handleProfileClick = () => {
    switch (userData?.role) {
      case 0:
        navigate(ROUTES.ADMIN_PROFILE);
        break;
      case 1:
        navigate(ROUTES.PATIENT_PROFILE);
        break;
      case 2:
        navigate(ROUTES.DOCTOR_PROFILE);
        break;
      case 3:
        navigate(ROUTES.COORDINATOR_PROFILE);
        break;
      case 4:
        navigate(ROUTES.LABORATORY_PROFILE);
        break;
      default:
        navigate(ROUTES.PATIENT_PROFILE);
    }
  };

  const handleClick = (item) => {
    setActiveNav(item.id);
    navigate(item.link);
  };

  return (
    <div className={styles.sideNavRoot}>
      <div className={styles.logo}>
        <img src={logo}  className={styles.logoImage} />
        medicloud
      </div>
      <div className={styles.navWrapper}>
        {roleBasedSlideNav.map((item) => (
          <div
            key={item.id}
            className={`${styles.navItemContainer} ${
              activeNav === item.id && styles.activeNav
            }`}
            onClick={() => handleClick(item)}
          >
            <item.icon style={{ fontSize: "18px" }} />
            <span>{item.title}</span>
          </div>
        ))}
      </div>
      {userData && (
        <div className={styles.navProfile}>
          <div className={styles.imageWrapper}>
            {/* Conditional rendering for profile image */}
            {profileImage ? (
              <img
                src={profileImage} // Adjust the image path according to your setup
                alt="Profile"
                className={styles.profileImage}
                style={{ width: "46px", height: "46px", borderRadius: "50%" }} // Styling for profile image
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = AccountCircleIcon; // Fallback to default icon
                }}
              />
            ) : (
              <AccountCircleIcon style={{ color: "white", fontSize: "36px" }} />
            )}
            <EastRoundedIcon
              style={{ color: "white", fontSize: "24px", cursor: "pointer" }}
              onClick={handleProfileClick}
            />
          </div>
          <div className={styles.infoWrapper}>
            <div className={styles.navUserInfo}>
              <span>{userData.name || "User"}</span>{" "}
              {/* Accessing name directly */}
              <span className={styles.navEmail}>{userData.email}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideNav;
