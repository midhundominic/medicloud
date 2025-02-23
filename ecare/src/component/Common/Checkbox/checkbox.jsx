import React from "react";
import PropTypes from "prop-types";

import styles from "./checkbox.module.css";

const Checkbox = (props) => {
  const { name, title, value = false, onChange = () => {} } = props;
  return (
    <div className={styles.checkboxRoot}>
      <input 
        type="checkbox" 
        id={name} 
        name={name}
        checked={value} 
        onChange={(e) => onChange(e)} 
        {...props} 
      />
      <label htmlFor={name}>{title}</label>
    </div>
  );
};

export default Checkbox;

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  value: PropTypes.bool,
  onChange: PropTypes.func,
};
