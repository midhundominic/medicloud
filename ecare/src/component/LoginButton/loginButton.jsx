import React, { useState } from "react";
import PropTypes from "prop-types";

import "./loginButton.css";
import googleIcon from "../../assets/icons/ic_google.png";
import rightArrow from "../../assets/icons/ic_arrow_right.png";

const LoginButton = (props) => {
  const {
    id,
    primaryText,
    secondaryText,
    onGoogleSignIn,
    isDisabled = false,
  } = props;
  const [isGoogleHovered, setIsGoogleHovered] = useState(false);

  return (
    <div className="buttons-container">
      <button
        id={id}
        type="submit"
        className={`login-btn ${isGoogleHovered ? "round" : ""}`}
        disabled={isDisabled}
      >
        <span className="login-text">{primaryText}</span>
        <img src={rightArrow} alt="Continue" className="arrow-icon" />
      </button>
      <button
        type="button"
        className="google-login-btn"
        onClick={onGoogleSignIn}
        onMouseEnter={() => setIsGoogleHovered(true)}
        onMouseLeave={() => setIsGoogleHovered(false)}
        disabled={isDisabled}
      >
        <img src={googleIcon} alt="Google logo" className="google-icon" />
        <span className="login-text">{secondaryText}</span>
      </button>
    </div>
  );
};

export default LoginButton;

LoginButton.propTypes = {
  id: PropTypes.string, 
  primaryText: PropTypes.string.isRequired,
  secondaryText: PropTypes.string.isRequired,
  onGoogleSignIn: PropTypes.func,
  isDisabled: PropTypes.bool,
};
