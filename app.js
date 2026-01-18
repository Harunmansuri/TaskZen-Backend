import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import taskRoutes from "./routes/task.route.js";

dotenv.config();

const app = express();

/* -------------------- Middleware -------------------- */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* 🔥 OPEN CORS (Frontend abhi nahi hai) */
app.use(
  cors({
    origin: true,          // ✅ allow all origins
    credentials: true,     // future frontend ke liye safe
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* -------------------- DB -------------------- */
connectDB();

/* -------------------- Routes -------------------- */
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/tasks", taskRoutes);

/* -------------------- Health Check -------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend API is running on Vercel 🚀",
  });
});

/* -------------------- 404 -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* -------------------- Error Handler -------------------- */
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
