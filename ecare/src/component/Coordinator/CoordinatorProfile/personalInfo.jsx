import React, { useState } from "react";
import PropTypes from "prop-types";
import EditBox from "../../Common/EditButton/editButton";
import TextInfo from "../../Common/TextInfo";
import TextInput from "../../Common/TextInput";
import UpdateButtons from "../CoordinatorProfile/UpdateButtons/updateButtons";
import RadioButton from "../../Common/RadioButton";
import DatePicker from "../../Common/DatePicker";
import styles from "./personalInfo.module.css";

const PersonalInfo = ({ profileData, isEditing, setIsEditing, handleSave }) => {
  const [formData, setFormData] = useState(profileData);
  const [formError, setFormError] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setFormError({ ...formError, [name]: "" });
  };

  const handleSaveClick = () => {
    // You can add validation here before saving
    handleSave(formData);
  };

  return (
    <div className={styles.infoRoot}>
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>Personal Information</h3>
        {!isEditing && <EditBox onClick={() => setIsEditing(true)} />}
      </div>

      {isEditing ? (
        <>
          <div className={styles.personalInfoRoot}>
            <TextInput
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <TextInput
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <DatePicker
              name="dob"
              title="Date of birth"
              value={formData.dob}
              onChange={handleChange}
            />
            <RadioButton
              isRequired
              name="gender"
              title="Gender"
              value={formData.gender}
              onChange={handleChange}
              labels={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "others", label: "Others" },
              ]}
            />
          </div>
          <UpdateButtons
            handleClickCancel={() => setIsEditing(false)}
            handleClickSave={handleSaveClick}
          />
        </>
      ) : (
        <div className={styles.personalInfoRoot}>
          <TextInfo title="First Name" info={profileData.firstName} />
          <TextInfo title="Last Name" info={profileData.lastName} />
          <TextInfo title="Date of Birth" info={profileData.dob} />
          <TextInfo title="Gender" info={profileData.gender} />
        </div>
      )}
    </div>
  );
};

PersonalInfo.propTypes = {
  profileData: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  setIsEditing: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
};

export default PersonalInfo;
