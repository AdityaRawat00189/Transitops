import express from "express";
const router = express.Router();

import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from "../controllers/vehicle.controller.js";
import { protect, authorize } from "../middlewares/authmiddleware.js";


router.get("/", protect, authorize("FleetManager"), getVehicles);
router.post("/", protect, authorize("FleetManager"), addVehicle);
// router.get("/:id", protect, authorize("FleetManager"), getVehicle);
router.patch("/:id", protect, authorize("FleetManager"), updateVehicle)
router.get(":id", protect, authorize("FleetManager", deleteVehicle));

export default router