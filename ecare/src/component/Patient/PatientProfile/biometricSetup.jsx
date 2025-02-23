import React, { useState, useEffect } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { toast } from 'react-toastify';
import styles from './biometricSetup.module.css';
import { registerBiometric, verifyBiometricRegistration } from '../../../services/biometricServices';

const BiometricSetup = ({ userId }) => {
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [availableAuthenticators, setAvailableAuthenticators] = useState({
    platform: false,
    crossPlatform: false
  });

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      setEmail(userData.email);
    }

    // Check available authenticators
    checkAuthenticators();
  }, []);

  const checkAuthenticators = async () => {
    if (window.PublicKeyCredential) {
      // Check platform authenticator (Touch ID)
      const platformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      // We assume cross-platform is available if WebAuthn is supported
      setAvailableAuthenticators({
        platform: platformAvailable,
        crossPlatform: true
      });
    }
  };

  const handleBiometricSetup = async () => {
    try {
      setIsRegistering(true);

      if (!window.PublicKeyCredential) {
        toast.error('WebAuthn is not supported in this browser');
        return;
      }

      const registrationResponse = await registerBiometric(userId, email);
      
      if (!registrationResponse?.options) {
        throw new Error('Invalid registration options received');
      }

      const credential = await startRegistration(registrationResponse.options);
      
      const verification = await verifyBiometricRegistration(userId, credential);

      if (verification.verified) {
        toast.success('Biometric authentication registered successfully!');
      } else {
        throw new Error('Biometric registration failed');
      }
    } catch (error) {
      console.error('Biometric setup error:', error);
      toast.error(error.message || 'Failed to register biometric authentication');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className={styles.biometricSetup}>
      <h3>Biometric Authentication Setup</h3>
      <p>Register your biometric authentication method for secure login.</p>
      {availableAuthenticators.platform && (
        <p className={styles.info}>✓ Touch ID is available on this device</p>
      )}
      <button
        onClick={handleBiometricSetup}
        disabled={isRegistering}
        className={styles.registerButton}
      >
        {isRegistering ? 'Registering...' : 'Register Biometric Authentication'}
      </button>
      <p className={styles.note}>
        You can use Touch ID or any other security key for authentication.
      </p>
    </div>
  );
};

export default BiometricSetup;