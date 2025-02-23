import React from "react";
import PropTypes from "prop-types";

import styles from "./nothingToShow.module.css";
import NoDataIcon from "../../../assets/icons/ic_digital_contract.svg";
import CalendarIcon from "../../../assets/icons/ic_calendar.svg";
import Button from "../Button";

const NothingToShow = (props) => {
  const {
    showButton = true,
    showCalendar = false,
    onClick,
    buttonText,
    caption,
  } = props;
  const lines = caption.split("|");

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <img
          src={showCalendar ? CalendarIcon : NoDataIcon}
          alt="No appointments"
          className={showCalendar ? styles.calendarIcon : styles.icon}
        />
        <div className={styles.captionContainer}>
          {lines.map((line) => (
            <span className={styles.caption}>{line}</span>
          ))}
        </div>

        {showButton && (
          <Button styles={{ btnPrimary: styles.customBtn }} onClick={onClick}>
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default NothingToShow;

NothingToShow.propTypes = {
  showButton: PropTypes.bool,
  showCalendar: PropTypes.bool,
  onClick: PropTypes.func,
  buttonText: PropTypes.string,
  caption: PropTypes.string,
};
