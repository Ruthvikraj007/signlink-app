import { useState, useEffect, useRef, useCallback } from 'react';
import { webSocketService } from '../services/websocketService';

export const useWebRTC = (remoteUserId, callId) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'connecting', 'connected', 'failed', 'ended'
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState(null);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Configuration for different environments
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ]
  };

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    if (isInitializedRef.current) {
      console.log('🔄 WebRTC already initialized');
      return;
    }

    try {
      console.log('🎥 Initializing WebRTC...');
      setCallStatus('connecting');
      setError(null);

      // Request user media with better error handling
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }).catch(err => {
        console.error('❌ Error accessing media devices:', err);
        throw new Error(`Could not access camera/microphone: ${err.message}`);
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      console.log('✅ User media obtained');

      // Create peer connection
      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;
      setPeerConnection(pc);

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
        console.log(`✅ Added ${track.kind} track to peer connection`);
      });

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log('📹 Received remote stream tracks:', event.streams.length);
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          remoteStreamRef.current = remoteStream;
          setRemoteStream(remoteStream);
          setIsCallActive(true);
          setCallStatus('connected');
          console.log('✅ Remote stream set successfully');
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && remoteUserId) {
          console.log('❄️ Sending ICE candidate');
          const success = webSocketService.sendICECandidate(remoteUserId, event.candidate, callId);
          if (!success) {
            console.warn('⚠️ Failed to send ICE candidate - WebSocket not connected');
          }
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`🔗 Peer connection state: ${state}`);
        
        switch (state) {
          case 'connected':
            setIsCallActive(true);
            setCallStatus('connected');
            setError(null);
            break;
          case 'disconnected':
          case 'failed':
            setIsCallActive(false);
            setCallStatus('failed');
            setError('Connection failed. Please try again.');
            break;
          case 'connecting':
            setCallStatus('connecting');
            break;
          case 'closed':
            setIsCallActive(false);
            setCallStatus('ended');
            break;
          default:
            console.log(`🔗 Unknown connection state: ${state}`);
        }
      };

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log(`🧊 ICE connection state: ${state}`);
        
        if (state === 'failed') {
          console.warn('❌ ICE connection failed');
          setError('Network connection failed. Please check your internet connection.');
        }
      };

      // Handle signaling state
      pc.onsignalingstatechange = () => {
        console.log(`📶 Signaling state: ${pc.signalingState}`);
      };

      isInitializedRef.current = true;
      console.log('✅ WebRTC initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing WebRTC:', error);
      setCallStatus('failed');
      setError(error.message || 'Failed to initialize video call');
      
      // Cleanup on error
      cleanupWebRTC();
    }
  }, [remoteUserId, callId]);

  // Create and send offer
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current) {
      console.error('❌ No peer connection available');
      setError('No peer connection available');
      return;
    }

    try {
      console.log('📤 Creating WebRTC offer...');
      setCallStatus('connecting');

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('✅ Local description set');
      
      // Send offer to remote user
      const success = webSocketService.sendWebRTCOffer(remoteUserId, offer, callId);
      
      if (success) {
        console.log('✅ WebRTC offer created and sent');
      } else {
        throw new Error('Failed to send offer - WebSocket not connected');
      }
      
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      setCallStatus('failed');
      setError(error.message || 'Failed to create call offer');
    }
  }, [remoteUserId, callId]);

  // Handle incoming WebRTC offer
  const handleWebRTCOffer = useCallback(async (data) => {
    if (!peerConnectionRef.current || data.fromUserId !== remoteUserId) {
      return;
    }

    try {
      console.log('📥 Received WebRTC offer');
      setCallStatus('connecting');

      await peerConnectionRef.current.setRemoteDescription(data.offer);
      console.log('✅ Remote description set from offer');
      
      // Create and send answer
      const answer = await peerConnectionRef.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('✅ Local description set for answer');
      
      const success = webSocketService.sendWebRTCAnswer(remoteUserId, answer, callId);
      
      if (success) {
        console.log('✅ WebRTC answer created and sent');
      } else {
        throw new Error('Failed to send answer - WebSocket not connected');
      }
      
    } catch (error) {
      console.error('❌ Error handling WebRTC offer:', error);
      setCallStatus('failed');
      setError(error.message || 'Failed to handle incoming call');
    }
  }, [remoteUserId, callId]);

  // Handle incoming WebRTC answer
  const handleWebRTCAnswer = useCallback(async (data) => {
    if (!peerConnectionRef.current || data.fromUserId !== remoteUserId) {
      return;
    }

    try {
      console.log('📥 Received WebRTC answer');
      await peerConnectionRef.current.setRemoteDescription(data.answer);
      console.log('✅ Remote description set from answer');
      
    } catch (error) {
      console.error('❌ Error handling WebRTC answer:', error);
      setCallStatus('failed');
      setError(error.message || 'Failed to establish call connection');
    }
  }, [remoteUserId]);

  // Handle incoming ICE candidate
  const handleICECandidate = useCallback(async (data) => {
    if (!peerConnectionRef.current || data.fromUserId !== remoteUserId) {
      return;
    }

    try {
      await peerConnectionRef.current.addIceCandidate(data.candidate);
      console.log('✅ Added ICE candidate');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }, [remoteUserId]);

  // Toggle video with better error handling
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const newState = !videoTracks[0].enabled;
        videoTracks[0].enabled = newState;
        setIsVideoEnabled(newState);
        console.log(`📹 Video ${newState ? 'enabled' : 'disabled'}`);
      } else {
        console.warn('⚠️ No video tracks found');
      }
    }
  }, []);

  // Toggle audio with better error handling
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const newState = !audioTracks[0].enabled;
        audioTracks[0].enabled = newState;
        setIsAudioEnabled(newState);
        console.log(`🎤 Audio ${newState ? 'enabled' : 'disabled'}`);
      } else {
        console.warn('⚠️ No audio tracks found');
      }
    }
  }, []);

  // Comprehensive cleanup
  const cleanupWebRTC = useCallback(() => {
    console.log('🧹 Cleaning up WebRTC...');
    
    // Stop all local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
      setLocalStream(null);
    }
    
    // Stop remote stream
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      remoteStreamRef.current = null;
      setRemoteStream(null);
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      setPeerConnection(null);
    }
    
    // Reset states
    setIsCallActive(false);
    setCallStatus('idle');
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setError(null);
    isInitializedRef.current = false;
    
    console.log('✅ WebRTC cleanup completed');
  }, []);

  // End call properly
  const endCall = useCallback(() => {
    console.log('📞 Ending call...');
    
    if (remoteUserId && callId) {
      const success = webSocketService.sendEndCall(remoteUserId, callId);
      if (!success) {
        console.warn('⚠️ Failed to send end call notification - WebSocket not connected');
      }
    }
    
    cleanupWebRTC();
  }, [remoteUserId, callId, cleanupWebRTC]);

  // Handle end call from remote
  const handleEndCall = useCallback((data) => {
    if (data.fromUserId === remoteUserId) {
      console.log('📞 Call ended by remote user');
      cleanupWebRTC();
    }
  }, [remoteUserId, cleanupWebRTC]);

  // Retry connection
  const retryConnection = useCallback(() => {
    console.log('🔄 Retrying WebRTC connection...');
    cleanupWebRTC();
    initializeWebRTC().then(() => {
      if (callStatus === 'failed') {
        createOffer();
      }
    });
  }, [cleanupWebRTC, initializeWebRTC, createOffer, callStatus]);

  // Setup WebRTC signaling listeners
  useEffect(() => {
    if (!remoteUserId) return;

    // Register WebRTC message handlers
    webSocketService.onWebRTCOffer(handleWebRTCOffer);
    webSocketService.onWebRTCAnswer(handleWebRTCAnswer);
    webSocketService.onICECandidate(handleICECandidate);
    webSocketService.onEndCall(handleEndCall);

    // Initialize WebRTC when remote user is set
    initializeWebRTC();

    // Cleanup on unmount or remoteUserId change
    return () => {
      webSocketService.removeMessageHandler('webrtc_offer', handleWebRTCOffer);
      webSocketService.removeMessageHandler('webrtc_answer', handleWebRTCAnswer);
      webSocketService.removeMessageHandler('webrtc_ice_candidate', handleICECandidate);
      webSocketService.removeMessageHandler('webrtc_end_call', handleEndCall);
      cleanupWebRTC();
    };
  }, [remoteUserId, initializeWebRTC, cleanupWebRTC, handleWebRTCOffer, handleWebRTCAnswer, handleICECandidate, handleEndCall]);

  return {
    // State
    localStream,
    remoteStream,
    isCallActive,
    callStatus,
    isVideoEnabled,
    isAudioEnabled,
    error,
    
    // Actions
    createOffer,
    endCall,
    toggleVideo,
    toggleAudio,
    cleanupWebRTC,
    retryConnection,
    
    // Peer connection reference (for advanced use)
    peerConnection: peerConnectionRef.current
  };
};