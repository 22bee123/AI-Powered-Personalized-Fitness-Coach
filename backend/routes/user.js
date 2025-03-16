import express from 'express';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { 
  createOrUpdateUser, 
  getUserByClerkId, 
  updateUserProfile, 
  setActiveWorkoutPlan, 
  setActiveNutritionPlan, 
  addWorkoutPlanToUser, 
  addNutritionPlanToUser 
} from '../Controller/User.controller.js';

const router = express.Router();

// Middleware to verify Clerk authentication
const requireAuth = ClerkExpressRequireAuth({
  // Optional: Customize the behavior
  onError: (err, req, res) => {
    console.error('Clerk authentication error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// Create or update user (called after Clerk authentication)
router.post('/create-or-update', createOrUpdateUser);

// Get user by Clerk ID (protected route)
router.get('/:clerkId', requireAuth, getUserByClerkId);

// Update user profile details (protected route)
router.put('/:clerkId/profile', requireAuth, updateUserProfile);

// Set active workout plan for user (protected route)
router.put('/:clerkId/active-workout', requireAuth, setActiveWorkoutPlan);

// Set active nutrition plan for user (protected route)
router.put('/:clerkId/active-nutrition', requireAuth, setActiveNutritionPlan);

// Add workout plan to user (protected route)
router.post('/:clerkId/workout-plans', requireAuth, addWorkoutPlanToUser);

// Add nutrition plan to user (protected route)
router.post('/:clerkId/nutrition-plans', requireAuth, addNutritionPlanToUser);

export default router;
