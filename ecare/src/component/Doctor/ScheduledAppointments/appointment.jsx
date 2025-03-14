import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import {
  getDoctorAppointments,
  markPatientAbsent,
  startConsultation,
} from "../../../services/doctorServices";
import styles from "./appointment.module.css";
import { ROUTES } from "../../../router/routes";
import Calendar from "../../Common/Calendar";
import PageTitle from "../../Common/PageTitle";
import { addMinutes } from "../../../utils/helper";
import EventPopover from "./eventPopover";
import { useDoctor } from "../../../context/doctorContext";

const DoctorAppointments = () => {
  const { doctor } = useDoctor();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);
  
  const userData = JSON.parse(localStorage.getItem("userData"));
  const doctorId = userData?.doctorId;

  const fetchDoctorAppointments = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));
      const doctorId = userData?.doctorId;

      if (!doctorId) {
        console.error("Doctor ID not found");
        setLoading(false);
        return;
      }

      const res = await getDoctorAppointments(doctorId);
      if (res && res.data && Array.isArray(res.data.appointments)) {
        const modifiedList = res.data.appointments
          .filter(data => data && data.patientId) // Filter out appointments with null patientId
          .map((data) => {
            const endTime = addMinutes(data.appointmentDate, "25");
            return {
              title: data.patientId?.name || "Unknown Patient",
              start: data.appointmentDate,
              end: endTime,
              status: data.status,
              ...data,
            };
          });
        setAppointments(modifiedList);
      } else {
        console.warn("No appointments found or invalid response format:", res);
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      toast.error("Failed to load appointments. Please try again.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async (appointmentId, callBack) => {
    if (!appointmentId) {
      toast.error("Invalid appointment");
      return;
    }
    
    const confirmed = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mark the patient as absent?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, mark absent",
      cancelButtonText: "Cancel",
    });

    if (confirmed.isConfirmed) {
      try {
        await markPatientAbsent(appointmentId);
        toast.success("Patient marked as absent");
        if (typeof callBack === 'function') {
          callBack();
        }
        fetchDoctorAppointments();
      } catch (error) {
        console.error("Error marking patient as absent:", error);
        toast.error("Error marking patient as absent");
      }
    }
  };

  const handleStartConsultation = async (appointmentId) => {
    if (!appointmentId) {
      toast.error("Invalid appointment");
      return;
    }
    
    try {
      await startConsultation(appointmentId);
      navigate(
        `${ROUTES.DOCTOR_PRESCRIPTION}?appointmentId=${appointmentId}&doctorId=${doctorId}`
      );
    } catch (error) {
      console.error("Error starting consultation:", error);
      toast.error("Error starting consultation");
    }
  };

  const handleUpdatePrescription = (appointmentId) => {
    if (!appointmentId) {
      toast.error("Invalid appointment");
      return;
    }
    
    navigate(
      `${ROUTES.DOCTOR_PRESCRIPTION}?appointmentId=${appointmentId}&doctorId=${doctorId}&mode=update`
    );
  };

  return (
    <div className={styles.docAppointmentRoot}>
      <PageTitle>Appointments</PageTitle>
      {loading ? (
        <div className={styles.loadingContainer}>
          <p>Loading appointments...</p>
        </div>
      ) : (
        <Calendar
          events={appointments}
          renderEventPopover={({ appointment, callBack }) => (
            <EventPopover
              appointment={appointment}
              handleMarkAbsent={(id) => handleMarkAbsent(id, callBack)}
              handleStartConsultation={handleStartConsultation}
              handleUpdatePrescription={handleUpdatePrescription}
            />
          )}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;