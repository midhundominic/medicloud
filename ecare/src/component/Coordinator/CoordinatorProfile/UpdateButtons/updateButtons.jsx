import React from "react";
import PropTypes from "prop-types";
import styles from "./updateButtons.module.css";

const EditButton = ({ onClick }) => {
  return (
    <button className={styles.editButton} onClick={onClick}>
      Edit
    </button>
  );
};

EditButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default EditButton;
