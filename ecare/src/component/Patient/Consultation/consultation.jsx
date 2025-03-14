import React, { useEffect, useState } from 'react';
import { Button, Dialog } from '@mui/material';
import { toast } from 'react-toastify';
import VideoCall from '../../VideoConsultation';
import styles from './consultation.module.css';
import { joinConsultation, endConsultation } from '../../../services/consultationService';
import DoctorIcon from '../../../assets/icons/ic_doctor.png' 

const Consultation = ({ appointmentId, onClose }) => {
  const [consultation, setConsultation] = useState(null);
  const [showCall, setShowCall] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [prescription, setPrescription] = useState(null);

  useEffect(() => {
    // Poll for active consultation
    const pollInterval = setInterval(async () => {
      try {
        const response = await joinConsultation(appointmentId);
        if (response?.consultation?.status === 'waiting') {
          setConsultation(response.consultation);
          setDoctorInfo(response.doctorInfo);
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling consultation:', error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [appointmentId]);

  const handleJoinCall = async () => {
    try {
      const response = await joinConsultation(appointmentId);
      setConsultation(prev => ({ 
        ...prev, 
        token: response.token, 
        channelName: response.channelName 
      }));
      setShowCall(true);
    } catch (error) {
      toast.error('Error joining consultation');
    }
  };

  const handleEndCall = async () => {
    try {
      await endConsultation(appointmentId);
      setShowCall(false);
      onClose();
    } catch (error) {
      toast.error('Error ending consultation');
    }
  };

  return (
    <div className={styles.consultationContainer}>
      {consultation?.status === 'waiting' && !showCall && (
        <div className={styles.joinPrompt}>
          <h2>Doctor is ready for consultation</h2>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleJoinCall}
          >
            Join Consultation
          </Button>
        </div>
      )}

      <Dialog 
        open={showCall} 
        fullScreen
        onClose={handleEndCall}
      >
        <div className={styles.consultationWrapper}>
          <div className={styles.mainContent}>
            {prescription ? (
              <div className={styles.prescriptionView}>
                <h3 className={styles.prescriptionTitle}>Your Prescription</h3>
                {prescription.medicines.map((medicine, index) => (
                  <div key={index} className={styles.medicineItem}>
                    <div className={styles.medicineName}>{medicine.name}</div>
                    <div className={styles.medicineDosage}>{medicine.dosage}</div>
                    <div className={styles.medicineDuration}>{medicine.duration}</div>
                  </div>
                ))}
                {prescription.notes && (
                  <div className={styles.prescriptionNotes}>
                    <h4>Doctor's Notes</h4>
                    <p>{prescription.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.waitingForPrescription}>
                <h3>Consultation in Progress</h3>
                <p>The doctor will prepare your prescription during the consultation.</p>
              </div>
            )}
          </div>
          
          <div className={styles.videoSection}>
            {doctorInfo && (
              <div className={styles.doctorInfo}>
                <img 
                  src={doctorInfo.profilePhoto || DoctorIcon} 
                  alt="Doctor" 
                  className={styles.doctorAvatar} 
                />
                <div>
                  <div className={styles.doctorName}>Dr. {doctorInfo.firstName} {doctorInfo.lastName}</div>
                  <div className={styles.doctorSpecialty}>{doctorInfo.specialization}</div>
                </div>
              </div>
            )}
            
            {consultation && (
              <VideoCall
                token={consultation.token}
                channelName={consultation.channelName}
                onEndCall={handleEndCall}
                role="patient"
              />
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Consultation;