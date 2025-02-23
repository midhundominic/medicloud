import React from "react";
import PropTypes from "prop-types";

import Button from "../../../Common/Button/button";
import styles from "./updateButtons.module.css";

const UpdateButtons = ({
  handleClickCancel = () => {},
  handleClickSave = () => {},
}) => {
  return (
    <div className={styles.buttonContainer}>
      <Button variant="secondary" onClick={handleClickCancel}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleClickSave}>
        Save
      </Button>
    </div>
  );
};

export default UpdateButtons;

UpdateButtons.propTypes = {
  handleClickCancel: PropTypes.func,
  handleClickSave: PropTypes.func,
};
