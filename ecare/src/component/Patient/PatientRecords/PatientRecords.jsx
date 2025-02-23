import React, { useEffect, useState } from "react";
import {
  getPrescriptionHistory,
  downloadTestResult,
} from "../../../services/prescriptionServices";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import styles from "./patientRecords.module.css";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PrescriptionTemplate from "./prescriptionTemplate";
import { calculateAge } from "../../../utils/helper";

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const patientId = userData?.userId;
        if (!patientId) {
          toast.error("User ID not found");
          return;
        }

        const response = await getPrescriptionHistory(patientId);
        if (response.data.success) {
          setRecords(response.data.data || []);
        } else {
          toast.error(response.data.message || "Error fetching records");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error fetching patient records");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleDownloadResult = async (resultId) => {
    try {
      const response = await downloadTestResult(resultId);
      if (response.data?.success && response.data?.fileUrl) {
        window.open(response.data.fileUrl, '_blank');
      } else {
        toast.error(response.data?.message || 'Error: File URL not found');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error downloading test result');
    }
  };

  const handleViewResult = (test) => {
    if (test.resultId && test.resultId.resultFileUrl) {
      setSelectedTest({
        resultId: test.resultId._id,
        resultFileUrl: test.resultId.resultFileUrl,
        testName: test.testName,
        remarks: test.resultId.remarks
      });
      setViewDialogOpen(true);
    } else {
      toast.error('Test result file not available');
    }
  };

  const PrescriptionDownloadButton = ({ prescription, doctor, patient }) => (
    <PDFDownloadLink
      document={
        <PrescriptionTemplate 
          prescription={prescription}
          doctor={doctor}
          patient={patient}
        />
      }
      fileName={`prescription_${dayjs().format('DDMMYYYY')}.pdf`}
    >
      {({ loading }) => (
        <Button
          startIcon={<DownloadIcon />}
          variant="contained"
          size="small"
          disabled={loading}
          className={styles.downloadBtn}
        >
          {loading ? 'Generating...' : 'Download Prescription'}
        </Button>
      )}
    </PDFDownloadLink>
  );

  if (loading) return <div>Loading...</div>;
  if (!records.length) return <div>No medical records found.</div>;

  return (
    <div className={styles.recordsContainer}>
      <h2>Medical Records</h2>
      {records.map((record) => (
        <Accordion key={record._id} className={styles.recordAccordion}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <div className={styles.summaryContent}>
              <span>{dayjs(record.createdAt).format("DD MMM YYYY")}</span>
              <span>
                {record.doctorId
                  ? `Dr. ${record.doctorId.firstName || ""} ${
                      record.doctorId.lastName || ""
                    } - ${record.doctorId.specialization || ""}`
                  : "Doctor information unavailable"}
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
                        <span>
                          {medicine.medicine?.name || "Unknown Medicine"}
                        </span>
                        <span>
                          {medicine.frequency || "N/A"} for {medicine.days || 0}{" "}
                          days
                        </span>
                        <span>
                          {medicine.beforeFood ? "Before food" : "After food"}
                        </span>
                        {medicine.isSOS && <span>(SOS)</span>}
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
                        <span>{test.resultId?.lastUpdated ? new Date(test.resultId?.lastUpdated).toLocaleString('en-US',{
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }): []}</span>
                        {test.resultId && test.resultId.resultFileUrl ? (
                          <div className={styles.testActions}>
                            <Button
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewResult(test)}
                              variant="outlined"
                              size="small"
                            >
                              View
                            </Button>
                            <Button
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownloadResult(test.resultId._id)}
                              variant="contained"
                              size="small"
                            >
                              Download
                            </Button>
                          </div>
                        ) : (
                          <span className={styles.pendingResult}>
                            Result not available
                          </span>
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
            </div>
            <div className={styles.actionButtons}>
              <PrescriptionDownloadButton
                prescription={record}
                doctor={record.doctorId}
                patient={{
                  name: record.patientId.name,
                  age: calculateAge(record.patientId.dateOfBirth),
                  gender: record.patientId.gender,
                }}
              />
            </div>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* View Test Result Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Test Result - {selectedTest?.testName}
        </DialogTitle>
        <DialogContent>
          <Box className={styles.viewContent}>
            {selectedTest?.resultFileUrl ? (
              <iframe
                src={selectedTest.resultFileUrl}
                title="Test Result"
                width="100%"
                height="500px"
                className={styles.pdfViewer}
              />
            ) : (
              <Typography color="error" align="center">
                Error loading test result
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
          {selectedTest?.resultId && (
            <Button 
              onClick={() => handleDownloadResult(selectedTest.resultId)}
              variant="contained" 
              color="primary"
              startIcon={<DownloadIcon />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default PatientRecords;
