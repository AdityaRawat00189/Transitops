import express from 'express';
const router = express.Router();

import { getLocationLogs } from '../controllers/location.controller.js';

router.get('/trips/:tripId/location-logs', getLocationLogs);

export default router;