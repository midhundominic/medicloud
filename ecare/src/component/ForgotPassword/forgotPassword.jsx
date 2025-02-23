import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { passwordForgot } from "../../services/passwordServices";
import { ROUTES } from "../../router/routes";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = async () => {
    try {
      const response = await passwordForgot({ email });
      if (response.error) {
        setError(response.msg);
      } else {
        setSuccess("Verification code sent to your email.");
        navigate(ROUTES.VARIFY_CODE, { state: { email } });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Forgot Password</h2>
      {error && <p style={styles.errorMsg}>{error}</p>}
      {success && <p style={styles.successMsg}>{success}</p>}
      <TextField
        label="Enter your email"
        value={email}
        onChange={handleEmailChange}
        variant="outlined"
        fullWidth
        style={styles.textField}
      />
      <div style={styles.buttonContainer}>
        <Button
          onClick={handleResetPassword}
          variant="contained"
          color="primary"
          style={styles.resetButton}
        >
          Reset Password
        </Button>
        <Button
          onClick={() => navigate("/")}
          variant="outlined"
          color="secondary"
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
    borderRadius: "12px",
    maxWidth: "400px",
    margin: "auto",
  },
  heading: {
    marginBottom: "20px",
    color: "#333",
    fontWeight: "600",
  },
  errorMsg: {
    color: "red",
    marginBottom: "10px",
    fontSize: "14px",
  },
  successMsg: {
    color: "green",
    marginBottom: "10px",
    fontSize: "14px",
  },
  textField: {
    marginBottom: "20px",
    borderRadius: "8px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  resetButton: {
    flex: 1,
    marginRight: "10px",
    backgroundColor: "#007BFF",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: "8px",
    fontSize: "16px",
    textTransform: "none",
  },
  cancelButton: {
    flex: 1,
    padding: "10px 15px",
    borderRadius: "8px",
    fontSize: "16px",
    textTransform: "none",
    color: "#333",
    borderColor: "#333",
  },
};

export default ForgotPassword;
