﻿// frontend/src/services/websocketService.js
import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userData = null) {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('signlink_token');
        
        this.socket = io('http://localhost:8080', {
          transports: ['websocket', 'polling'],
          auth: {
            token: token
          },
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          timeout: 10000
        });
        
        this.socket.on('connect', () => {
          console.log('✅ Socket.io connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Send user online status after connection
          if (userData) {
            this.setUserOnline(userData);
          }
          
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Socket.io disconnected:', reason);
          this.isConnected = false;
          
          if (reason === 'io server disconnect') {
            // Server forced disconnect, need to manually reconnect
            this.socket.connect();
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket.io connection error:', error);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`));
          } else {
            console.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          }
        });

        this.socket.on('reconnect_attempt', (attempt) => {
          console.log(`🔄 Socket.io reconnection attempt: ${attempt}`);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('❌ Socket.io reconnection failed');
          reject(new Error('Reconnection failed'));
        });

      } catch (error) {
        console.error('❌ WebSocket connection setup error:', error);
        reject(error);
      }
    });
  }

  // WebRTC event listeners
  onWebRTCOffer(handler) {
    this.socket?.on('webrtc_offer', handler);
  }

  onWebRTCAnswer(handler) {
    this.socket?.on('webrtc_answer', handler);
  }

  onICECandidate(handler) {
    this.socket?.on('webrtc_ice_candidate', handler);
  }

  onEndCall(handler) {
    this.socket?.on('webrtc_end_call', handler);
  }

  onCallRequest(handler) {
    this.socket?.on('call_request', handler);
  }

  onCallAccepted(handler) {
    this.socket?.on('call_accepted', handler);
  }

  onCallRejected(handler) {
    this.socket?.on('call_rejected', handler);
  }

  // Friend request real-time events
  onNewFriendRequest(handler) {
    this.socket?.on('new_friend_request', handler);
  }

  onFriendRequestAccepted(handler) {
    this.socket?.on('friend_request_accepted', handler);
  }

  // Chat events
  onChatMessage(handler) {
    this.socket?.on('chat_message', handler);
  }

  onMessageDelivered(handler) {
    this.socket?.on('message_delivered', handler);
  }

  onMessageRead(handler) {
    this.socket?.on('message_read', handler);
  }

  onTypingStart(handler) {
    this.socket?.on('typing_start', handler);
  }

  onTypingEnd(handler) {
    this.socket?.on('typing_end', handler);
  }

  // User status events
  onUserOnline(handler) {
    this.socket?.on('user_online', handler);
  }

  onUserOffline(handler) {
    this.socket?.on('user_offline', handler);
  }

  onOnlineUsers(handler) {
    this.socket?.on('online_users', handler);
  }

  removeMessageHandler(event, handler) {
    this.socket?.off(event, handler);
  }

  // WebRTC signaling methods
  sendWebRTCOffer(remoteUserId, offer, callId) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('webrtc_offer', {
      toUserId: remoteUserId,
      offer,
      callId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  sendWebRTCAnswer(remoteUserId, answer, callId) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('webrtc_answer', {
      toUserId: remoteUserId,
      answer,
      callId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  sendICECandidate(remoteUserId, candidate, callId) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('webrtc_ice_candidate', {
      toUserId: remoteUserId,
      candidate,
      callId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  sendEndCall(remoteUserId, callId) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('webrtc_end_call', {
      toUserId: remoteUserId,
      callId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  // Call initiation
  sendCallRequest(remoteUserId, callType = 'video') {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return null;
    }
    
    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.socket?.emit('call_request', {
      toUserId: remoteUserId,
      callType,
      callId,
      timestamp: new Date().toISOString()
    });

    return callId;
  }

  sendCallAccepted(remoteUserId, callId) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('call_accepted', {
      toUserId: remoteUserId,
      callId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  sendCallRejected(remoteUserId, callId) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('call_rejected', {
      toUserId: remoteUserId,
      callId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  // Chat methods
  sendChatMessage(recipientId, content, messageId) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('chat_message', {
      recipientId,
      content,
      messageId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  sendTypingStart(recipientId) {
    if (!this.isConnected) return false;
    
    this.socket?.emit('typing_start', {
      recipientId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  sendTypingEnd(recipientId) {
    if (!this.isConnected) return false;
    
    this.socket?.emit('typing_end', {
      recipientId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  // User authentication
  setUserOnline(userData) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('user_online', {
      ...userData,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  // Friend request notifications
  sendFriendRequestNotification(toUserId, fromUser, requestId) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('friend_request_sent', {
      toUserId,
      fromUser,
      requestId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  sendFriendRequestAccepted(fromUserId, toUser, requestId) {
    if (!this.isConnected) {
      console.error('❌ WebSocket not connected');
      return false;
    }
    
    this.socket?.emit('friend_request_accepted', {
      fromUserId,
      toUser,
      requestId,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  // Connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
    console.log('🔌 WebSocket disconnected');
  }

  // Reconnect manually
  reconnect(userData = null) {
    this.disconnect();
    return this.connect(userData);
  }
}

export const webSocketService = new WebSocketService();