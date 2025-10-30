import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Search users
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Search query is required"
      });
    }

    const users = await User.find({
      username: { $regex: q, $options: "i" }
    }).select("username email userType avatar isOnline lastSeen");

    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }))
    });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "Search failed"
    });
  }
});

// Get user profile
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user"
    });
  }
});

// Get all users (for testing)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("username email userType avatar isOnline lastSeen");
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen
      }))
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get users"
    });
  }
});

export default router;