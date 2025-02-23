import React from "react";
import PropTypes from "prop-types";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker as DatePickerMui } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs"; // Make sure to import this if you need date formatting or operations

import styles from "./datePicker.module.css";

const DatePicker = ({
  value,
  isRequired = false,
  name,
  title,
  onChange = () => {},
  error,
}) => {
  return (
    <div className={styles.datePickerRoot}>
      <div className={styles.labelWrapper}>
        <label htmlFor={name}>{title}</label>
        {isRequired && <span className={styles.required}>*</span>}
      </div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePickerMui
          sx={{ maxWidth: "20rem" }}
          value={value}
          onChange={(newValue) =>
            onChange({ target: { name, value: newValue } })
          } // Trigger the parent's onChange
        />
      </LocalizationProvider>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default DatePicker;

DatePicker.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  error: PropTypes.string,
  isRequired: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
};
