import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  Chip,
  Avatar
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from '@mui/lab';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { analyzeHealthData, getChatResponse } from '../../../services/healthAssistant';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';
import styles from './vha.module.css';

const VirtualHealthAssistant = () => {
  const [healthData, setHealthData] = useState({
    bloodSugar: '',
    systolicBP: '',
    diastolicBP: '',
    temperature: '',
    oxygenLevel: '',
    cholesterol: '',
    weight: '',
    height: '',
    symptoms: []
  });

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [healthHistory, setHealthHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const steps = ['Enter Health Data', 'AI Analysis', 'Recommendations'];

  const handleInputChange = (field) => (event) => {
    setHealthData({ ...healthData, [field]: event.target.value });
  };

  const updateHealthHistory = () => {
    const newEntry = {
      date: new Date().toISOString(),
      metrics: healthData,
      analysis: analysis
    };

    // Add the new entry to the history
    setHealthHistory(prevHistory => [...prevHistory, newEntry]);

    // You could also save this to localStorage or your backend
    try {
      localStorage.setItem('healthHistory', JSON.stringify([...healthHistory, newEntry]));
    } catch (error) {
      console.error('Error saving health history:', error);
    }
  };

  // Load health history from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('healthHistory');
      if (savedHistory) {
        setHealthHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading health history:', error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Pass the healthData to the analyzeHealthData function
      const response = await analyzeHealthData(healthData);
      console.log("Response VHA", response);
      
      setAnalysis(response.result); // Make sure to access the result property
      setActiveStep(2);
      updateHealthHistory(); // Call updateHealthHistory after successful analysis
    } catch (err) {
      setError(err.message || 'Error analyzing health data');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!currentMessage.trim()) return;

    try {
      setChatLoading(true);
      const newMessage = { type: 'user', content: currentMessage };
      setChatMessages(prev => [...prev, newMessage]);

      const context = analysis ? JSON.stringify(analysis) : '';
      const response = await getChatResponse(currentMessage, context);

      setChatMessages(prev => [...prev, { type: 'ai', content: response.response }]);
      setCurrentMessage('');
    } catch (error) {
      setError('Failed to get AI response');
    } finally {
      setChatLoading(false);
    }
  };

  const renderHealthDataForm = () => (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Blood Sugar (mg/dL)"
            id="bloodSugar"
            type="number"
            value={healthData.bloodSugar}
            onChange={handleInputChange('bloodSugar')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Systolic BP (mmHg)"
            id="bp"
            type="number"
            value={healthData.systolicBP}
            onChange={handleInputChange('systolicBP')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Diastolic BP (mmHg)"
            id="dbp"
            type="number"
            value={healthData.diastolicBP}
            onChange={handleInputChange('diastolicBP')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Temperature (°F)"
            id="temp"
            type="number"
            value={healthData.temperature}
            onChange={handleInputChange('temperature')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Oxygen Level (%)"
            id="oxygen"
            type="number"
            value={healthData.oxygenLevel}
            onChange={handleInputChange('oxygenLevel')}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Cholesterol (mg/dL)"
            id="cholestrol"
            type="number"
            value={healthData.cholesterol}
            onChange={handleInputChange('cholesterol')}
            required
          />
        </Grid>
      </Grid>
      <Button
        type="submit"
        id="submit"
        variant="contained"
        color="primary"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Analyze Health Data'}
      </Button>
    </form>
  );

  const renderAnalysis = () => (
    <Box className={styles.analysisContainer}>
      {analysis && (
        <>
          <Timeline position="alternate">
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="primary">
                  <HealthAndSafetyIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Card className={styles.timelineCard}>
                  <CardContent>
                    <Typography variant="h6">Health Status</Typography>
                    <Typography>{analysis.aiAnalysis}</Typography> {/* Show AI analysis */}
                    <Box mt={1}>
                      {analysis.risks && analysis.risks.length > 0 ? (
                        analysis.risks.map((risk, index) => (
                          <Chip
                            key={index}
                            label={risk}
                            color="warning"
                            variant="outlined"
                            className={styles.chip}
                          />
                        ))
                      ) : (
                        <Typography>No specific health risks identified.</Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
  
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="secondary">
                  <RestaurantIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Card className={styles.timelineCard}>
                  <CardContent>
                    <Typography variant="h6">Diet Recommendations</Typography>
                    {analysis.recommendations?.length > 0 ? (
                      <ul className={styles.recommendationList}>
                        {analysis.recommendations.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <Typography>No specific diet recommendations available.</Typography>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
  
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="success">
                  <FitnessCenterIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Card className={styles.timelineCard}>
                  <CardContent>
                    <Typography variant="h6">Exercise Plan</Typography>
                    {analysis.exercisePlan?.length > 0 ? (
                      <ul className={styles.recommendationList}>
                        {analysis.exercisePlan.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <Typography>No specific exercise plan available.</Typography>
                    )}
                  </CardContent>
                </Card>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
  
          {analysis.urgentCare && (
            <Alert severity="warning" className={styles.alert}>
              {analysis.urgentCare}
            </Alert>
          )}
        </>
      )}
    </Box>
  );
  

  const renderChat = () => (
    <Box className={styles.chatContainer}>
      <div className={styles.messages}>
        {chatMessages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${msg.type === 'user' ? styles.userMessage : styles.aiMessage}`}>
            {msg.type === 'ai' && (
              <Avatar className={styles.doctorAvatar}>
                <LocalHospitalIcon />
              </Avatar>
            )}
            <Typography>{msg.content}</Typography>
          </div>
        ))}
      </div>
      <div className={styles.chatInput}>
        <TextField
          fullWidth
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Ask any health-related questions..."
          onKeyPress={(e) => e.key === 'Enter' && handleChat()}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleChat}
          disabled={chatLoading}
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </div>
    </Box>
  );

  const renderHealthHistory = () => (
    <Box className={styles.historyContainer}>
      <Typography variant="h6" gutterBottom>
        Health History
      </Typography>
      {healthHistory.map((entry, index) => (
        <Card key={index} className={styles.historyCard}>
          <CardContent>
            <Typography variant="subtitle2" color="textSecondary">
              {new Date(entry.date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2">
              Blood Sugar: {entry.metrics.bloodSugar} mg/dL
            </Typography>
            <Typography variant="body2">
              BP: {entry.metrics.systolicBP}/{entry.metrics.diastolicBP} mmHg
            </Typography>
            {/* Add more metrics as needed */}
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h4" gutterBottom className={styles.title}>
          Virtual Health Assistant
        </Typography>

        <Stepper activeStep={activeStep} className={styles.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        <Box className={styles.content}>
          {activeStep === 0 && renderHealthDataForm()}
          {activeStep === 2 && renderAnalysis()}
          {analysis && renderChat()}
          {healthHistory.length > 0 && renderHealthHistory()}
        </Box>
      </Paper>
    </Box>
  );
};

export default VirtualHealthAssistant;
