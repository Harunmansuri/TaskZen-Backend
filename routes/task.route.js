import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  addTask,
  getTask,
  editTask,
  deleteTask,
} from "../controllers/task.controller.js";

const router = express.Router();

// Protected Task Routes
router.post("/add-task", authMiddleware, addTask);
router.get("/get-task/:id", authMiddleware, getTask);
router.put("/edit-task/:id", authMiddleware, editTask);
router.delete("/delete-task/:id", authMiddleware, deleteTask);

export default router;
