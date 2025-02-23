import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./pharmacy.module.css";
import TextInput from "../../Common/TextInput";
import Button from "../../Common/Button";
import { toast } from "react-toastify";
import { ROUTES } from "../../../router/routes";
import { regPharmacist } from "../../../services/pharmacyServices";
import PageTitle from "../../Common/PageTitle";


const LaboratoryRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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

    const { name, email, password } = formData;

    try {
      const response = await regPharmacist({
        name,
        email,
        password,
      });

      setError({});
      toast.success("Account created successfully.");
      setFormData({
        name: "",
        email: "",
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
        <PageTitle>Register a New Care Pharmasist</PageTitle>
        <form onSubmit={handleSubmit}>
          <div className={styles.formContent}>
            
            <TextInput
              type="text"
              title="Name"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleChange}
              isRequired={true}
              styles={{ inputGroup: styles.customizeInputGroup }}
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
            <Button type="submit" name="createpharmacy" styles={{ btnPrimary: styles.newButton }}>
              Create Laboratory
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LaboratoryRegistration;
