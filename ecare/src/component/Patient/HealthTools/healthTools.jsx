import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import PrescriptionAnalyzer from '../PrescriptionAnlayzer/prescriptionAnalyzer';
import VirtualHealthAssistant from '../Virtual Health Assistant/vha';
import styles from './healthTools.module.css';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`health-tabpanel-${index}`}
      aria-labelledby={`health-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const HealthTools = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h4" className={styles.title}>
          Health Tools
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          centered
          className={styles.tabs}
        >
          <Tab label="Virtual Health Assistant" />
          <Tab label="Prescription Analyzer" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <VirtualHealthAssistant />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <PrescriptionAnalyzer />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default HealthTools;