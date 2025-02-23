import { styled } from "@mui/material";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { postSignin } from "../../../services/adminServices";
import { ROUTES } from "../../../router/routes";
import { useNavigate } from "react-router-dom";

import TextInput from "../../Common/TextInput";
import styles from "./login.module.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
    setError((prevState) => ({ ...prevState, [name]: "" }));
  };

  const validateForm = () => {
    const { email, password } = formData;
    let errors = {};
    if (!email) {
      errors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Enter a valid email";
    }
    if (!password) {
      errors.password = "Please enter your password";
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        setIsLoading(true);
        const { email, password } = formData;
        const response = await postSignin({ email, password });
        setIsLoading(false);
        setError({});

        toast.success("Login Successful.");
        setFormData({
          email: "",
          password: "",
        });
        if (response.data) {
          localStorage.setItem("userData",JSON.stringify(response.data));
          localStorage.setItem('token', JSON.stringify(response.token)); 
          navigate(ROUTES.ADMIN_HOME);
        }
      } catch (err) {
        setIsLoading(false);
        toast.error(err.response?.data.message || "Error Occurred");
      }
    } else {
      setError(validationErrors);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <span className={styles.loginTitle}>Admin Login</span>
        <span className={styles.loginSubtitle}>Enter your Credential</span>
        <form onSubmit={handleSubmit}>
          <TextInput
            type="text"
            title="Email"
            name="email"
            placeholder="Enter your Email"
            value={formData.email}
            id="email"
            onChange={handleChange}
            error={error.email}
          />
          <TextInput
            type="password"
            title="Password"
            name="password"
            id= "password"
            placeholder="Enter your Password"
            value={formData.password}
            onChange={handleChange}
            error={error.password}
          />
          <button type="submit" id="submitbutton" className={styles.submitButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
