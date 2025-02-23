import React from "react";
import PropTypes from "prop-types";
import DriveFileRenameOutlineRoundedIcon from "@mui/icons-material/DriveFileRenameOutlineRounded";

import styles from "./editButton.module.css";

const EditBox = ({ onClick = () => {} }) => {
  return (
    <div className={styles.editBoxRoot} onClick={onClick}>
      Edit
      <DriveFileRenameOutlineRoundedIcon
        style={{ color: "#3d85ba", fontSize: "18px" }}
      />
    </div>
  );
};

export default EditBox;

EditBox.propTypes = {
  onClick: PropTypes.func,
};
