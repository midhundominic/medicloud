import React from "react";
import PropTypes from "prop-types";

import internalStyles from "./selectBox.module.css";
import { combineStyles } from "../../../utils/combineStyleUtil";

const SelectBox = (props) => {
  const {
    name,
    title,
    value,
    onChange,
    styles: customStyles,
    options,
    isRequired = false,
    error,
  } = props;
  const styles = combineStyles(internalStyles, customStyles);

  return (
    <div className={styles.selectBoxRoot}>
      <div className={styles.labelWrapper}>
        <label htmlFor={name}>{title}</label>
        {isRequired && <span className={styles.required}>*</span>}
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={styles.inputField}
      >
        {options.map((item) => {
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectBox;

SelectBox.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  error: PropTypes.string,
  isRequired: PropTypes.bool,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
};
