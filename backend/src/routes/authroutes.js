import express from 'express';
const router = express.Router();

import {registerUser, loginUser} from '../controllers/authController.js';

// Authentication Routes
router.post('/signup', registerUser);
router.post('/login',loginUser)

export default router;