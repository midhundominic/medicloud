import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./register.module.css";
import TextInput from "../../Common/TextInput";
import Button from "../../Common/Button";
import { toast } from "react-toastify";
import { ROUTES } from "../../../router/routes";
import { regCoordinator } from "../../../services/coordinatorServices";
import PageTitle from "../../Common/PageTitle";
import RadioButton from "../../Common/RadioButton";

const CoordinatorRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    c_password: "",
  });

  const [error, setError] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setError((prevState) => ({ ...prevState, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { firstName, lastName, email, phone, gender, password } = formData;

    try {
      const response = await regCoordinator({
        firstName,
        lastName,
        email,
        phone,
        gender,
        password,
      });

      setError({});
      toast.success("Account created successfully.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "",
        password: "",
        c_password: "",
      });
      navigate(ROUTES.COORDINATOR_REGISTER);
    } catch (error) {
      console.error("Error response:", error.response);
      toast.error(error.response?.data.message || "Error Occurred");
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerBox}>
        <PageTitle>Register a New Care Coordinator</PageTitle>
        <form onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            <TextInput
              type="text"
              title="First Name"
              name="firstName"
              placeholder="Enter First Name"
              value={formData.firstName}
              onChange={handleChange}
              isRequired={true}
              styles={{ inputGroup: styles.customizeInputGroup }}
            />
            <TextInput
              type="text"
              title="Last Name"
              name="lastName"
              placeholder="Enter Last Name"
              value={formData.lastName}
              onChange={handleChange}
              isRequired={true}
              styles={{ inputGroup: styles.customizeInputGroup }}
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
              styles={{ selectBoxRoot: styles.selectBoxRoot }}
            />

            <TextInput
              type="text"
              title="Email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
              isRequired={true}
              styles={{ inputGroup: styles.customizeInputGroup }}
            />
            <TextInput
              type="text"
              title="Phone No"
              name="phone"
              placeholder="Enter Phone number"
              value={formData.phone}
              onChange={handleChange}
              isRequired={true}
              styles={{ inputGroup: styles.customizeInputGroup }}
            />

            <TextInput
              type="text"
              title="Password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              isRequired={true}
              styles={{ inputGroup: styles.customizeInputGroup }}
            />
            <TextInput
              type="text"
              title="Confirm Password"
              name="c_password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              isRequired={true}
              styles={{ inputGroup: styles.customizeInputGroup }}
            />
          </div>
          <div className={styles.buttonContainer}>
            <Button type="submit" name="createcoordinator" styles={{ btnPrimary: styles.newButton }}>
              Create Coordinator
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoordinatorRegistration;
