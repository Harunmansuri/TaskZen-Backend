import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    // Normalize email
    email = email.trim().toLowerCase();
    // 1️⃣ Required fields check
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }
    if (
      username.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password cannot be empty",
      });
    }

    if (username.length < 5 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 5 and 30 characters long",
      });
    }

    // 2️⃣ Email format validation

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // 3️⃣ Password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // 4️⃣ Case-insensitive email check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 6️⃣ Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // 7️⃣ Response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found Please register first",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // ✅ Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    // ✅ Set cookie FIRST
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None", // frontend-backend different domain ho to
      path: "/", // 🔴
    });

    // ✅ Send response ONCE
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token, // optional (Postman testing ke liye)
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      path: "/", // 🔥 MUST SAME
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { user } = req;

    const getDetails = await User.findById(user.id)
      .populate("tasks")
      .select("-password -__v -createdAt -updatedAt");

    if (!getDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const allTasks = getDetails.tasks;

    // ✅ Status mapping EXACTLY like Task model
    const yetToStart = allTasks.filter(
      task => task.status === "Start"
    );

    const inProgress = allTasks.filter(
      task => task.status === "In Progress"
    );

    const completed = allTasks.filter(
      task => task.status === "Completed"
    );

    return res.status(200).json({
      success: true,
      tasks: {
        yetToStart,
        inProgress,
        completed,
      },
      user: getDetails,
    });

  } catch (error) {
    console.error("Get User Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

