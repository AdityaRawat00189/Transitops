import express from "express";
const router = express.Router();

import { createFuelLog, getFuelLogs, deleteFuelLog, totalFuel } from "../controllers/fuel.controller.js";

import { protect, authorize } from "../middlewares/authmiddleware.js";

// Fuel Routes
router.get("/", protect, authorize("FleetManager", "Driver"), getFuelLogs);
router.post("/", protect, authorize("FleetManager", "Driver"), createFuelLog);
router.delete("/:id", protect, authorize("FleetManager", "Driver"), deleteFuelLog);
router.get("/total/:vehicleId", protect, authorize("FleetManager", "Driver"), totalFuel);

export default router;