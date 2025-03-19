import express from 'express';
import { getUserProfile, updateUserProfile } from '../controller/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes in this file are protected and require authentication
router.use(protect);

// @route   GET /api/users/me
// @desc    Get user profile
// @access  Private
router.get('/me', getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateUserProfile);

export default router;
