import React, { useState, useEffect } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Typography
} from '@mui/material';
import { toast } from 'react-toastify';
import { getPrescriptionDetails, uploadTestResult } from '../../../services/prescriptionServices';
import styles from './testResult.module.css';

const TestResultUpload = () => {
  const [pendingTests, setPendingTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchPendingTests();
  }, []);

  const fetchPendingTests = async () => {
    try {
      setLoading(true);
      const response = await getPrescriptionDetails();
      
      if (response.success) {
        setPendingTests(response.data);
      } else {
        toast.error('Failed to fetch pending tests');
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching pending tests');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (test) => {
    setSelectedTest(test);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTest(null);
    setSelectedFile(null);
    setRemarks('');
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('resultPDF', selectedFile);
      formData.append('testName', selectedTest.testName);
      formData.append('prescriptionId', selectedTest.prescriptionId);
      formData.append('remarks', remarks);

      await uploadTestResult(formData);
      toast.success('Test result uploaded successfully');
      handleCloseDialog();
      fetchPendingTests(); // Refresh the list
    } catch (error) {
      toast.error(error.message || 'Error uploading test result');
    } finally {
      setLoading(false);
    }
  };

  if (loading && pendingTests.length === 0) {
    return <CircularProgress />;
  }

  return (
    <div className={styles.container}>
      <Typography variant="h5" gutterBottom>Pending Test Results</Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Doctor Name</TableCell>
              <TableCell>Test Name</TableCell>
              <TableCell>Prescribed Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingTests.map((test, index) => (
              <TableRow key={index}>
                <TableCell>{test.patientName}</TableCell>
                <TableCell>{test.doctorName}</TableCell>
                <TableCell>{test.testName}</TableCell>
                <TableCell>{new Date(test.createdDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUploadClick(test)}
                    disabled={test.isCompleted}
                  >
                    {test.isCompleted ? 'Completed' : 'Upload Result'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Upload Test Result</DialogTitle>
        <DialogContent>
          <div className={styles.dialogContent}>
            {selectedTest && (
              <>
                <Typography variant="subtitle1">
                  Patient: {selectedTest.patientName}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Test: {selectedTest.testName}
                </Typography>
              </>
            )}
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <TextField
              multiline
              rows={3}
              variant="outlined"
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
              margin="normal"
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={!selectedFile || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TestResultUpload;