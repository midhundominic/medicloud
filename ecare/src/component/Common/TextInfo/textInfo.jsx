import React from "react";
import PropTypes from "prop-types";

import styles from "./textInfo.module.css";

const TextInfo = (props) => {
  const { title, info } = props;
  return (
    <div className={styles.textInfoRoot}>
      <span className={styles.textInfoTitle}>{title}</span>
      <span className={styles.textInfoInfo}>{info}</span>
    </div>
  );
};

export default TextInfo;

TextInfo.propTypes = {
  title: PropTypes.string.isRequired,
  info: PropTypes.string,
};
