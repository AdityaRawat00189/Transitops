import express from "express";
const router = express.Router();

import { getAllDrivers, getDriverById, createDriver, updateDriver, deleteDriver } from "../controllers/driverController.js";

// Driver Routes
router.get("/", getAllDrivers);
router.get("/:id", getDriverById);
router.post("/", createDriver);
router.patch("/:id", updateDriver);
router.delete("/:id", deleteDriver);

export default router;