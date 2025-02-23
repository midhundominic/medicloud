import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventNoteIcon from '@mui/icons-material/EventNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import styles from './home.module.css';
import { getDashboardStats } from '../../../services/adminServices';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Home = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    appointmentsByStatus: [],
    appointmentsByDepartment: [],
    recentAppointments: []
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchDashboardStats();
  }, []);

  const StatCard = ({ icon, title, value, color }) => (
    <Card className={styles.statCard}>
      <CardContent>
        <div className={styles.statHeader}>
          <Avatar sx={{ bgcolor: color }} className={styles.statIcon}>
            {icon}
          </Avatar>
          <IconButton size="small">
            <TrendingUpIcon />
          </IconButton>
        </div>
        <Typography variant="h4" className={styles.statValue}>
          {value}
        </Typography>
        <Typography color="textSecondary" className={styles.statTitle}>
          {title}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={70} 
          sx={{ bgcolor: `${color}20`, '& .MuiLinearProgress-bar': { bgcolor: color } }}
        />
      </CardContent>
    </Card>
  );

  return (
    <Box className={styles.dashboardContainer}>
      <Typography variant="h4" className={styles.pageTitle}>
        Dashboard Overview
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon />}
            title="Total Patients"
            value={stats.totalPatients}
            color="#0088FE"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<LocalHospitalIcon />}
            title="Total Doctors"
            value={stats.totalDoctors}
            color="#00C49F"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventNoteIcon />}
            title="Total Appointments"
            value={stats.totalAppointments}
            color="#FFBB28"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventNoteIcon />}
            title="Today's Appointments"
            value={stats.todayAppointments || 0}
            color="#FF8042"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card className={styles.chartCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appointments by Department
              </Typography>
              <PieChart width={500} height={300}>
                <Pie
                  data={stats.appointmentsByDepartment}
                  cx={250}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.appointmentsByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={styles.recentAppointments}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Appointments
              </Typography>
              <List>
                {stats.recentAppointments?.map((appointment, index) => (
                  <React.Fragment key={appointment._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{appointment.patientName?.[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={appointment.patientName}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="textPrimary">
                              Dr. {appointment.doctorName}
                            </Typography>
                            {` — ${new Date(appointment.date).toLocaleDateString()}`}
                          </>
                        }
                      />
                    </ListItem>
                    {index < stats.recentAppointments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;