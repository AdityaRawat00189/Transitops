import express from "express";
const router = express.Router();

import { getDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from "../controllers/driver.controller.js";
import { protect, authorize } from "../middlewares/authmiddleware.js";
// Driver Routes
router.get("/",protect,authorize("FleetManager"),  getDrivers);
router.get("/:id", protect, authorize("FleetManager"), getDriverById);
router.post("/", protect, authorize("FleetManager"), createDriver);
router.patch("/:id", protect, authorize("FleetManager"), updateDriver);
router.delete("/:id", protect, authorize("FleetManager"), deleteDriver);

export default router;