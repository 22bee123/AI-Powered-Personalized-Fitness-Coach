import express from 'express';
import { getUserProfile, updateUserProfile, syncClerkUser } from '../Controller/User.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route for Clerk user synchronization
// @route   POST /api/users/clerk-sync
// @desc    Sync user from Clerk
// @access  Public
router.post('/clerk-sync', syncClerkUser);

// All routes below this are protected and require authentication
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
