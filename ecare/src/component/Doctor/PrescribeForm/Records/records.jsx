import React, { useEffect, useState } from "react";
import {
  Typography,
  Chip,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import dayjs from "dayjs";
import { toast } from 'react-toastify';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PDFDownloadLink } from "@react-pdf/renderer";
import PrescriptionTemplate from "../../../Patient/PatientRecords/prescriptionTemplate";

import styles from "./records.module.css";
import { getPrescriptionHistory, downloadTestResult } from "../../../../services/prescriptionServices";

const PatientRecords = ({ patient }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (patient?._id) {
      fetchPrescriptionHistory();
    }
  }, [patient]);

  const fetchPrescriptionHistory = async () => {
    try {
      const response = await getPrescriptionHistory(patient._id);
      setPrescriptions(response.data);
    } catch (error) {
      toast.error('Error fetching prescription history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resultId) => {
    try {
      await downloadTestResult(resultId);
    } catch (error) {
      toast.error('Error downloading test result');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderMedicines = (medicines) => (
    <div className={styles.medicineSection}>
      <Typography variant="subtitle2" className={styles.sectionTitle}>
        Medicines Prescribed
      </Typography>
      {medicines.map((med, index) => (
        <Box key={index} className={styles.medicineItem}>
          <Typography variant="body2">
            {med.medicine?.name || 'Unknown Medicine'} - {med.frequency || 'N/A'}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {med.days || 0} days {med.beforeFood ? '(Before Food)' : '(After Food)'} 
            {med.isSOS && <Chip size="small" label="SOS" color="warning" />}
          </Typography>
        </Box>
      ))}
    </div>
  );

  const renderPrescriptionHistory = () => (
    <div className={styles.prescriptionContainer}>
      {prescriptions.map((record) => (
        <Accordion key={record._id} className={styles.recordAccordion}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div className={styles.summaryContent}>
              <span>{dayjs(record.createdAt).format("DD MMM YYYY")}</span>
              <span>
                Dr. {record.doctorId?.firstName} {record.doctorId?.lastName}
              </span>
            </div>
          </AccordionSummary>
          <AccordionDetails>
            <div className={styles.prescriptionDetails}>
              {record.medicines?.length > 0 && (
                <div className={styles.section}>
                  <h3>Medicines</h3>
                  <ul>
                    {record.medicines.map((medicine, idx) => (
                      <li key={idx}>
                        <span>{medicine.medicine?.name}</span>
                        <span>{medicine.frequency} for {medicine.days} days</span>
                        <span>{medicine.beforeFood ? "Before food" : "After food"}</span>
                        {medicine.isSOS && <Chip size="small" label="SOS" color="warning" />}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {record.tests?.length > 0 && (
                <div className={styles.section}>
                  <h3>Tests</h3>
                  <ul>
                    {record.tests.map((test, idx) => (
                      <li key={idx} className={styles.testItem}>
                        <span>{test.testName}</span>
                        {test.resultId ? (
                          <Button
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownload(test.resultId._id)}
                            variant="contained"
                            size="small"
                          >
                            Download Result
                          </Button>
                        ) : (
                          <span className={styles.pendingResult}>Pending</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {record.notes && (
                <div className={styles.section}>
                  <h3>Notes</h3>
                  <p>{record.notes}</p>
                </div>
              )}

              <div className={styles.actionButtons}>
                <PDFDownloadLink
                  document={
                    <PrescriptionTemplate
                      prescription={record}
                      doctor={record.doctorId}
                      patient={{
                        name: patient.name,
                        age: patient.age,
                        gender: patient.gender,
                      }}
                    />
                  }
                  fileName={`prescription_${dayjs(record.createdAt).format('DDMMYYYY')}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      startIcon={<DownloadIcon />}
                      variant="contained"
                      disabled={loading}
                    >
                      {loading ? 'Generating...' : 'Download Prescription'}
                    </Button>
                  )}
                </PDFDownloadLink>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );

  const renderTestResults = () => (
    <Paper className={styles.tableContainer}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Test Name</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell>Laboratory Remarks</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {prescriptions.map((prescription) => (
            prescription.tests.map((test) => (
              test.resultId && (
                <TableRow key={test.resultId._id}>
                  <TableCell>
                    {dayjs(test.resultId.uploadDate).format("DD MMM YYYY")}
                  </TableCell>
                  <TableCell>{test.testName}</TableCell>
                  <TableCell>
                    Dr. {prescription.doctorId.firstName} {prescription.doctorId.lastName}
                  </TableCell>
                  <TableCell>{test.resultId.remarks}</TableCell>
                  <TableCell className={styles.actionButtons}>
                    <Button
                      startIcon={<VisibilityIcon />}
                      onClick={() => {
                        setSelectedTest(test.resultId);
                        setViewDialogOpen(true);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(test.resultId._id)}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              )
            ))
          ))}
        </TableBody>
      </Table>
    </Paper>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={styles.recordsContainer}>
      <Tabs value={tabValue} onChange={handleTabChange} className={styles.tabs}>
        <Tab label="Prescriptions" />
        <Tab label="Test Results" />
      </Tabs>

      <div className={styles.tabContent}>
        {tabValue === 0 ? renderPrescriptionHistory() : renderTestResults()}
      </div>

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Test Result</DialogTitle>
        <DialogContent>
          <Box className={styles.viewContent}>
            <iframe
              src={selectedTest?.resultFileUrl}
              title="Test Result"
              width="100%"
              height="500px"
              className={styles.pdfViewer}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button 
            onClick={() => handleDownload(selectedTest?._id)}
            variant="contained" 
            color="primary"
            startIcon={<DownloadIcon />}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PatientRecords;