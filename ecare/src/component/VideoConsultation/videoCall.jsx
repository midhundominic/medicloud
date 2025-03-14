import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Button } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import styles from './videoCall.module.css';
import { toast } from 'react-toastify';

const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID || "96249a25d61f41649a2ee2b62f9978ba";

const VideoCall = ({ token, channelName, onEndCall, role }) => {
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [hasDevicePermission, setHasDevicePermission] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasDevicePermission(true);
      } catch (error) {
        console.error('Error getting media permissions:', error);
        toast.error('Please allow camera and microphone access');
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!hasDevicePermission) return;
      
      try {
        if (!token || !channelName) {
          throw new Error('Missing token or channel name');
        }

        if (!AGORA_APP_ID) {
          throw new Error('Agora App ID is not configured');
        }

        // Join the channel
        console.log('Joining channel:', channelName);
        await client.join(
          AGORA_APP_ID,
          channelName,
          token,
          null
        );
        setIsJoined(true);
        console.log('Successfully joined channel');

        // Create tracks after successfully joining
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        // Publish tracks only after they're created
        console.log('Publishing tracks');
        await client.publish([audioTrack, videoTrack]);
        console.log('Tracks published successfully');

        // Play local video
        const localContainer = document.getElementById('local-video');
        if (localContainer && videoTrack) {
          videoTrack.play('local-video');
        }

        // Set up event handlers
        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);

      } catch (error) {
        console.error('Error in init:', error);
        toast.error('Failed to join video call: ' + error.message);
        cleanup();
        onEndCall();
      }
    };

    init();

    return () => {
      cleanup();
    };
  }, [hasDevicePermission, token, channelName]);

  const handleUserPublished = async (user, mediaType) => {
    try {
      await client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        setRemoteUsers(prev => {
          if (!prev.some(u => u.uid === user.uid)) {
            return [...prev, user];
          }
          return prev;
        });
        user.videoTrack.play(`remote-video-${user.uid}`);
      }
      if (mediaType === 'audio') {
        user.audioTrack.play();
      }
    } catch (error) {
      console.error('Error handling published user:', error);
    }
  };

  const handleUserUnpublished = (user) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const cleanup = async () => {
    try {
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (isJoined) {
        await client.leave();
        setIsJoined(false);
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

  const handleEndCall = async () => {
    await cleanup();
    onEndCall();
  };

  return (
    <div className={styles.videoCallContainer}>
      <div className={styles.videoGrid}>
        {remoteUsers.length > 0 ? (
          <>
            {remoteUsers.map(user => (
              <div 
                id={`remote-video-${user.uid}`} 
                key={user.uid} 
                className={styles.videoFrame}
              >
                <div className={styles.userLabel}>
                  {role === 'doctor' ? 'Patient' : 'Doctor'}
                </div>
                {isJoined && (
                  <div className={styles.connectionStatus}>
                    Connected
                  </div>
                )}
              </div>
            ))}
            <div className={styles.localVideoContainer} id="local-video">
              <div className={styles.userLabel}>You</div>
            </div>
          </>
        ) : (
          <div className={styles.videoFrame} id="local-video">
            <div className={styles.userLabel}>You</div>
            {!hasDevicePermission && (
              <div className={styles.permissionPrompt}>
                Please allow camera and microphone access
              </div>
            )}
            {isJoined && !remoteUsers.length && (
              <div className={styles.permissionPrompt}>
                Waiting for {role === 'doctor' ? 'patient' : 'doctor'} to join...
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className={styles.controls}>
        <Button 
          onClick={toggleAudio}
          variant="contained"
          color={isAudioMuted ? "error" : "primary"}
          disabled={!isJoined}
          className={styles.controlButton}
        >
          {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
        </Button>
        <Button 
          onClick={toggleVideo}
          variant="contained"
          color={isVideoMuted ? "error" : "primary"}
          disabled={!isJoined}
          className={styles.controlButton}
        >
          {isVideoMuted ? <VideocamOffIcon /> : <VideocamIcon />}
        </Button>
        <Button 
          onClick={handleEndCall}
          variant="contained"
          className={`${styles.controlButton} ${styles.endCallButton}`}
        >
          <CallEndIcon />
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;