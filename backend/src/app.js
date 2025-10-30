﻿// backend/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import friendRoutes from "./routes/friends.js";

// Import Socket.io server
import { io, connectedUsers } from './websocket/server.js';

dotenv.config();

const app = express();

// Make io and connectedUsers available to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/signlink", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log("✅ Connected to MongoDB Atlas");
  console.log("📊 Database:", mongoose.connection.name);
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
});

// Enhanced CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3001",
    "http://localhost:5173", 
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://192.168.0.195:3001"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  console.log('Authorization:', req.headers.authorization ? 'Present' : 'Missing');
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "SignLink Backend API with Socket.io",
    version: "1.1.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      friends: "/api/friends",
      health: "/api/health"
    },
    websocket: "Socket.io on port 8080",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMessages = {
    0: "disconnected",
    1: "connected", 
    2: "connecting",
    3: "disconnecting"
  };
  
  res.json({ 
    success: true,
    status: "OK", 
    message: "SignLink API with Socket.io is running",
    database: statusMessages[dbStatus] || "unknown",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("🔴 Server Error:", error);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : error.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n🚀 SignLink Backend Server Started!");
  console.log("📍 Port:", PORT);
  console.log("🔌 Socket.io: Port 8080");
  console.log("🌍 Frontend: http://localhost:3001/");
  console.log("📊 Database:", process.env.MONGODB_URI ? "MongoDB Atlas" : "Local");
  console.log("💡 Health Check: http://localhost:" + PORT + "/api/health");
  console.log("👥 Friends API: http://localhost:" + PORT + "/api/friends");
  console.log("🔑 Auth API: http://localhost:" + PORT + "/api/auth");
  console.log("👤 Users API: http://localhost:" + PORT + "/api/users");
  console.log("🔧 CORS Enabled for:", [
    "http://localhost:3001",
    "http://localhost:5173", 
    "http://localhost:3000"
  ].join(", "));
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔻 Shutting down gracefully...");
  await mongoose.connection.close();
  console.log("✅ MongoDB connection closed.");
  process.exit(0);
});