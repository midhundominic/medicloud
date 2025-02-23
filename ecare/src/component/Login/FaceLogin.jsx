import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';
import { verifyFace } from '../../services/faceAuthServices';
import styles from './faceLogin.module.css';

const FaceLogin = ({ onSuccess, onError }) => {
  const webcamRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);
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
      onError('Failed to load face detection model');
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

  const handleVerify = async () => {
    if (!model) {
      onError('Face detection model is not loaded yet');
      return;
    }

    try {
      setIsVerifying(true);
      
      // Capture face
      const faceImage = await captureAndProcess();
      
      if (!faceImage) {
        throw new Error('No face detected. Please face the camera directly.');
      }

      // Verify face with backend
      const result = await verifyFace(faceImage);
      
      if (result.verified) {
        onSuccess(result);
      } else {
        throw new Error('Face verification failed');
      }
    } catch (error) {
      console.error('Face verification error:', error);
      onError(error.message || 'Failed to verify face');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.faceLogin}>
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
        onClick={handleVerify}
        disabled={isVerifying || !model}
        className={styles.verifyButton}
      >
        {isVerifying ? 'Verifying...' : 'Login with Face ID'}
      </button>
    </div>
  );
};

export default FaceLogin;