import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./register.module.css";
import TextInput from "../../Common/TextInput";
import Button from "../../Common/Button";
import SelectBox from "../../Common/SelectBox";
import { regDoctor } from "../../../services/doctorServices";
import { ROUTES } from "../../../router/routes";
import RadioButton from "../../Common/RadioButton";

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    y_experience: "",
    gender: "",
    password: "",
    c_password: "",
    aboutDoctor: "",
  });

  const [formError, setFormError] = useState({});

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
        if (!value) {
          error = "First name is required";
        } else if (value.length < 3) {
          error = "First name must be at least 3 characters long";
        }
        break;
      case "lastName":
        if (!value) error = "Last name is required";
        break;
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) error = "Enter a valid email";
        break;
      case "phone":
        if (!value) {
          error = "Phone number is required";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Phone number must be exactly 10 digits and contain only numbers";
        }
        break;
      case "password":
        if (!value) {
          error = "Please enter a password";
        } else if (!/[!@#$%^&*(),.?":{}|<>]/g.test(value)) {
          error = "Password must contain at least one special character";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters long";
        }
        break;
      case "c_password":
        if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      case "aboutDoctor":
        if (value.length < 50) {
          error = "About section must be at least 50 characters long";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));

    // Live validation
    const error = validateField(name, value);
    setFormError((prevState) => ({ ...prevState, [name]: error }));
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await regDoctor(formData);
        toast.success("Doctor registered successfully.");
        
        // Clear form data after successful registration
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          specialization: "",
          experience: "",
          y_experience: "",
          gender: "",
          password: "",
          c_password: "",
          aboutDoctor: "",
        });

        // Navigate to doctor list
        navigate(ROUTES.ADMIN_DOC_LIST);
      } catch (error) {
        toast.error(error.response?.data.message || "Error Occurred");
      }
    } else {
      setFormError(validationErrors);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <h2>Register a New Doctor</h2>
        <form onSubmit={handleSubmit}>
          <TextInput
            type="text"
            title="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            isRequired
            error={formError.firstName}
          />
          <TextInput
            type="text"
            title="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            isRequired
            error={formError.lastName}
          />
          <TextInput
            type="email"
            title="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            isRequired
            error={formError.email}
          />

          <SelectBox
            name="experience"
            title="Experience Level"
            value={formData.experience}
            isRequired
            onChange={handleChange}
            options={[
              { value: "", label: "Select an option" },
              { value: "senior", label: "Senior" },
              { value: "junior", label: "junior" },
              { value: "mid-level", label: "Mid-Level" },
            ]}
            styles={{ selectBoxRoot: styles.selectBoxRoot }}
          />

          <RadioButton
            isRequired
            name="gender"
            title="Gender"
            labels={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "others", label: "Others" },
            ]}
            onChange={handleChange}
          />
          <TextInput
            type="text"
            title="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            isRequired
            error={formError.phone}
          />
          <SelectBox
            name="specialization"
            title="Specialization"
            value={formData.specialization}
            onChange={handleChange}
            isRequired
            error={formError.specialization}
            options={[
              { value: "", label: "Select Specialization" },
              { value: "General Medicine", label: "General Medicine" },
              { value: "Dermatology", label: "Dermatology" },
              { value: "Gynecology", label: "Gynecology" },
              { value: "Neurology", label: "Neurology" },
              { value: "Gastroenterology", label: "Gastroenterology" },
              { value: "General Surgery", label: "General Surgery" },
            ]}
          />

          <SelectBox
            name="y_experience"
            title="Year of Experience"
            value={formData.y_experience}
            isRequired
            onChange={handleChange}
            options={[
              { value: "", label: "Select an option" },
              { value: "0-2", label: "0-2 Years" },
              { value: "3-5", label: "3-5 Years" },
              { value: ">6", label: "More than 6 Years" },
            ]}
            styles={{ selectBoxRoot: styles.selectBoxRoot }}
          />

          <TextInput
            type="password"
            title="Password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            isRequired={true}
            styles={{ inputGroup: styles.customizeInputGroup }}
            error={formError.password}
          />
          <TextInput
            type="password"
            title="Confirm Password"
            name="c_password"
            placeholder="Confirm password"
            value={formData.c_password}
            onChange={handleChange}
            isRequired={true}
            styles={{ inputGroup: styles.customizeInputGroup }}
            error={formError.c_password}
          />

          <TextInput
            title="About Doctor"
            name="aboutDoctor"
            value={formData.aboutDoctor}
            onChange={handleChange}
            isRequired
            placeholder="Write about the doctor"
            isTextArea={true} // Set this to true to use textarea
            rows={6}
            error={formError.aboutDoctor}
          />

          <Button id="createDoctorButton" name="createdoctor" type="submit">Create Doctor</Button>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegistration;
