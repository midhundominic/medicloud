import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPrescriptionHistory,
  downloadTestResult,
} from "../../../services/prescriptionServices";
import { 
  createPrescriptionPayment, 
  verifyPrescriptionPayment,
  getPrescriptionPaymentStatus 
} from "../../../services/prescriptionPaymentServices";
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
  Chip,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import styles from "./patientRecords.module.css";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PrescriptionTemplate from "./prescriptionTemplate";
import { calculateAge } from "../../../utils/helper";
import { usePatient } from "../../../context/patientContext";

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const PatientRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [insufficientStock, setInsufficientStock] = useState([]);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { patient } = usePatient();

  useEffect(() => {
    fetchRecords();
    
    // Set up polling to check for delivery status updates every 15 seconds
    const intervalId = setInterval(() => {
      if (records.length > 0) {
        checkForDeliveryStatusUpdates();
      }
    }, 15000); // Check every 15 seconds instead of 30
    
    return () => clearInterval(intervalId);
  }, [records.length]); // Add records.length as a dependency

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData"));
      const patientId = userData?.userId;
      if (!patientId) {
        toast.error("User ID not found");
        return;
      }

      const response = await getPrescriptionHistory(patientId);
      if (response.data.success) {
        const prescriptions = response.data.data || [];
        
        // For each paid prescription, fetch its payment status to get delivery info
        const updatedPrescriptions = await Promise.all(
          prescriptions.map(async (prescription) => {
            if (prescription.isPaid) {
              try {
                const paymentStatusResponse = await getPrescriptionPaymentStatus(prescription._id);
                console.log("Payment status for", prescription._id, ":", paymentStatusResponse);
                
                if (paymentStatusResponse.success) {
                  return {
                    ...prescription,
                    deliveryStatus: paymentStatusResponse.data.deliveryStatus,
                    deliveredAt: paymentStatusResponse.data.deliveredAt
                  };
                }
              } catch (error) {
                console.error("Error fetching payment status:", error);
              }
            }
            return prescription;
          })
        );
        
        console.log("Updated prescriptions with delivery status:", updatedPrescriptions);
        setRecords(updatedPrescriptions);
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

  const handleProceedToPayment = (prescription) => {
    setSelectedPrescription(prescription);
    setPaymentDialogOpen(true);
  };

  const handlePayNow = async () => {
    try {
      setPaymentLoading(true);
      
      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem("userData"));
      const patientId = userData?.userId;
      
      if (!patientId) {
        toast.error('Patient ID is missing. Please log in again.');
        setPaymentLoading(false);
        return;
      }
      
      // Create payment
      const paymentResponse = await createPrescriptionPayment(selectedPrescription._id, patientId);
      
      if (!paymentResponse.success) {
        if (paymentResponse.insufficientStock) {
          setInsufficientStock(paymentResponse.insufficientStock);
          setStockDialogOpen(true);
          setPaymentDialogOpen(false);
        } else {
          toast.error(paymentResponse.message || 'Error creating payment');
        }
        setPaymentLoading(false);
        return;
      }
      
      // Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load. Please try again later.');
        setPaymentLoading(false);
        return;
      }
      
      // Configure Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_EYA3vypm9ZHRuN',
        amount: paymentResponse.data.amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Medicloud Mecicne Payment',
        description: 'Payment for medicines and lab tests',
        order_id: paymentResponse.data.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await verifyPrescriptionPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              prescriptionPaymentId: paymentResponse.data.paymentId
            });
            
            if (verifyResponse.success) {
              toast.success('Payment successful! Medicines and tests are now available.');
              setPaymentDialogOpen(false);
              // Refresh records to show updated payment status
              fetchRecords();
            } else {
              toast.error('Payment verification failed: ' + verifyResponse.message);
            }
          } catch (error) {
            console.error('Error in payment handler:', error);
            toast.error('Error processing payment: ' + (error.response?.data?.message || error.message));
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: patient?.name || userData?.name || 'Patient',
          email: patient?.email || userData?.email || '',
          contact: patient?.phone || userData?.phone || '',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false);
            setPaymentDialogOpen(false);
          }
        }
      };
      
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Error initiating payment: ' + (error.response?.data?.message || error.message));
      setPaymentLoading(false);
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

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getDeliveryStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon className={styles.deliveredIcon} />;
      case 'shipped':
        return <LocalShippingIcon className={styles.shippedIcon} />;
      case 'processing':
        return <HourglassEmptyIcon className={styles.processingIcon} />;
      default:
        return <HourglassEmptyIcon className={styles.pendingIcon} />;
    }
  };

  // Add this function to fetch payment status for a specific prescription
  const fetchPrescriptionPaymentStatus = async (prescriptionId) => {
    try {
      const response = await getPrescriptionPaymentStatus(prescriptionId);
      console.log("Prescription payment status response:", response);
      return response;
    } catch (error) {
      console.error("Error fetching prescription payment status:", error);
      return { success: false };
    }
  };

  // Update the checkForDeliveryStatusUpdates function
  const checkForDeliveryStatusUpdates = async () => {
    try {
      console.log("Checking for delivery status updates...");
      const paidRecords = records.filter(record => record.isPaid);
      console.log("Paid records:", paidRecords);
      
      for (const record of paidRecords) {
        console.log("Checking record:", record._id);
        const response = await fetchPrescriptionPaymentStatus(record._id);
        console.log("Response delivery status for", record._id, ":", response);
        
        if (response.success) {
          const newDeliveryStatus = response.data.deliveryStatus;
          const newDeliveredAt = response.data.deliveredAt;
          
          console.log("Current status:", record.deliveryStatus, "New status:", newDeliveryStatus);
          
          if (newDeliveryStatus !== record.deliveryStatus || 
              newDeliveredAt !== record.deliveredAt) {
            
            console.log("Updating delivery status from", record.deliveryStatus, "to", newDeliveryStatus);
            
            // Update the record with new delivery status
            setRecords(prevRecords => 
              prevRecords.map(r => 
                r._id === record._id 
                  ? { 
                      ...r, 
                      deliveryStatus: newDeliveryStatus,
                      deliveredAt: newDeliveredAt 
                    } 
                  : r
              )
            );
            
            // Show a toast notification about the status change
            toast.info(`Delivery status updated to: ${capitalizeFirstLetter(newDeliveryStatus)}`);
          }
        }
      }
    } catch (error) {
      console.error("Error checking delivery status updates:", error);
    }
  };

  const renderDeliveryStatus = (record) => {
    // Default to 'processing' if no status is set
    const status = record.deliveryStatus || 'processing';
    
    console.log("Rendering delivery status:", status, "for record:", record._id);
    
    switch(status) {
      case 'delivered':
        return (
          <div className={styles.deliveryStatus}>
            <CheckCircleIcon className={styles.deliveredIcon} />
            <span className={styles.deliveryInfo}>
              <span className={styles.deliveryStatusText}>
                Status: Delivered
              </span>
              <span className={styles.deliveryNote}>
                Your prescription was delivered on {record.deliveredAt ? new Date(record.deliveredAt).toLocaleDateString() : 'N/A'}
              </span>
            </span>
          </div>
        );
      case 'shipped':
        return (
          <div className={styles.deliveryStatus}>
            <LocalShippingIcon className={styles.shippedIcon} />
            <span className={styles.deliveryInfo}>
              <span className={styles.deliveryStatusText}>
                Status: Shipped
              </span>
              <span className={styles.deliveryNote}>
                Your prescription is on the way and will be delivered soon.
              </span>
            </span>
          </div>
        );
      default:
        return (
          <div className={styles.deliveryStatus}>
            <HourglassEmptyIcon className={styles.processingIcon} />
            <span className={styles.deliveryInfo}>
              <span className={styles.deliveryStatusText}>
                Status: Processing
              </span>
              <span className={styles.deliveryNote}>
                Your prescription is being prepared by the pharmacy.
              </span>
            </span>
          </div>
        );
    }
  };

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
              {!record.isPaid && (
                <Chip 
                  label="Payment Required" 
                  color="error" 
                  size="small" 
                  className={styles.paymentChip}
                />
              )}
            </div>
          </AccordionSummary>
          <AccordionDetails>
            {!record.isPaid ? (
              <div className={styles.paymentRequired}>
                <Typography variant="h6" color="error">
                  Payment Required to View Complete Details
                </Typography>
                <Typography variant="body1" paragraph>
                  This prescription requires payment before you can view the complete details and access test results.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PaymentIcon />}
                  onClick={() => handleProceedToPayment(record)}
                  className={styles.paymentButton}
                >
                  Proceed to Payment
                </Button>
              </div>
            ) : (
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

                {record.isPaid && (
                  <div className={styles.section}>
                    <h4>Delivery Status</h4>
                    <div className={styles.deliveryStatusContainer}>
                      {renderDeliveryStatus(record)}
                    </div>
                  </div>
                )}

                {record.notes && (
                  <div className={styles.section}>
                    <h3>Notes</h3>
                    <p>{record.notes}</p>
                  </div>
                )}
                
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
              </div>
            )}
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

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => !paymentLoading && setPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Prescription Payment
        </DialogTitle>
        <DialogContent>
          {selectedPrescription && (
            <div className={styles.paymentDialogContent}>
              <div className={styles.prescriptionDetails}>
                <h3>Prescription Details</h3>
                <p><strong>Doctor:</strong> Dr. {selectedPrescription.doctorId?.firstName} {selectedPrescription.doctorId?.lastName}</p>
                <p><strong>Date:</strong> {new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className={styles.medicinesSection}>
                <h3>Medicines</h3>
                {selectedPrescription.medicines && selectedPrescription.medicines.length > 0 ? (
                  <ul className={styles.medicinesList}>
                    {selectedPrescription.medicines.map((med, index) => (
                      <li key={index} className={styles.medicineItem}>
                        <span className={styles.medicineName}>{med.medicine?.name}</span>
                        <span className={styles.medicineDetails}>
                          {med.frequency}, {med.days} days
                          {med.beforeFood ? ', before food' : ''}
                          {med.isSOS ? ', SOS' : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No medicines prescribed</p>
                )}
              </div>
              
              <div className={styles.testsSection}>
                <h3>Lab Tests</h3>
                {selectedPrescription.tests && selectedPrescription.tests.length > 0 ? (
                  <ul className={styles.testsList}>
                    {selectedPrescription.tests.map((test, index) => (
                      <li key={index} className={styles.testItem}>
                        {test.testName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No lab tests prescribed</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPaymentDialogOpen(false)}
            disabled={paymentLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePayNow}
            variant="contained" 
            color="primary"
            startIcon={<PaymentIcon />}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <>
                <CircularProgress size={20} color="inherit" style={{ marginRight: 8 }} />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Insufficient Stock Dialog */}
      <Dialog
        open={stockDialogOpen}
        onClose={() => setStockDialogOpen(false)}
      >
        <DialogTitle>Insufficient Medicine Stock</DialogTitle>
        <DialogContent>
          <p>The following medicines don't have enough stock:</p>
          <ul>
            {insufficientStock.map((item, index) => (
              <li key={index}>
                <strong>{item.name}</strong>: Required {item.required}, Available {item.available}
              </li>
            ))}
          </ul>
          <p>Please contact the pharmacy or your doctor for alternatives.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PatientRecords;
