import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import { toast } from 'react-toastify';
import { registerFace } from '../../../services/faceAuthServices';
import styles from './faceSetup.module.css';

const FaceSetup = ({ userId }) => {
  const webcamRef = useRef(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [model, setModel] = useState(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      await tf.ready();
      // Use MediaPipe face detector
      const model = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        { runtime: 'tfjs' }
      );
      setModel(model);
    } catch (error) {
      console.error('Error loading face detection model:', error);
      toast.error('Failed to load face detection model');
    }
  };

  const captureAndProcess = async () => {
    if (!webcamRef.current || !model) return null;

    const webcam = webcamRef.current.video;
    const faces = await model.detectFaces(webcam);

    if (faces && faces.length > 0) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  };

  const handleRegister = async () => {
    if (!model) {
      toast.error('Face detection model is not loaded yet');
      return;
    }

    try {
      setIsRegistering(true);
      
      // Capture face
      const faceImage = await captureAndProcess();
      
      if (!faceImage) {
        throw new Error('No face detected. Please face the camera directly.');
      }

      // Register face with backend
      const result = await registerFace(userId, faceImage);
      
      if (result.success) {
        toast.success('Face registered successfully!');
      } else {
        throw new Error('Face registration failed');
      }
    } catch (error) {
      console.error('Face registration error:', error);
      toast.error(error.message || 'Failed to register face');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className={styles.faceSetup}>
      <h3>Face Authentication Setup</h3>
      <div className={styles.webcamContainer}>
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          className={styles.webcam}
          mirrored={true}
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user"
          }}
        />
      </div>
      <button
        onClick={handleRegister}
        disabled={isRegistering || !model}
        className={styles.registerButton}
      >
        {isRegistering ? 'Registering...' : 'Register Face'}
      </button>
      <p className={styles.note}>
        Please ensure good lighting and face the camera directly.
      </p>
    </div>
  );
};

export default FaceSetup;