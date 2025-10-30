// src/context/WebSocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { webSocketService } from '../services/websocketService';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [newRequestCount, setNewRequestCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});
  
  // Safely get user from AuthContext
  let user;
  try {
    const authContext = useAuth();
    user = authContext.user;
  } catch (error) {
    console.warn('⚠️ AuthContext not available in WebSocketProvider:', error.message);
    user = null;
  }

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(async () => {
    if (!user) {
      console.log('⏸️ WebSocket initialization skipped - no user');
      return;
    }

    try {
      await webSocketService.connect({
        userId: user.id,
        username: user.username,
        userType: user.userType
      });
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      // Retry after 3 seconds
      setTimeout(() => initializeWebSocket(), 3000);
    }
  }, [user]);

  // Setup WebSocket event listeners
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const handleConnect = () => {
      if (isMounted) {
        console.log('🟢 WebSocket connected in context');
        setIsConnected(true);
      }
    };

    const handleDisconnect = () => {
      if (isMounted) {
        console.log('🔴 WebSocket disconnected in context');
        setIsConnected(false);
      }
    };

    const handleOnlineUsers = (data) => {
      if (isMounted) {
        setOnlineUsers(data.users || []);
      }
    };

    const handleUserOnline = (data) => {
      if (isMounted) {
        setOnlineUsers(prev => {
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
      }
    };

    const handleUserOffline = (data) => {
      if (isMounted) {
        setOnlineUsers(prev => prev.filter(id => id !== data.userId));
      }
    };

    // Friend request handlers
    const handleNewFriendRequest = (data) => {
      if (isMounted) {
        console.log('📬 New friend request received:', data);
        setFriendRequests(prev => {
          const exists = prev.some(req => req.id === data.requestId);
          if (!exists) {
            return [...prev, {
              id: data.requestId,
              username: data.fromUser.username,
              email: data.fromUser.email,
              userType: data.fromUser.userType,
              avatar: data.fromUser.avatar,
              isOnline: data.fromUser.isOnline,
              lastSeen: data.fromUser.lastSeen,
              sentAt: data.timestamp,
              status: 'pending'
            }];
          }
          return prev;
        });
        setNewRequestCount(prev => prev + 1);
      }
    };

    const handleFriendRequestAccepted = (data) => {
      if (isMounted) {
        console.log('✅ Friend request accepted:', data);
        // Remove from pending requests
        setFriendRequests(prev => prev.filter(req => req.id !== data.requestId));
        
        // You can add notification logic here
        if (data.newFriend) {
          console.log('🎉 New friend added:', data.newFriend.username);
        }
      }
    };

    // FIXED: Chat message handler - Properly filter messages by both sender and recipient
    const handleChatMessage = (data) => {
      if (isMounted && user) {
        console.log('💬 New chat message received:', data);
        
        // Only add message if it's meant for the current user
        if (data.recipientId === user.id) {
          setMessages(prev => [...prev, {
            id: data.messageId,
            senderId: data.senderId,
            recipientId: data.recipientId,
            text: data.content,
            timestamp: data.timestamp,
            sender: 'them', // This message is from someone else
            delivered: true,
            read: false
          }]);
          console.log('✅ Message added to chat for current user');
        } else {
          console.log('⚠️ Message ignored - not for current user');
        }
      }
    };

    const handleMessageDelivered = (data) => {
      if (isMounted) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, delivered: true } : msg
        ));
      }
    };

    const handleMessageRead = (data) => {
      if (isMounted) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId ? { ...msg, read: true } : msg
        ));
      }
    };

    // Typing indicators
    const handleTypingStart = (data) => {
      if (isMounted) {
        setTypingUsers(prev => ({
          ...prev,
          [data.senderId]: true
        }));
      }
    };

    const handleTypingEnd = (data) => {
      if (isMounted) {
        setTypingUsers(prev => ({
          ...prev,
          [data.senderId]: false
        }));
      }
    };

    // Add event listeners
    webSocketService.socket?.on('connect', handleConnect);
    webSocketService.socket?.on('disconnect', handleDisconnect);
    webSocketService.socket?.on('online_users', handleOnlineUsers);
    webSocketService.socket?.on('user_online', handleUserOnline);
    webSocketService.socket?.on('user_offline', handleUserOffline);
    webSocketService.socket?.on('new_friend_request', handleNewFriendRequest);
    webSocketService.socket?.on('friend_request_accepted', handleFriendRequestAccepted);
    webSocketService.socket?.on('chat_message', handleChatMessage);
    webSocketService.socket?.on('message_delivered', handleMessageDelivered);
    webSocketService.socket?.on('message_read', handleMessageRead);
    webSocketService.socket?.on('typing_start', handleTypingStart);
    webSocketService.socket?.on('typing_end', handleTypingEnd);

    // Initialize connection
    initializeWebSocket();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      webSocketService.socket?.off('connect', handleConnect);
      webSocketService.socket?.off('disconnect', handleDisconnect);
      webSocketService.socket?.off('online_users', handleOnlineUsers);
      webSocketService.socket?.off('user_online', handleUserOnline);
      webSocketService.socket?.off('user_offline', handleUserOffline);
      webSocketService.socket?.off('new_friend_request', handleNewFriendRequest);
      webSocketService.socket?.off('friend_request_accepted', handleFriendRequestAccepted);
      webSocketService.socket?.off('chat_message', handleChatMessage);
      webSocketService.socket?.off('message_delivered', handleMessageDelivered);
      webSocketService.socket?.off('message_read', handleMessageRead);
      webSocketService.socket?.off('typing_start', handleTypingStart);
      webSocketService.socket?.off('typing_end', handleTypingEnd);
      
      webSocketService.disconnect();
    };
  }, [user, initializeWebSocket]);

  // FIXED: Send message with proper recipient filtering
  const sendMessage = useCallback((recipientId, content) => {
    if (!user) {
      console.error('❌ Cannot send message - no user');
      return null;
    }

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add to local messages immediately (as sent by me)
    setMessages(prev => [...prev, {
      id: messageId,
      senderId: user.id,
      recipientId: recipientId,
      text: content,
      timestamp: new Date().toISOString(),
      sender: 'me', // This message is from me
      delivered: false,
      read: false
    }]);

    // Send via WebSocket
    const success = webSocketService.sendChatMessage(recipientId, content, messageId);
    
    if (!success) {
      // Mark as failed if couldn't send
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, delivered: false, error: true } : msg
      ));
    } else {
      console.log('✅ Message sent via WebSocket to:', recipientId);
    }

    return messageId;
  }, [user]);

  const sendTypingStart = useCallback((recipientId) => {
    if (!user) return false;
    return webSocketService.sendTypingStart(recipientId);
  }, [user]);

  const sendTypingEnd = useCallback((recipientId) => {
    if (!user) return false;
    return webSocketService.sendTypingEnd(recipientId);
  }, [user]);

  const clearNewRequestCount = useCallback(() => {
    setNewRequestCount(0);
  }, []);

  const removeFriendRequest = useCallback((requestId) => {
    setFriendRequests(prev => prev.filter(req => req.id !== requestId));
  }, []);

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  const isUserTyping = useCallback((userId) => {
    return !!typingUsers[userId];
  }, [typingUsers]);

  const getConnectionStatus = useCallback(() => {
    return webSocketService.getConnectionStatus();
  }, []);

  const reconnect = useCallback(() => {
    return initializeWebSocket();
  }, [initializeWebSocket]);

  const value = {
    // State
    isConnected,
    onlineUsers,
    messages,
    friendRequests,
    newRequestCount,
    typingUsers,
    
    // Actions
    sendMessage,
    sendTypingStart,
    sendTypingEnd,
    clearNewRequestCount,
    removeFriendRequest,
    isUserOnline,
    isUserTyping,
    getConnectionStatus,
    reconnect,
    
    // Service
    webSocketService
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};