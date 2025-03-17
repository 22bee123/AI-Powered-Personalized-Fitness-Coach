import express from 'express';
import { 
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  setActiveWorkoutPlan,
  setActiveNutritionPlan,
  addWorkoutPlanToUser,
  addNutritionPlanToUser 
} from '../Controller/User.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Auth routes (public)
router.post('/register', registerUser);
router.post('/login', loginUser);

// User profile routes (protected)
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

// Workout plan routes (protected)
router.put('/active-workout', authMiddleware, setActiveWorkoutPlan);
router.post('/workout-plans', authMiddleware, addWorkoutPlanToUser);

// Nutrition plan routes (protected)
router.put('/active-nutrition', authMiddleware, setActiveNutritionPlan);
router.post('/nutrition-plans', authMiddleware, addNutritionPlanToUser);

export default router;
