import React, { useState, useEffect } from 'react';
import {
  Card, CardContent, Grid, Typography, Avatar, 
  TextField, InputAdornment, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, List, 
  ListItem, ListItemText, Divider, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import styles from './patient.module.css';
import { getConsultedPatients, getPatientPrescriptions } from '../../../services/doctorServices';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const response = await getConsultedPatients(userData.doctorId);
      // Access the data property from the response
      setPatients(response.data.data || []);
    } catch (error) {
      toast.error('Error fetching patients');
      // Initialize with empty array on error
      setPatients([]);
    }
  };

  const handleViewHistory = async (patient) => {
    try {
      setSelectedPatient(patient);
      const response = await getPatientPrescriptions(patient._id);
      setPrescriptions(response.data || []); // Access the nested data property
      setOpenModal(true);
    } catch (error) {
      toast.error('Error fetching patient history');
      setPrescriptions([]); // Set empty array on error
    }
  };
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.patientsListContainer}>
      <Typography variant="h5" className={styles.pageTitle}>
        My Patients
      </Typography>

      <TextField
        placeholder="Search patients..."
        variant="outlined"
        size="small"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        className={styles.searchField}
      />

      <Grid container spacing={3} className={styles.patientsGrid}>
        {filteredPatients.map((patient) => (
          <Grid item xs={12} md={6} lg={4} key={patient._id}>
            <Card className={styles.patientCard}>
              <CardContent>
                <div className={styles.cardHeader}>
                  <Avatar 
                    src={patient.profilePhoto ? `http://localhost:5001/assets/patientProfile/${patient.profilePhoto}` : null}
                    className={styles.avatar}
                  >
                    {patient.name.charAt(0)}
                  </Avatar>
                  <Chip 
                    label={`${patient.consultations.totalVisits} visits`}
                    color="primary"
                    size="small"
                  />
                </div>

                <Typography variant="h6" className={styles.patientName}>
                  {patient.name}
                </Typography>
                
                <div className={styles.patientInfo}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {patient.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Last Visit:</strong> {dayjs(patient.consultations.lastVisit).format('DD MMM YYYY')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Gender:</strong> {patient.gender || 'Not specified'}
                  </Typography>
                </div>

                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => handleViewHistory(patient)}
                  fullWidth
                  className={styles.historyButton}
                >
                  View Medical History
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Medical History - {selectedPatient?.name}
        </DialogTitle>
        <DialogContent dividers>
          <List>
            {prescriptions.map((prescription, index) => (
              <React.Fragment key={prescription._id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={dayjs(prescription.createdAt).format('DD MMM YYYY')}
                    secondary={
                      <>
                        <Typography component="div" variant="body2" color="textPrimary">
                          <strong>Medicines:</strong>
                          <ul className={styles.medicinesList}>
                            {prescription.medicines.map((medicine, idx) => (
                              <li key={idx}>
                                {medicine.medicine.name} - {medicine.frequency} for {medicine.days} days
                                {medicine.beforeFood && ' (Before food)'}
                                {medicine.isSOS && ' (SOS)'}
                              </li>
                            ))}
                          </ul>
                        </Typography>
                        {prescription.notes && (
                          <Typography component="div" variant="body2">
                            <strong>Notes:</strong> {prescription.notes}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < prescriptions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientsList;