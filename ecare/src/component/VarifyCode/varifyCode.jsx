import React, { useState } from "react";
import Button from "@mui/material/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { codeVarify } from "../../services/passwordServices";
import { ROUTES } from "../../router/routes";
import TextInput from "../Common/TextInput";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  const email = location.state?.email;

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleVerifyCode = async () => {
    try {
      const response = await codeVarify({ email, code });
      if (response.error) {
        setError(response.msg);
      } else {
        navigate(ROUTES.RESET_PASSWORD, { state: { email } });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Verify Code</h2>
      {error && <p style={styles.errorMsg}>{error}</p>}
      <TextInput
        label="Enter 4-digit code"
        name="code"
        value={code}
        onChange={handleCodeChange}
        variant="outlined"
        fullWidth
        style={styles.textField}
      />
      <div style={styles.buttonContainer}>
        <Button
          onClick={handleVerifyCode}
          variant="contained"
          color="primary"
          style={styles.verifyButton}
        >
          Verify Code
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
    textAlign: "center",
  },
  errorMsg: {
    color: "red",
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
  verifyButton: {
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

export default VerifyCode;
