import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./personalInfo.module.css";
import EditBox from "../../Common/EditButton/editButton";
import TextInfo from "../../Common/TextInfo";
import TextInput from "../../Common/TextInput";
import UpdateButtons from "./updateButtons/updateButtons";
import RadioButton from "../../Common/RadioButton";


const PersonalInfo = ({ profileData, isEditing, handleSave, setIsEditing }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "", // Email will be fetched from localStorage
    phone: "",
    gender: "", // Provide a default value for gender
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
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      gender: profileData.gender || "male", // Set default value if empty
      phone: profileData.phone || "",
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
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your name"
              isRequired={true}
            />

            <TextInput
              type="text"
              title="Last Name"
              name="lastName"
              value={formData.lastName}
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
            <TextInput
              type="text"
              title="Phone"
              name="phone"
              value={formData.phone} 
              onChange={handleChange}
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
          </div>
          <UpdateButtons
            handleClickCancel={handleCancel}
            handleClickSave={handleSaveClick}
          />
        </>
      ) : (
        <div className={styles.personalInfoRoot}>
          {/* Display text info when not editing */}
          <TextInfo title="First Name" info={formData.firstName || "N/A"} />
          <TextInfo title="Last Name" info={formData.lastName || "N/A"} />
          <TextInfo title="Email" info={formData.email || "N/A"} />
          <TextInfo title="phone" info={formData.phone || "N/A"} />
          
          <TextInfo title="Gender" info={formData.gender || "N/A"} />
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
