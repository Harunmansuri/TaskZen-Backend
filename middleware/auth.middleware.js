import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * JWT Authentication Middleware
 * Supports:
 * 1. Cookie based token
 * 2. Authorization Bearer token
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Get token from cookie OR Authorization header
    const token =
      req.cookies?.token ||
      (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer") &&
        req.headers.authorization.split(" ")[1]);

    // 2️⃣ Token missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Get user from DB (remove password)
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 5️⃣ Attach user to request
    req.user = user;

    // 6️⃣ Allow request to continue
    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token expired, please login again"
          : "Invalid authentication token",
    });
  }
};

export default authMiddleware;
