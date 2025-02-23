import React, { useState } from "react";
import PropTypes from "prop-types";

import styles from "./personalInfo.module.css";
import EditBox from "../../Common/EditButton/editButton";
import TextInfo from "../../Common/TextInfo";
import TextInput from "../../Common/TextInput";
import Button from "../../Common/Button/button";
import UpdateButtons from "./UpdateButtons/updateButtons";
import RadioButton from "../../Common/RadioButton";
import DatePicker from "../../Common/DatePicker";

const PersonalInfo = () => {
  const [formData, setFormData] = useState({ weight: "", height: "" });
  const [formError, setFormError] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setFormError({ ...formError, [name]: "" });
  };

  return (
    <div className={styles.infoRoot}>
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>Personal Information</h3>
        {!isEditing && <EditBox onClick={() => setIsEditing(true)} />}
      </div>
      
    </div>
  );
};

export default PersonalInfo;

PersonalInfo.propTypes = {
  isEdit: PropTypes.bool,
};
