import React from "react";
import Button from "../../Common/Button";
import styles from "./appointment.module.css";

const EventPopover = (props) => {
  const { 
    handleMarkAbsent, 
    handleStartConsultation, 
    handleUpdatePrescription,
    appointment 
  } = props;

  const parsedAppointment = JSON.parse(appointment);
  const {
    title,
    extendedProps: { _id, status, prescription }
  } = parsedAppointment;

  const isCompleted = status === "completed";
  const hasPrescription = !!prescription;

  return (
    <div className={styles.popoverRoot}>
      <span>{title}</span>
      {isCompleted && hasPrescription ? (
        <Button
          onClick={() => handleUpdatePrescription(_id)}
          styles={{ btnPrimary: styles.updateBtn }}
        >
          Update Prescription
        </Button>
      ) : (
        <>
          <Button
            onClick={() => handleMarkAbsent(_id)}
            styles={{ btnPrimary: styles.absentBtn }}
          >
            Mark Absent
          </Button>
          <Button
            onClick={() => handleStartConsultation(_id)}
            styles={{ btnPrimary: styles.startBtn }}
          >
            Start
          </Button>
        </>
      )}
    </div>
  );
};

export default EventPopover;