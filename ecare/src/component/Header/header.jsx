import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";

import styles from "./header.module.css";
import SideNav from "../SideNav";
import { ROUTES } from "../../router/routes";

const Header = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const navigate = useNavigate();
  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const handleClickProfile = () => {
    navigate(ROUTES.PATIENT_PROFILE);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.hamburger} onClick={togglePanel}>
          <MenuIcon style={{ color: "white", fontSize: "30px" }} />
        </div>
        <div className={styles.headerContent}>
          <div className={styles.logo}>eCare</div>
          <div className={styles.rightSideContent}>
            <AccountCircleIcon
              style={{ color: "white", fontSize: "30px" }}
              onClick={handleClickProfile}
            />
            <PowerSettingsNewRoundedIcon
              style={{ color: "white", fontSize: "30px" }}
              onClick={handleClickProfile}
            />
          </div>
        </div>
      </header>

      <div className={`${styles.sidePanel} ${isPanelOpen ? styles.open : ""}`}>
        <div className={styles.panelHeader}>
          <CloseIcon
            style={{ color: "white", fontSize: "30px" }}
            onClick={togglePanel}
          />
        </div>
        <nav className={styles.panelNav}>
          <SideNav />
        </nav>
      </div>
      {isPanelOpen && (
        <div className={styles.overlay} onClick={togglePanel}></div>
      )}
    </>
  );
};

export default Header;
