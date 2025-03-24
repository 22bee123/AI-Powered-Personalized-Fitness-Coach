import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import * as workoutCompleteController from '../Controller/workoutComplete.controller.js';

const router = express.Router();

// Create a workout completion record
router.post('/', protect, workoutCompleteController.createWorkoutComplete);

// Get all completed workouts for the user
router.get('/', protect, workoutCompleteController.getCompletedWorkouts);

// Get completion stats for a specific workout plan
router.get('/stats/:workoutPlanId', protect, workoutCompleteController.getWorkoutPlanStats);

export default router;
