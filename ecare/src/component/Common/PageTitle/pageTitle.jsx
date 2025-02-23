import React from "react";
import styles from "./pageTitle.module.css";

const PageTitle = ({ children }) => {
  return <h2 className={styles.title}>{children}</h2>;
};

export default PageTitle;
