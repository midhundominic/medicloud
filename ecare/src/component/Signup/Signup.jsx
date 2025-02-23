import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./signup.module.css";
import FrontImage from "../../assets/images/img_front.png";
import TextInput from "../Common/TextInput";
import { ROUTES } from "../../router/routes";
import { postSignup } from "../../services/patientServices";
import LoginButton from "../LoginButton";
import { toast } from "react-toastify";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setformData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState({});

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value) {
          error = "Please enter your name";
        } else if (value.length < 3) {
          error = "Name must be at least 3 characters long";
        }
        break;
      case "email":
        if (!value) {
          error = "Please enter your email";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Enter a valid email";
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
      case "confirmPassword":
        if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setformData((prevState) => ({ ...prevState, [name]: value }));

    // Validate the field as the user types
    const error = validateField(name, value);
    setFormError((prevState) => ({ ...prevState, [name]: error }));
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
      }
    });
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const { name, email, password } = formData;
        const response = await postSignup({ name, email, password });
        
        if (response.success) {
          // Store token and user data
          localStorage.setItem('token', response.token);
          localStorage.setItem('userData', JSON.stringify(response.data));
          
          setFormError({});
          toast.success("Account created successfully!");
          
          // Clear form data
          setformData({
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          });
          
          navigate(ROUTES.LOGIN);
        } else {
          toast.error(response.message || "Signup failed");
        }
      } catch (error) {
        console.error("Error during signup:", error);
        toast.error(error.response?.data?.message || "Error occurred during signup");
      }
    } else {
      setFormError(validationErrors);
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupBox}>
        <span className={styles.signupTitle}>Welcome!</span>
        <span className={styles.signupSubtitle}>Create an Account</span>

        <form onSubmit={handleSubmit}>
          <TextInput
            type="text"
            title="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your Name"
            isRequired={true}
            error={formError["name"]}
          />

          <TextInput
            type="text"
            title="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            isRequired={true}
            error={formError["email"]}
          />

          <TextInput
            type="password"
            title="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            isRequired={true}
            error={formError["password"]}
          />

          <TextInput
            type="password"
            title="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm Password"
            isRequired={true}
            error={formError["confirmPassword"]}
          />
          <div className={styles.buttonWrapper}>
            <LoginButton
              primaryText="Signup"
              secondaryText="Signup with Google"
            />
          </div>
        </form>
        <div className={styles.signinLink}>
          Have an account?
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(ROUTES.LOGIN);
            }}
          >
            Sign In
          </a>
        </div>
      </div>
      <div className={styles.imageWrapper}>
        <img className={styles.frontImage} src={FrontImage} alt="Signup" />
      </div>
    </div>
  );
};

export default Signup;
