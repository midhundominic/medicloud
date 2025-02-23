import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./personalInfo.module.css";
import EditBox from "../../Common/EditButton/editButton";
import TextInfo from "../../Common/TextInfo";
import TextInput from "../../Common/TextInput";
import UpdateButtons from "./UpdateButtons/updateButtons";
import RadioButton from "../../Common/RadioButton";
import DatePicker from "../../Common/DatePicker";
import dayjs from "dayjs";

const PersonalInfo = ({ profileData, isEditing, handleSave, setIsEditing }) => {
  const [formData, setFormData] = useState({
    name: profileData.name || "",
    email: "", // Email will be fetched from localStorage
    dateOfBirth: profileData.dateOfBirth
      ? dayjs(profileData.dateOfBirth)
      : null,
    gender: profileData.gender || "male", // Provide a default value for gender
    weight: profileData.weight || "",
    height: profileData.height || "",
  });

  useEffect(() => {
    // Fetch the email from localStorage
    const fetchEmail = () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const email = userData?.email || "";
      setFormData((prevState) => ({ ...prevState, email }));
    };

    fetchEmail();

    setFormData((prevState) => ({
      ...prevState,
      name: profileData.name || "",
      dateOfBirth: profileData.dateOfBirth
        ? dayjs(profileData.dateOfBirth)
        : null,
      gender: profileData.gender || "", // Set default value if empty
      weight: profileData.weight || "",
      height: profileData.height || "",
    }));
  }, [profileData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSaveClick = () => {
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
            {/* Name Field */}
            <TextInput
              type="text"
              title="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              isRequired={true}
            />

            {/* Email Field (non-editable) */}
            <TextInput
              type="email"
              title="Email"
              name="email"
              value={formData.email} 
              disabled
            />

            {/* Date of Birth Field */}
            <DatePicker
              name="dateOfBirth"
              title="Date of birth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              isRequired
            />

            {/* Gender Field */}
            <RadioButton
              isRequired
              name="gender"
              title="Gender"
              value={formData.gender} // Ensure value is set, default "male"
              labels={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "others", label: "Others" },
              ]}
              onChange={handleChange}
            />

            <TextInput
              type="text"
              title="Weight"
              name="weight"
              value={formData.weight?.toString() || ""}
              onChange={handleChange}
              placeholder="Enter your weight"
              isRequired={true}
            />
            <TextInput
              type="text"
              title="Height"
              name="height"
              value={formData.height?.toString() || ""}
              onChange={handleChange}
              placeholder="Enter your height"
              isRequired={true}
            />
          </div>
          <UpdateButtons
            handleClickCancel={handleCancel}
            handleClickSave={handleSaveClick}
          />
        </>
      ) : (
        <div className={styles.personalInfoRoot}>
          {/* Display text info when not editing */}
          <TextInfo title="Name" info={formData.name || "N/A"} />
          <TextInfo title="Email" info={formData.email || "N/A"} />
          <TextInfo
            title="Date of Birth"
            info={
              formData.dateOfBirth
                ? dayjs(formData.dateOfBirth).format("DD-MM-YYYY")
                : "N/A"
            }
          />
          <TextInfo title="Gender" info={formData.gender || "N/A"} />
          <TextInfo title="Weight" info={`${formData.weight || "N/A"} kg`} />
          <TextInfo title="Height" info={`${formData.height || "N/A"} cm`} />
        </div>
      )}
    </div>
  );
};

export default PersonalInfo;

PersonalInfo.propTypes = {
  profileData: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  handleSave: PropTypes.func.isRequired,
  setIsEditing: PropTypes.func.isRequired,
};
