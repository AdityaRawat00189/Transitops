import express from "express"
const router = express.Router();

import {getAllMaintenance, createMaintenance, getMaintenanceById, closeMaintenance} from '../controllers/maintenance.controller.js'
import { protect, authorize } from "../middlewares/authmiddleware.js";

router.get('/', protect,authorize("FinancialAnalyst") ,getAllMaintenance);
router.post('/', protect,authorize("FinancialAnalyst") ,createMaintenance);
router.get('/:id', protect,authorize("FinancialAnalyst") ,getMaintenanceById);
router.patch('/:id', protect,authorize("FinancialAnalyst") ,closeMaintenance);

export default router;