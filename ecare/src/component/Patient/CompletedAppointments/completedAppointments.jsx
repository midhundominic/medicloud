import React, { useState, useEffect } from 'react';
import { Rating, Card, CardContent, Typography, TextField, Button, Chip } from '@mui/material';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { getCompletedAppointments, submitReview, getSubmittedReviews } from '../../../services/appointmentServices';
import styles from './completedAppointments.module.css';
import PageTitle from '../../Common/PageTitle';

const CompletedAppointments = () => {
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [reviewStates, setReviewStates] = useState({});
  const [submittedReviews, setSubmittedReviews] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      const patientId = userData?.userId;

      if (!patientId) return;

      try {
        // Fetch completed appointments
        const appointmentsRes = await getCompletedAppointments(patientId);
        setCompletedAppointments(appointmentsRes?.data?.appointments || []);

        // Fetch submitted reviews
        const reviewsRes = await getSubmittedReviews(patientId);
        const reviewsMap = {};
        reviewsRes?.data?.data.forEach(review => {
          reviewsMap[review.appointmentId._id] = review;
        });
        setSubmittedReviews(reviewsMap);

        // Initialize review states
        const initialStates = {};
        appointmentsRes?.data?.appointments.forEach(apt => {
          const submittedReview = reviewsMap[apt._id];
          initialStates[apt._id] = {
            rating: submittedReview?.rating || 0,
            review: submittedReview?.review || "",
            isSubmitted: !!submittedReview
          };
        });
        setReviewStates(initialStates);
      } catch (error) {
        toast.error("Error fetching appointments data");
      }
    };

    fetchData();
  }, []);

  const handleReviewSubmit = async (appointmentId, doctorId) => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const patientId = userData?.userId;
  
    if (!patientId) {
      toast.error("Patient ID not found");
      return;
    }

    const currentReview = reviewStates[appointmentId];
    if (!currentReview.rating) {
      toast.error("Please provide a rating");
      return;
    }

    if (submittedReviews[appointmentId]) {
      toast.error("Review already submitted");
      return;
    }
  
    try {
      const response = await submitReview(
        appointmentId, 
        doctorId, 
        patientId, 
        currentReview.rating, 
        currentReview.review
      );
      
      setReviewStates(prev => ({
        ...prev,
        [appointmentId]: {
          ...prev[appointmentId],
          isSubmitted: true
        }
      }));

      setSubmittedReviews(prev => ({
        ...prev,
        [appointmentId]: response.review
      }));
      
      toast.success("Review submitted successfully");
    } catch (error) {
      toast.error("Error submitting review");
    }
  };
      
     

  const handleRatingChange = (appointmentId, newValue) => {
    setReviewStates(prev => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        rating: newValue
      }
    }));
  };

  const handleReviewChange = (appointmentId, event) => {
    setReviewStates(prev => ({
      ...prev,
      [appointmentId]: {
        ...prev[appointmentId],
        review: event.target.value
      }
    }));
  };

  return (
    <div className={styles.completedRoot}>
      <PageTitle>Completed Appointments</PageTitle>
      
      <div className={styles.appointmentsList}>
        {completedAppointments.length ? (
          completedAppointments.map((appointment) => (
            <Card key={appointment._id} className={styles.appointmentCard}>
              <CardContent>
                <div className={styles.cardHeader}>
                  <Typography variant="h6">
                    Dr. {appointment.doctorId.firstName} {appointment.doctorId.lastName}
                  </Typography>
                  <Chip 
                    label="Completed"
                    color="success"
                    size="small"
                  />
                </div>

                <Typography color="textSecondary" gutterBottom>
                  {dayjs(appointment.appointmentDate).format("DD MMM YYYY, hh:mm A")}
                </Typography>

                {reviewStates[appointment._id]?.isSubmitted ? (
                  <div className={styles.submittedReview}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your Review
                    </Typography>
                    <Rating 
                      value={reviewStates[appointment._id].rating} 
                      readOnly 
                    />
                    <Typography variant="body2">
                      {reviewStates[appointment._id].review}
                    </Typography>
                  </div>
                ) : (
                  <div className={styles.reviewSection}>
                    <Typography variant="subtitle2" gutterBottom>
                      Rate your experience
                    </Typography>
                    <Rating
                      value={reviewStates[appointment._id]?.rating || 0}
                      onChange={(_, newValue) => handleRatingChange(appointment._id, newValue)}
                    />
                    <TextField
                      multiline
                      rows={3}
                      placeholder="Write your review here (optional)"
                      value={reviewStates[appointment._id]?.review || ""}
                      onChange={(e) => handleReviewChange(appointment._id, e)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      className={styles.reviewInput}
                    />
                    <Button 
                      variant="contained"
                      onClick={() => handleReviewSubmit(appointment._id, appointment.doctorId._id)}
                      className={styles.submitButton}
                    >
                      Submit Review
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" className={styles.noAppointments}>
            No completed appointments to show.
          </Typography>
        )}
      </div>
    </div>
  );
};

export default CompletedAppointments;