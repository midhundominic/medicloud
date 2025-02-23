import React, { useState, useEffect } from 'react';
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
  Box
} from '@mui/material';
import { toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import styles from './laboratoryResult.module.css';
import { getCompletedTests, updateTestResult, downloadTestResult } from '../../../services/prescriptionServices';

const LaboratoryResult = () => {
  const [completedTests, setCompletedTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [newRemarks, setNewRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchCompletedTests();
  }, []);

  const fetchCompletedTests = async () => {
    try {
      const response = await getCompletedTests();
      setCompletedTests(response.data);
    } catch (error) {
      toast.error('Error fetching completed tests');
    }
  };

  const handleEdit = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));
      const userId = userData.userId;

      // Create FormData object
      const formData = new FormData();
      
      // Always append remarks and userId
      formData.append('remarks', newRemarks);
      formData.append('userId', userId);
      
      // Only append file if one is selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // Log formData contents for debugging
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const response = await updateTestResult(selectedTest.resultId, formData);
      
      if (response.data.success) {
        toast.success('Test result updated successfully');
        setEditDialogOpen(false);
        setSelectedFile(null);
        setNewRemarks('');
        fetchCompletedTests();
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Error updating test result');
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

  return (
    <div className={styles.completedTestsContainer}>
      <Typography variant="h4" className={styles.title}>
        Completed Laboratory Tests
      </Typography>

      <Paper className={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Test Name</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedTests.map((test) => (
              <TableRow key={test.resultId}>
                <TableCell>{test.patientName}</TableCell>
                <TableCell>{test.testName}</TableCell>
                <TableCell>
                  {new Date(test.uploadDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </TableCell>
                <TableCell>{test.remarks}</TableCell>
                <TableCell className={styles.actionButtons}>
                  <Button
                    startIcon={<VisibilityIcon />}
                    onClick={() => {
                      setSelectedTest(test);
                      setViewDialogOpen(true);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setSelectedTest(test);
                      setNewRemarks(test.remarks);
                      setEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(test.resultId)}
                  >
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Test Result</DialogTitle>
        <DialogContent>
          <Box className={styles.editContent}>
            <Box className={styles.patientInfo}>
              <Typography variant="h6" gutterBottom>Test Details</Typography>
              <Typography><strong>Patient:</strong> {selectedTest?.patientName}</Typography>
              <Typography><strong>Test:</strong> {selectedTest?.testName}</Typography>
            </Box>

            <Box className={styles.uploadSection}>
              <Typography variant="subtitle1" gutterBottom>
                Update Test Result File (Optional)
              </Typography>
              <input
                accept="application/pdf"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                style={{ display: 'none' }}
                id="test-result-edit"
              />
              <label htmlFor="test-result-edit">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  className={styles.uploadButton}
                >
                  {selectedFile ? 'Change PDF File' : 'Select New PDF File'}
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
              value={newRemarks}
              onChange={(e) => setNewRemarks(e.target.value)}
              className={styles.remarksField}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditDialogOpen(false);
            setSelectedFile(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleEdit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>View Test Result</DialogTitle>
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
            onClick={() => handleDownload(selectedTest?.resultId)}
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

export default LaboratoryResult;
