import React, { useState, useEffect } from "react";
import {
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
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import styles from "./laboratoryPending.module.css";
import {
  getPendingTests,
  uploadTestResult,
} from "../../../services/prescriptionServices";

const LaboratoryPending = () => {
  const [pendingTests, setPendingTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingTests();
  }, []);

  const fetchPendingTests = async () => {
    try {
      const response = await getPendingTests();
      console.log("213323", response);
      setPendingTests(response.data);
    } catch (error) {
      toast.error("Error fetching pending tests");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));
      const userId = userData.userId;
      console.log("user id", userId);
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("prescriptionId", selectedTest.prescriptionId);
      formData.append("testName", selectedTest.testName);
      formData.append("remarks", remarks);
      formData.append("userId", userId);

      const response = await uploadTestResult(formData);
      if (response.data) {
        toast.success("Test result uploaded successfully");
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setRemarks("");
        fetchPendingTests();
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.message || "Error uploading test result"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pendingTestsContainer}>
      <Typography variant="h4" className={styles.title}>
        Pending Laboratory Tests
      </Typography>

      <Paper className={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Test Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingTests.map((test) => (
              <TableRow key={`${test.prescriptionId}-${test.testName}`}>
                <TableCell>{test.patientName}</TableCell>
                <TableCell>{test.testName}</TableCell>
                <TableCell>
                  <div>{test.patientEmail}</div>
                  <div>{test.patientPhone}</div>
                </TableCell>
                <TableCell>
                  <div>{test.patientAddress}</div>
                  <div>{`${test.patientCity}, ${test.patientDistrict}`}</div>
                  <div>{test.patientPincode}</div>
                </TableCell>
                <TableCell>{test.doctorName}</TableCell>
                <TableCell>
                  {new Date(test.createdDate).toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => {
                      setSelectedTest(test);
                      setUploadDialogOpen(true);
                    }}
                  >
                    Upload Result
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Upload Test Result</DialogTitle>
        <DialogContent>
          <Box className={styles.uploadContent}>
            <Box className={styles.patientInfo}>
              <Typography variant="h6">Patient Information</Typography>
              <Typography>
                <strong>Name:</strong> {selectedTest?.patientName}
              </Typography>
              <Typography>
                <strong>Test:</strong> {selectedTest?.testName}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedTest?.patientEmail}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selectedTest?.patientPhone}
              </Typography>
              <Typography>
                <strong>Address:</strong> {selectedTest?.patientAddress}
              </Typography>
            </Box>

            <Box className={styles.uploadSection}>
              <input
                accept="application/pdf"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ display: "none" }}
                id="test-result-upload"
              />
              <label htmlFor="test-result-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                >
                  Select PDF File
                </Button>
              </label>
              {selectedFile && (
                <Typography className={styles.fileName}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
            </Box>

            <TextField
              multiline
              rows={4}
              variant="outlined"
              label="Remarks"
              fullWidth
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className={styles.remarksField}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={loading || !selectedFile}
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default LaboratoryPending;
