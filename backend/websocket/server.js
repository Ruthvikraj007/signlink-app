// backend/websocket/server.js
import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3001",
      "http://localhost:5173", 
      "http://localhost:3000",
      "http://127.0.0.1:3001",
      "http://192.168.0.195:3001"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 New Socket.io connection:', socket.id);

  // User joins with their ID
  socket.on('user_online', (userData) => {
    const { userId, username, userType } = userData;
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    
    console.log(`🟢 User ${userId} (${username}) is online`);
    
    // Notify others about online status
    socket.broadcast.emit('user_online', {
      userId,
      username,
      userType,
      timestamp: new Date().toISOString()
    });

    // Send current online users to the new user
    const onlineUsers = Array.from(connectedUsers.keys());
    socket.emit('online_users', { users: onlineUsers });
  });

  // Handle chat messages
  socket.on('chat_message', (message) => {
    const { recipientId, content, messageId } = message;
    
    console.log(`💬 Chat message from ${socket.userId} to ${recipientId}: ${content}`);
    
    // Send delivery confirmation to sender
    socket.emit('message_delivered', {
      messageId,
      timestamp: new Date().toISOString()
    });

    // Forward message to recipient
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('chat_message', {
        messageId,
        senderId: socket.userId,
        recipientId,
        content,
        timestamp: new Date().toISOString()
      });
    }
  });

  // WebRTC Signaling handlers
  socket.on('webrtc_offer', (data) => {
    const { toUserId, offer, callId } = data;
    console.log(`📞 WebRTC offer from ${socket.userId} to ${toUserId}`);
    
    const recipientSocketId = connectedUsers.get(toUserId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('webrtc_offer', {
        fromUserId: socket.userId,
        offer,
        callId,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('webrtc_answer', (data) => {
    const { toUserId, answer, callId } = data;
    console.log(`📞 WebRTC answer from ${socket.userId} to ${toUserId}`);
    
    const recipientSocketId = connectedUsers.get(toUserId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('webrtc_answer', {
        fromUserId: socket.userId,
        answer,
        callId,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('webrtc_ice_candidate', (data) => {
    const { toUserId, candidate, callId } = data;
    
    const recipientSocketId = connectedUsers.get(toUserId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('webrtc_ice_candidate', {
        fromUserId: socket.userId,
        candidate,
        callId,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('webrtc_end_call', (data) => {
    const { toUserId, callId } = data;
    console.log(`📞 Call ended by ${socket.userId}`);
    
    const recipientSocketId = connectedUsers.get(toUserId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('webrtc_end_call', {
        fromUserId: socket.userId,
        callId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Call initiation handlers
  socket.on('call_request', (data) => {
    const { toUserId, callType, callId } = data;
    console.log(`📞 ${callType} call request from ${socket.userId} to ${toUserId}`);
    
    const recipientSocketId = connectedUsers.get(toUserId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('call_request', {
        fromUserId: socket.userId,
        callType,
        callId,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('call_accepted', (data) => {
    const { toUserId, callId } = data;
    console.log(`✅ Call accepted by ${socket.userId}`);
    
    const recipientSocketId = connectedUsers.get(toUserId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('call_accepted', {
        fromUserId: socket.userId,
        callId,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('call_rejected', (data) => {
    const { toUserId, callId } = data;
    console.log(`❌ Call rejected by ${socket.userId}`);
    
    const recipientSocketId = connectedUsers.get(toUserId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('call_rejected', {
        fromUserId: socket.userId,
        callId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Friend request notifications
  socket.on('friend_request_sent', (data) => {
    const { toUserId, fromUser, requestId } = data;
    console.log(`🤝 Friend request from ${fromUser.username} to ${toUserId}`);
    
    const recipientSocketId = connectedUsers.get(toUserId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('new_friend_request', {
        requestId,
        fromUser,
        timestamp: new Date().toISOString()
      });
      console.log(`📬 Notified user ${toUserId} about friend request`);
    }
  });

  socket.on('friend_request_accepted', (data) => {
    const { fromUserId, toUser, requestId } = data;
    console.log(`✅ Friend request accepted by ${toUser.username}`);
    
    const senderSocketId = connectedUsers.get(fromUserId);
    if (senderSocketId) {
      socket.to(senderSocketId).emit('friend_request_accepted', {
        requestId,
        newFriend: toUser,
        timestamp: new Date().toISOString()
      });
      console.log(`📬 Notified user ${fromUserId} about accepted friend request`);
    }
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { recipientId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('typing_start', {
        senderId: socket.userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('typing_end', (data) => {
    const { recipientId } = data;
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      socket.to(recipientSocketId).emit('typing_end', {
        senderId: socket.userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
    
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      
      // Notify others about offline status
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Start Socket.io server on port 8080
server.listen(8080, () => {
  console.log('🚀 Socket.io server running on port 8080');
});

export { io, server, connectedUsers };