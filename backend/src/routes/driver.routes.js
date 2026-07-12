import express from "express";
const router = express.Router();

import { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver,getDriverDispatchedTrips,getDriverTrips } from "../controllers/driver.controller.js";
import { protect, authorize } from "../middlewares/authmiddleware.js";
// Driver Routes
router.get("/",protect,authorize("FleetManager", "Driver"),  getDrivers);
router.get("/:id", protect, authorize("FleetManager", "Driver"), getDriverById);
router.post("/", protect, authorize("FleetManager"), createDriver);
router.patch("/:id", protect, authorize("FleetManager", "Driver"), updateDriver);
router.delete("/:id", protect, authorize("FleetManager"), deleteDriver);
router.get("/:id/trips", protect, authorize("FleetManager", "Driver"), getDriverTrips);
router.get("/:id/dispatched-trips", protect, authorize("FleetManager", "Driver"), getDriverDispatchedTrips);
export default router;