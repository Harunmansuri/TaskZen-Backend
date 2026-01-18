import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import userRoutes from "./routes/user.route.js";
import taskRoutes from "./routes/task.route.js";

// Load env variables
dotenv.config();

// Init app
const app = express();

// -------------------- Middleware --------------------
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173"], // production me apna frontend URL add karna
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Logger (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// -------------------- Database --------------------
// ✅ Vercel me DB connection function ke andar call hota hai
connectDB();

// -------------------- Routes --------------------
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1", taskRoutes);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running on Vercel 🚀",
  });
});

// -------------------- 404 Handler --------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// -------------------- Global Error Handler --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ❌ app.listen nahi likhna (Vercel ke liye)
// ✅ sirf export default
export default app;
