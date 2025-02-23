import React, { useState } from "react";
import Modal from "react-modal";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  rescheduleAppointment,
  getUnavailableTimeSlots,
} from "../../../services/appointmentServices";
// import "./rescheduleAppointment.css";

Modal.setAppElement("#root");

const RescheduleAppointment = ({
  appointment,
  timeSlots,
  availableDates,
  onReschedule,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState(timeSlots);
  const [unavailableSlots, setUnavailableSlots] = useState([]); // Track unavailable slots

  const openModal = () => {
    setModalIsOpen(true);
    setAvailableTimeSlots(timeSlots); // Reset available time slots
    setRescheduleDate(""); // Reset date
    setRescheduleTimeSlot(""); // Reset time slot
  };

  const handleDateSelect = async (date) => {
    setRescheduleDate(date);
    const isToday = dayjs().format("YYYY-MM-DD") === date;
    let filteredTimeSlots = timeSlots;
  
    if (isToday) {
      const currentTime = dayjs();
      filteredTimeSlots = timeSlots.filter((slot) => {
        const [startTime] = slot.split(" - ");
        const slotTime = dayjs(`${date} ${startTime}`, "YYYY-MM-DD h:mm A");
        return slotTime.isAfter(currentTime);
      });
    }
  
    try {
      const unavailable = await getUnavailableTimeSlots(appointment.doctorId._id, date);
      const unavailableArray = Array.isArray(unavailable.data.unavailableSlots) ? unavailable.data.unavailableSlots : [];
      setUnavailableSlots(unavailableArray);
      setAvailableTimeSlots(filteredTimeSlots);
    } catch (error) {
      console.error("Error fetching unavailable time slots:", error);
      toast.error("Error fetching time slots. Please try again later.");
    }
  };  

  const handleReschedule = async () => {
    try {
      const rescheduleData = {
        appointmentDate: rescheduleDate,
        timeSlot: rescheduleTimeSlot,
      };

      await rescheduleAppointment(appointment._id, rescheduleData);

      onReschedule(appointment._id, rescheduleDate, rescheduleTimeSlot);

      toast.success("Appointment rescheduled successfully");
      setModalIsOpen(false);
    } catch (error) {
      toast.error("Error rescheduling appointment");
    }
  };

  return (
    <>
      <button onClick={openModal} className="reschedule-btn">
        Reschedule
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="reschedule-modal"
        overlayClassName="reschedule-modal-overlay"
      >
        <h2>Reschedule Appointment</h2>
        <div className="form-group date-picker">
          <label>Select Date:</label>
          <div className="date-options">
            {availableDates.map((day, index) => (
              <button
                key={index}
                className={`date-btn ${
                  rescheduleDate === day.format("YYYY-MM-DD") ? "selected" : ""
                }`}
                onClick={() => handleDateSelect(day.format("YYYY-MM-DD"))}
              >
                <div>{day.format("ddd").toUpperCase()}</div>
                <div>{day.format("DD")}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Select Time Slot:</label>
          <div className="time-slot-options">
            {availableTimeSlots.map((slot) => (
              <button
                key={slot}
                className={`time-slot-btn ${
                  rescheduleTimeSlot === slot ? "selected" : ""
                } ${unavailableSlots.includes(slot) ? "unavailable" : ""}`}
                onClick={() => {
                  if (!unavailableSlots.includes(slot)) {
                    setRescheduleTimeSlot(slot);
                  }
                }}
                disabled={unavailableSlots.includes(slot)} // Disable if unavailable
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <button className="submit-btn" onClick={handleReschedule}>
          Confirm Reschedule
        </button>
        <button className="cancel-btn" onClick={() => setModalIsOpen(false)}>
          Cancel
        </button>
      </Modal>
    </>
  );
};

export default RescheduleAppointment;
