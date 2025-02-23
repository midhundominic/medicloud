import React from "react";
import PropTypes from "prop-types";

import { combineStyles } from "../../../utils/combineStyleUtil";
import internalStyles from "./textInput.module.css";

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
    isTextArea = false, // Add a prop to distinguish between input and textarea
    rows = 5, // Default rows for textarea
  } = props;

  const styles = combineStyles(internalStyles, customStyles);

  return (
    <div className={styles.inputGroup}>
      <div className={styles.labelWrapper}>
        <label htmlFor={name}>{title}</label>
        {isRequired && <span className={styles.required}>*</span>}
      </div>

      {/* Conditionally render input or textarea based on the prop */}
      {isTextArea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={onFocus}
          rows={rows} // Allow the number of rows to be configurable
          className={`${styles.input} ${error ? styles.inputError : ""}`}
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={onFocus}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
        />
      )}

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
  isTextArea: PropTypes.bool, // New prop to switch between input and textarea
  rows: PropTypes.number, // Prop to control textarea rows
};

export default TextInput;
