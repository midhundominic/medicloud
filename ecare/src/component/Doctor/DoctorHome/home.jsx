import React, { useState, useEffect } from 'react';
import { Grid, Card, Typography, Box } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MedicationIcon from '@mui/icons-material/Medication';
import { getDoctorDashboardStats } from '../../../services/doctorServices';
import styles from "./doctorHome.module.css";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ icon, title, value, color }) => (
  <Card className={styles.statCard}>
    <Box className={styles.iconWrapper} style={{ backgroundColor: color }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h6">{value}</Typography>
      <Typography variant="body2" color="textSecondary">{title}</Typography>
    </Box>
  </Card>
);

const DoctorHome = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    appointmentsByStatus: [],
    upcomingAppointments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem("userData"));
        const doctorId = userData?.doctorId;
        if (!doctorId) {
          setError("User ID not found");
          return;
        }

        const response = await getDoctorDashboardStats(doctorId);
        console.log('Dashboard stats:', response); // Debug log
        setStats(response);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>Dashboard</h2>
        <div className={styles.notificationWrapper}>
          <NotificationsNoneRoundedIcon
            style={{ color: "white", fontSize: "20px" }}
          />
          <div className={styles.notificationStatus} />
        </div>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<PersonIcon />}
            title="Total Patients"
            value={stats.totalPatients}
            color="#0088FE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<EventNoteIcon />}
            title="Total Appointments"
            value={stats.totalAppointments}
            color="#00C49F"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            icon={<MedicationIcon />}
            title="Prescriptions Given"
            value={stats.totalPrescriptions}
            color="#FFBB28"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className={styles.chartCard}>
            <Typography variant="h6">Appointments by Status</Typography>
            <BarChart width={500} height={300} data={stats.appointmentsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className={styles.appointmentsList}>
            <Typography variant="h6">Upcoming Appointments</Typography>
            {stats.upcomingAppointments.map((apt, index) => (
              <Box key={apt._id} className={styles.appointmentItem}>
                <Typography variant="subtitle1">
                  {apt.patientId.name} - {apt.timeSlot}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(apt.appointmentDate).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default DoctorHome;