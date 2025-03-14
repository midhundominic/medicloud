import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Button } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import styles from './videoCall.module.css';
import { toast } from 'react-toastify';

const VideoCall = forwardRef(({ token, channelName, uid, onEndCall, role }, ref) => {
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [hasDevicePermission, setHasDevicePermission] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  const clientRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  
  // Expose the endCall method to parent components
  useImperativeHandle(ref, () => ({
    endCall: async () => {
      await cleanup();
      onEndCall();
    }
  }));
  
  // Initialize client only once
  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    
    // Set up event handlers
    clientRef.current.on('user-published', handleUserPublished);
    clientRef.current.on('user-unpublished', handleUserUnpublished);
    clientRef.current.on('connection-state-change', (state) => {
      console.log('Connection state changed to:', state);
    });
    clientRef.current.on('error', (err) => {
      console.error('Agora client error:', err);
      setConnectionError(`Connection error: ${err.message}`);
      toast.error(`Video call error: ${err.message}`);
    });
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasDevicePermission(true);
      } catch (error) {
        console.error('Error getting media permissions:', error);
        toast.error('Please allow camera and microphone access');
        setConnectionError('Camera or microphone access denied');
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!hasDevicePermission || !token || !channelName) return;
      
      try {
        console.log('Joining with token:', token.substring(0, 20) + '...');
        console.log('Channel name:', channelName);
        const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || "96249a25d61f41649a2ee2b62f9978ba";
        
        // Join the channel
        const uidToUse = uid || null; // Use provided UID or let Agora assign one
        await clientRef.current.join(
          AGORA_APP_ID,
          channelName,
          token,
          uidToUse
        );
        
        setIsJoined(true);
        console.log('Successfully joined channel with UID:', uidToUse);

        // Create tracks after successfully joining
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: '720p', // Set higher quality
          optimizationMode: 'detail' // Prioritize video quality
        });

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        // Publish tracks
        await clientRef.current.publish([audioTrack, videoTrack]);
        console.log('Tracks published successfully');

        // Play local video
        if (localVideoRef.current && videoTrack) {
          videoTrack.play(localVideoRef.current);
        }

      } catch (error) {
        console.error('Error in init:', error);
        setConnectionError(`Failed to join: ${error.message}`);
        toast.error('Failed to join video call: ' + error.message);
      }
    };

    init();
  }, [hasDevicePermission, token, channelName, uid]);

  // Effect to handle local video rendering when ref or track changes
  useEffect(() => {
    if (localVideoRef.current && localVideoTrack) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  const handleUserPublished = async (user, mediaType) => {
    try {
      console.log(`Remote user ${user.uid} published ${mediaType}`);
      await clientRef.current.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        setRemoteUsers(prev => {
          if (!prev.some(u => u.uid === user.uid)) {
            return [...prev, user];
          }
          return prev;
        });
        
        // Create a ref for this user if it doesn't exist
        if (!remoteVideoRefs.current[user.uid]) {
          remoteVideoRefs.current[user.uid] = React.createRef();
        }
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          if (remoteVideoRefs.current[user.uid]?.current && user.videoTrack) {
            user.videoTrack.play(remoteVideoRefs.current[user.uid].current);
            console.log(`Playing remote video for user ${user.uid}`);
          } else {
            console.error(`Failed to play remote video for user ${user.uid}`, {
              hasRef: !!remoteVideoRefs.current[user.uid]?.current,
              hasTrack: !!user.videoTrack
            });
          }
        }, 500);
      }
      
      if (mediaType === 'audio' && user.audioTrack) {
        user.audioTrack.play();
        console.log(`Playing remote audio for user ${user.uid}`);
      }
    } catch (error) {
      console.error('Error handling published user:', error);
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
    console.log(`Remote user ${user.uid} unpublished ${mediaType}`);
    if (mediaType === 'video') {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    }
  };

  const cleanup = async () => {
    try {
      if (localAudioTrack) {
        localAudioTrack.close();
        setLocalAudioTrack(null);
      }
      if (localVideoTrack) {
        localVideoTrack.close();
        setLocalVideoTrack(null);
      }
      if (clientRef.current && isJoined) {
        await clientRef.current.leave();
        setIsJoined(false);
        setRemoteUsers([]);
      }
    } catch (error) {
      console.error('Error in cleanup:', error);
    }
  };

  const toggleAudio = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  return (
    <div className={styles.videoCallContainer}>
      <div className={styles.videoGrid}>
        <div className={styles.videoFrame}>
          <div ref={localVideoRef} className={styles.videoElement}></div>
          <div className={styles.userLabel}>You ({role})</div>
          {connectionError && (
            <div className={styles.errorMessage}>{connectionError}</div>
          )}
        </div>
        
        {remoteUsers.map(user => (
          <div 
            key={user.uid} 
            className={styles.videoFrame}
          >
            <div 
              ref={remoteVideoRefs.current[user.uid]} 
              className={styles.videoElement}
            ></div>
            <div className={styles.userLabel}>
              {role === 'doctor' ? 'Patient' : 'Doctor'}
            </div>
          </div>
        ))}
        
        {isJoined && remoteUsers.length === 0 && (
          <div className={styles.waitingMessage}>
            Waiting for {role === 'doctor' ? 'patient' : 'doctor'} to join...
          </div>
        )}
      </div>
      
      <div className={styles.controls}>
        <Button 
          onClick={toggleAudio}
          variant="contained"
          color={isAudioMuted ? "error" : "primary"}
          disabled={!isJoined || !localAudioTrack}
          className={styles.controlButton}
        >
          {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
        </Button>
        <Button 
          onClick={toggleVideo}
          variant="contained"
          color={isVideoMuted ? "error" : "primary"}
          disabled={!isJoined || !localVideoTrack}
          className={styles.controlButton}
        >
          {isVideoMuted ? <VideocamOffIcon /> : <VideocamIcon />}
        </Button>
        <Button 
          onClick={onEndCall}
          variant="contained"
          className={`${styles.controlButton} ${styles.endCallButton}`}
        >
          <CallEndIcon />
        </Button>
      </div>
    </div>
  );
});

export default VideoCall;