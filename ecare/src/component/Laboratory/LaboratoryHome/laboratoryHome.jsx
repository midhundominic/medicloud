import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Paper, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  IconButton,
  Button,
  CircularProgress,
  Box,
  Divider
} from '@mui/material';
import {
  Science,
  Assignment,
  Timeline,
  Notifications,
  MedicalServices,
  LocalHospital,
  TrendingUp,
  CheckCircle
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import styles from './laboratoryHome.module.css';
import {ROUTES} from "../../../router/routes"
import { getPendingTests, getCompletedTests } from '../../../services/prescriptionServices';
import { getAllTests } from '../../../services/labTestServices';

const LaboratoryHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingTests: 0,
    completedTests: 0,
    totalPatients: 0,
    recentReports: []
  });
  const [labTests, setLabTests] = useState([]);

  useEffect(() => {
    fetchLabStats();
    fetchLabTests();
  }, []);

  const fetchLabStats = async () => {
    try {
      const [pendingResponse, completedResponse] = await Promise.all([
        getPendingTests(),
        getCompletedTests()
      ]);

      const pendingTests = pendingResponse.data;
      const completedTests = completedResponse.data;

      // Get unique patients
      const allPatients = new Set([
        ...pendingTests.map(test => test.patientId),
        ...completedTests.map(test => test.patientId)
      ]);

      // Get recent reports (last 5)
      const recentReports = completedTests
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 5);

      setStats({
        pendingTests: pendingTests.length,
        completedTests: completedTests.length,
        totalPatients: allPatients.size,
        recentReports
      });
    } catch (error) {
      toast.error('Error fetching laboratory statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchLabTests = async () => {
    try {
      const response = await getAllTests();
      setLabTests(response.data);
    } catch (error) {
      toast.error('Error fetching laboratory tests');
    }
  };

  const quickActions = [
    { 
      title: 'Pending Tests', 
      icon: <Science />, 
      color: '#4CAF50', 
      path: '/laboratory/pendingtest',
      count: stats.pendingTests
    },
    { 
      title: 'Completed Tests', 
      icon: <CheckCircle />, 
      color: '#2196F3', 
      path: '/laboratory/result',
      count: stats.completedTests
    },
    { 
      title: 'Analytics', 
      icon: <TrendingUp />, 
      color: '#9C27B0', 
      path: '/laboratory/analytics',
      count: null
    }
  ];

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={styles.homeContainer}>
      {/* Welcome Banner */}
      <Paper elevation={3} className={styles.welcomeBanner}>
        <div className={styles.welcomeContent}>
          <Typography variant="h4">Laboratory Dashboard</Typography>
          <Typography variant="subtitle1">
            Manage and track laboratory tests efficiently
          </Typography>
        </div>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} className={styles.statsContainer}>
        <Grid item xs={12} md={4}>
          <Card className={`${styles.statCard} ${styles.pendingCard}`}>
            <CardContent>
              <Box className={styles.statHeader}>
                <Science className={styles.statIcon} />
                <Typography variant="h6">Pending Tests</Typography>
              </Box>
              <Typography variant="h3">{stats.pendingTests}</Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/laboratory/pendingtest')}
                className={styles.statButton}
              >
                View Pending Tests
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={`${styles.statCard} ${styles.completedCard}`}>
            <CardContent>
              <Box className={styles.statHeader}>
                <CheckCircle className={styles.statIcon} />
                <Typography variant="h6">Completed Tests</Typography>
              </Box>
              <Typography variant="h3">{stats.completedTests}</Typography>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/laboratory/result')}
                className={styles.statButton}
              >
                View Completed Tests
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={`${styles.statCard} ${styles.patientsCard}`}>
            <CardContent>
              <Box className={styles.statHeader}>
                <Assignment className={styles.statIcon} />
                <Typography variant="h6">Total Patients</Typography>
              </Box>
              <Typography variant="h3">{stats.totalPatients}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" className={styles.sectionTitle}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} className={styles.actionsContainer}>
        {quickActions.map((action, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card 
              className={styles.actionCard}
              onClick={() => navigate(action.path)}
            >
              <CardContent>
                <IconButton style={{ backgroundColor: action.color }}>
                  {action.icon}
                </IconButton>
                <Typography variant="h6">{action.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Lab Tests Services */}
      <Typography variant="h5" className={styles.sectionTitle}>
        Available Laboratory Tests
      </Typography>
      <Grid container spacing={3} className={styles.servicesContainer}>
        {labTests.map((test) => (
          <Grid item xs={12} md={6} lg={3} key={test._id}>
            <Card className={styles.serviceCard}>
              <CardContent>
                <Box className={styles.serviceHeader}>
                  <Science className={styles.serviceIcon} />
                  <Typography variant="h6">{test.label}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" className={styles.servicePrice}>
                  Rs. {test.amount}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  fullWidth
                  className={styles.serviceButton}
                  onClick={() => navigate('/laboratory/tests')}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Reports */}
      <Card className={styles.recentReportsCard}>
        <CardContent>
          <Typography variant="h6" className={styles.sectionTitle}>
            Recent Test Reports
          </Typography>
          <Divider className={styles.divider} />
          
          {stats.recentReports.length > 0 ? (
            <div className={styles.reportsGrid}>
              {stats.recentReports.map((report) => (
                <Paper key={report.resultId} className={styles.reportItem}>
                  <div className={styles.reportInfo}>
                    <Typography variant="subtitle1" className={styles.patientName}>
                      {report.patientName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {report.testName}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(report.uploadDate).toLocaleDateString()}
                    </Typography>
                  </div>
                  <div className={styles.reportActions}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => navigate(`/laboratory/results?id=${report.resultId}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </Paper>
              ))}
            </div>
          ) : (
            <Typography variant="body1" className={styles.noReports}>
              No recent test reports available
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaboratoryHome;
