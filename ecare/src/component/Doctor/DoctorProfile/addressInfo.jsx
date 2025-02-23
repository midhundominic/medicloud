import React from "react";

import styles from "./personalInfo.module.css";
import EditBox from "../../Common/EditButton/editButton";
import TextInfo from "../../Common/TextInfo";

const AddressInfo = () => {
  return (
    <div className={styles.infoRoot}>
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>Address Information</h3>
        <EditBox />
      </div>
      <div className={styles.personalInfoRoot}>
        <TextInfo title="Country" info="India" />
        <TextInfo title="State/Region" info="Kerala" />
        <TextInfo title="City" info="Kochi" />
        <TextInfo title="Postal Code" info="684754" />
      </div>
    </div>
  );
};

export default AddressInfo;
