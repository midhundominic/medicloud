import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Button, Paper, CircularProgress } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import Carousel from "./carousel";
import hospitalImages from "./hospitalImages";
import styles from "./patientHome.module.css";
import { ROUTES } from "../../../router/routes";
import { getAppointments } from "../../../services/appointmentServices";
import { toast } from 'react-toastify';

const PatientHome = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    // Carousel Auto-play
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === hospitalImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    // Fetch upcoming appointments
    fetchUpcomingAppointments();

    return () => clearInterval(interval);
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));
      const patientId = userData?.userId;
      const response = await getAppointments(patientId);
      
      if (response.data && response.data.appointments) {
        // Filter for upcoming appointments only
        const upcomingAppts = response.data.appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentDate);
          return appointmentDate >= new Date();
        });

        // Sort by date (nearest first)
        upcomingAppts.sort((a, b) => 
          new Date(a.appointmentDate) - new Date(b.appointmentDate)
        );

        // Take only the next 3 appointments
        setUpcomingAppointments(upcomingAppts.slice(0, 3));
      } else {
        setUpcomingAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments");
      setUpcomingAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Book Appointment",
      icon: <CalendarMonthIcon />,
      route: ROUTES.PATIENT_APPOINTMENT,
      color: "#4CAF50"
    },
    {
      title: "My Records",
      icon: <MedicalInformationIcon />,
      route: ROUTES.PATIENT_RECORDS,
      color: "#2196F3"
    },
    {
      title: "Find Doctor",
      icon: <LocalHospitalIcon />,
      route: ROUTES.PATIENT_DOCTOR,
      color: "#9C27B0"
    },
    {
      title: "Health Tips",
      icon: <HealthAndSafetyIcon />,
      route: ROUTES.PATIENT_HEALTH_TIPS,
      color: "#FF9800"
    }
  ];

  return (
    <div className={styles.homeContainer}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.greeting}>
            Welcome back, {userData?.name || "Patient"}!
          </h1>
          <p className={styles.subtitle}>How are you feeling today?</p>
        </div>
        <IconButton className={styles.notificationBtn}>
          <NotificationsIcon />
          <span className={styles.notificationBadge}></span>
        </IconButton>
      </div>

      {/* Carousel Section */}
      <Paper elevation={3} className={styles.carouselWrapper}>
        <Carousel images={hospitalImages} currentIndex={currentIndex} />
      </Paper>

      {/* Quick Actions */}
      <div className={styles.quickActionsContainer}>
        <h2 className={styles.sectionTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <Paper 
              key={index}
              className={styles.actionCard}
              onClick={() => navigate(action.route)}
              style={{ borderTop: `4px solid ${action.color}` }}
            >
              <div className={styles.actionIcon} style={{ color: action.color }}>
                {action.icon}
              </div>
              <h3 className={styles.actionTitle}>{action.title}</h3>
            </Paper>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className={styles.appointmentsSection}>
        <h2 className={styles.sectionTitle}>Upcoming Appointments</h2>
        {loading ? (
          <div className={styles.loadingContainer}>
            <CircularProgress />
          </div>
        ) : upcomingAppointments.length > 0 ? (
          <div className={styles.appointmentsGrid}>
            {upcomingAppointments.map((appointment, index) => (
              <Paper key={index} className={styles.appointmentCard}>
                <div className={styles.appointmentInfo}>
                  <h4>
                    Dr. {appointment.doctorId?.firstName} {appointment.doctorId?.lastName}
                  </h4>
                  <p>{appointment.doctorId?.specialization}</p>
                  <p>
                    {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.timeSlot}
                  </p>
                </div>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => navigate(`/appointments/${appointment._id}`)}
                >
                  View Details
                </Button>
              </Paper>
            ))}
          </div>
        ) : (
          <Paper className={styles.noAppointments}>
            <p>No upcoming appointments</p>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate(ROUTES.PATIENT_APPOINTMENT)}
            >
              Book Now
            </Button>
          </Paper>
        )}
      </div>

      {/* Health Stats Section */}
      <div className={styles.healthStatsSection}>
        <h2 className={styles.sectionTitle}>Your Health Overview</h2>
        <div className={styles.statsGrid}>
          {/* Add health statistics cards here */}
        </div>
      </div>
    </div>
  );
};

export default PatientHome;