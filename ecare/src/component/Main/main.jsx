import React from "react";
import Header from "../Header";
import styles from "./main.module.css";
import SideNav from "../SideNav";

const Main = ({ children }) => {
  return (
    <div className={styles.mainContainer}>
      <Header />
      <div className={styles.sidePanelDesktop}>
        <nav className={styles.panelNav}>
          <SideNav />
        </nav>
      </div>
      <div className={styles.mainContent}>{children}</div>
    </div>
  );
};

export default Main;
