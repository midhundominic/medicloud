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
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const doctorId = userData?.doctorId;

      if (!doctorId) {
        console.error("Doctor ID not found");
        return;
      }

      const res = await getDoctorAppointments(doctorId);
      if (res && res.data && res.data.appointments) {
        const modifiedList = res.data.appointments.map((data) => {
          const endTime = addMinutes(data.appointmentDate, "25");
          return {
            title: data.patientId.name,
            start: data.appointmentDate,
            end: endTime,
            status: data.status,
            ...data,
          };
        });
        setAppointments(modifiedList);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
    }
  };

  const handleMarkAbsent = async (appointmentId, callBack) => {
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
        callBack();
        fetchDoctorAppointments();
      } catch (error) {
        toast.error("Error marking patient as absent");
      }
    }
  };

  const handleStartConsultation = async (appointmentId) => {
    try {
      await startConsultation(appointmentId);
      navigate(
        `${ROUTES.DOCTOR_PRESCRIPTION}?appointmentId=${appointmentId}&doctorId=${doctor?.doctorId}`
      );
    } catch (error) {
      toast.error("Error starting consultation");
    }
  };

  const handleUpdatePrescription = (appointmentId) => {
    navigate(
      `${ROUTES.DOCTOR_PRESCRIPTION}?appointmentId=${appointmentId}&doctorId=${doctor?.doctorId}&mode=update`
    );
  };

  return (
    <div className={styles.docAppointmentRoot}>
      <PageTitle>Appointments</PageTitle>
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
    </div>
  );
};

export default DoctorAppointments;