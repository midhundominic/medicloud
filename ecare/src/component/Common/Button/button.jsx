import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { combineStyles } from "../../../utils/combineStyleUtil";

import internalStyles from "./button.module.css";

const Button = (props) => {
  const {
    variant = "primary",
    name,
    children,
    onClick,
    styles: customStyles = {},
    isDisabled = false,
  } = props;

  const styles = combineStyles(internalStyles, customStyles);

  const buttonStyle = useMemo(() => {
    switch (variant) {
      case "primary":
        return styles.btnPrimary;
      case "secondary":
        return styles.btnSecondary;
    }
  });

  return (
    <button
      name={name}
      className={buttonStyle}
      onClick={onClick}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};

export default Button;

Button.propTypes = {
  name: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary"]),
  onclick: PropTypes.func,
  isDisabled: PropTypes.bool,
};
