import React, { useState } from "react";
import PropTypes from "prop-types";
import { combineStyles } from "../../../utils/combineStyleUtil";
import internalStyles from "./TextInputPassword.module.css";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const TextInput = (props) => {
  const {
    type,
    name,
    value,
    title = "",
    placeholder = "",
    isRequired = false,
    onChange = () => {},
    onFocus = () => {},
    error = "",
    styles: customStyles = {},
  } = props;

  const styles = combineStyles(internalStyles, customStyles);

  // State to manage visibility of password
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  // Determine input type based on state and props
  const inputType = type === "password" && isPasswordVisible ? "text" : type;

  return (
    <div className={styles.inputGroup}>
      <div className={styles.labelWrapper}>
        <label htmlFor={name}>{title}</label>
        {isRequired && <span className={styles.required}>*</span>}
      </div>
      <div className={styles.inputWrapper}>
        <input
          type={inputType}
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={onFocus}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
        />
        {type === "password" && (
          <span
            className={styles.passwordToggle}
            onClick={togglePasswordVisibility}
            role="button"
            aria-label="Toggle password visibility"
          >
            {isPasswordVisible ? (
              <VisibilityOff className={styles.icon} />
            ) : (
              <Visibility className={styles.icon} />
            )}
          </span>
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

TextInput.propTypes = {
  type: PropTypes.oneOf(["email", "password", "text"]).isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  title: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  isRequired: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
};

export default TextInput;
