import React, { useEffect, useState } from "react";
import {
  getAllAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getUnavailableTimeSlots,
} from "../../../services/adminServices";
import Modal from "react-modal";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "./appointment.css"; 

Modal.setAppElement("#root");

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTimeSlot, setRescheduleTimeSlot] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  
  const timeSlots = [
    "9:30 AM - 10:00 AM",
    "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM",
    "11:00 AM - 11:30 AM",
    "11:30 AM - 12:00 PM",
    "12:00 PM - 12:30 PM",
    "1:30 PM - 2:00 PM",
    "2:00 PM - 2:30 PM",
  ];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await getAllAppointments();
        setAppointments(res);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments.");
      }
    };

    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    try {
      await cancelAppointment(appointmentId);
      toast.success("Appointment canceled successfully");
      setAppointments(appointments.filter((app) => app._id !== appointmentId));
    } catch (error) {
      toast.error("Error canceling appointment");
    }
  };

  const openRescheduleModal = async (appointment) => {
    setSelectedAppointment(appointment);
    setModalIsOpen(true);
    setAvailableTimeSlots(timeSlots); // Reset available time slots
    setRescheduleDate(""); // Reset date
    setRescheduleTimeSlot(""); // Reset time slot
  };

  const handleDateSelect = async (date) => {
    setRescheduleDate(date);

    if (selectedAppointment && date) {
      try {
        const unavailableSlots = await getUnavailableTimeSlots(
          selectedAppointment.doctorId,
          date
        );
        // Filter out unavailable time slots
        setAvailableTimeSlots(timeSlots.filter((slot) => !unavailableSlots.includes(slot)));
      } catch (error) {
        console.error("Error fetching unavailable time slots:", error);
        toast.error("Error fetching time slots. Please try again later.");
      }
    }
  };

  const handleReschedule = async () => {
    try {
      const rescheduleData = {
        appointmentDate: rescheduleDate,
        timeSlot: rescheduleTimeSlot,
      };

      await rescheduleAppointment(selectedAppointment._id, rescheduleData);
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === selectedAppointment._id
            ? {
                ...appointment,
                appointmentDate: rescheduleDate,
                timeSlot: rescheduleTimeSlot,
                status: "rescheduled",
              }
            : appointment
        )
      );
      toast.success("Appointment rescheduled successfully");
      setModalIsOpen(false);
    } catch (error) {
      toast.error("Error rescheduling appointment");
    }
  };

  const getNextSevenDays = () => {
    const days = [];
    let count = 0;
    let index = 0;

    // Loop until we collect 7 non-Sunday days
    while (count < 7) {
      const day = dayjs().add(index, "day");

      // Skip Sundays (day() returns 0 for Sunday)
      if (day.day() !== 0) {
        days.push(day);
        count++;
      }

      index++;
    }

    return days;
  };

  return (
    <div className="appointments-list">
  <h2>All Appointments</h2>
  {appointments && appointments.length > 0 ? (
    appointments.map((appointment) => (
      <div key={appointment._id} className="appointment-card">
        <p>Patient: {appointment.patientId.name}</p>
        <p>
          Doctor: Dr. {appointment.doctorId.firstName}{" "}
          {appointment.doctorId.lastName}
        </p>
        <p>Date: {dayjs(appointment.appointmentDate).format("YYYY-MM-DD")}</p>
        <p>Time Slot: {appointment.timeSlot}</p>
        <p>Status: {appointment.status}</p>
        {appointment.status !== 'completed' && appointment.status !== 'canceled' && (
          <div className="appointment-actions">
            <button
              onClick={() => handleCancel(appointment._id)}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              onClick={() => openRescheduleModal(appointment)}
              className="reschedule-btn"
            >
              Reschedule
            </button>
          </div>
        )}
      </div>
    ))
  ) : (
    <p>No appointments available.</p>
  )}

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="reschedule-modal" overlayClassName="reschedule-modal-overlay">
        <h2>Reschedule Appointment</h2>

        {/* Date selection */}
        <div className="form-group date-picker">
          <label>Select Date:</label>
          <div className="date-options">
            {getNextSevenDays().map((day, index) => (
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

        {/* Time slot selection */}
        <div className="form-group">
          <label>Select Time Slot:</label>
          <div className="time-slot-options">
            {timeSlots.map((slot) => {
              const isUnavailable = !availableTimeSlots.includes(slot);
              return (
                <button
                  key={slot}
                  className={`time-slot-btn ${
                    rescheduleTimeSlot === slot ? "selected" : ""
                  } ${isUnavailable ? "unavailable" : ""}`}
                  onClick={() => !isUnavailable && setRescheduleTimeSlot(slot)}
                  disabled={isUnavailable}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Confirm Reschedule Button */}
        <button className="submit-btn" onClick={handleReschedule}>
          Confirm Reschedule
        </button>
        <button className="cancel-btn" onClick={() => setModalIsOpen(false)}>
          Cancel
        </button>
      </Modal>
    </div>
  );
};

export default AdminAppointments;
