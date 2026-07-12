import express from "express";

const router = express.Router();

import { createTrip, dispatchTrip, completeTrip, cancelTrip, getTrips, getTripById } from "../controllers/trip.controller.js";
import { protect, authorize } from "../middlewares/authmiddleware.js";

// Trip Routes
router.get("/", protect, authorize("FleetManager", "Driver"), getTrips);
router.get("/:id", protect, authorize("FleetManager", "Driver"), getTripById);
router.post("/", protect, authorize("FleetManager", "Driver"), createTrip);
router.patch("/dispatch/:id", protect, authorize("FleetManager", "Driver"), dispatchTrip);
router.patch("/complete/:id", protect, authorize("FleetManager", "Driver"), completeTrip);
router.patch("/cancel/:id", protect, authorize("FleetManager", "Driver"), cancelTrip);

export default router;