import express from "express";
const router = express.Router();
import { createExpense, getExpenses, deleteExpense } from "../controllers/expense.controller.js";
import { protect, authorize } from "../middlewares/authmiddleware.js";

// Expense Routes
router.post("/", protect, authorize("FleetManager", "Driver"), createExpense);
router.get("/", protect, authorize("FleetManager", "Driver"), getExpenses);
router.delete("/:id", protect, authorize("FleetManager", "Driver"), deleteExpense);

export default router;