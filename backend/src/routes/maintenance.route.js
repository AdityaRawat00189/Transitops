import express from "express"
const router = express.Router();

import {getAllMaintenance, createMaintenance, getMaintenanceById, closeMaintenance} from '../controllers/maintenance.controller.js'
import { protect, authorize } from "../middlewares/authmiddleware.js";

router.get('/', protect, authorize("FleetManager", "MaintenanceTech", "FinancialAnalyst"), getAllMaintenance);
router.post('/', protect, authorize("FleetManager", "MaintenanceTech", "FinancialAnalyst"), createMaintenance);
router.get('/:id', protect, authorize("FleetManager", "MaintenanceTech", "FinancialAnalyst"), getMaintenanceById);
router.patch('/:id', protect, authorize("FleetManager", "MaintenanceTech", "FinancialAnalyst"), closeMaintenance);

export default router;