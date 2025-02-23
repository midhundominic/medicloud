import React, { useEffect, useState } from 'react';
import { 
  Button, 
  CircularProgress, 
  Paper, 
  Typography, 
  Grid,
  Card,
  CardContent,
  Divider 
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { getPatientPayments } from '../../../services/paymentServices';
import styles from './payments.module.css';
import PageTitle from '../../Common/PageTitle';
import PaymentReceiptTemplate from './PaymentReceiptTemplate';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData"));
        const res = await getPatientPayments(userData?.userId);
        setPayments(res.data);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleDownload = async (payment) => {
    try {
      setGeneratingPdf(true);
      
      // Extract required data from the populated payment object
      const {
        patient,
        appointmentId: appointment,
      } = payment;

      // Extract doctor from the populated appointment
      const doctor = appointment.doctorId;

      console.log("Receipt data:", { payment, patient, appointment, doctor }); // Debug log

      const blob = await pdf(
        <PaymentReceiptTemplate 
          payment={payment}
          patient={patient}
          appointment={appointment}
          doctor={doctor}
        />
      ).toBlob();
      
      saveAs(blob, `medicloud_${payment._id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={styles.paymentContainer}>
      <PageTitle>Payment History</PageTitle>
      
      {payments.length === 0 ? (
        <Paper className={styles.noPayments}>
          <ReceiptIcon className={styles.noPaymentIcon} />
          <Typography variant="h6">No payment records found</Typography>
          <Typography variant="body2" color="textSecondary">
            Your payment history will appear here once you make payments
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {payments.map((payment) => (
            <Grid item xs={12} md={6} key={payment._id}>
              <Card className={styles.paymentCard}>
                <CardContent>
                  <div className={styles.cardHeader}>
                    <Typography variant="h6" className={styles.amount}>
                      ₹{payment.amount}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Transaction ID: {payment._id}
                    </Typography>
                  </div>
                  
                  <Divider className={styles.divider} />
                  
                  <div className={styles.paymentDetails}>
                    <div className={styles.detailRow}>
                      <Typography variant="body2" color="textSecondary">
                        Date
                      </Typography>
                      <Typography variant="body2">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                    <div className={styles.detailRow}>
                      <Typography variant="body2" color="textSecondary">
                        Time
                      </Typography>
                      <Typography variant="body2">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </Typography>
                    </div>
                  </div>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    className={styles.downloadButton}
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(payment)}
                    disabled={generatingPdf}
                  >
                    {generatingPdf ? 'Generating...' : 'Download Receipt'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default Payments;