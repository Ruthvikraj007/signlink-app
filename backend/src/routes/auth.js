import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Import the User model

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, userType } = req.body;

    // Validation
    if (!username || !email || !password || !userType) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    // Check if user exists using MongoDB
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email or username already exists"
      });
    }

    // Create user using MongoDB
    const user = new User({
      username,
      email,
      password, // Will be automatically hashed by the User model
      userType,
      isOnline: true,
      lastSeen: new Date()
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
        isOnline: user.isOnline
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed. Please try again."
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required"
      });
    }

    // Find user in MongoDB
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid username or password"
      });
    }

    // Check password using the model's method
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: "Invalid username or password"
      });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again."
    });
  }
});

export default router;