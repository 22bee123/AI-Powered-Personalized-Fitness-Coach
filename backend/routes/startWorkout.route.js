import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { 
  startWorkout, 
  updateExerciseProgress, 
  updateWarmupCooldown, 
  completeWorkout, 
  getActiveWorkout, 
  getWorkoutHistory 
} from '../Controller/startWorkout.controller.js';

const router = express.Router();

// Start a new workout session
router.post('/start', protect, startWorkout);

// Update exercise progress
router.put('/exercise', protect, updateExerciseProgress);

// Update warmup/cooldown status
router.put('/warmup-cooldown', protect, updateWarmupCooldown);

// Complete workout session
router.put('/complete/:workoutId', protect, completeWorkout);

// Get active workout session
router.get('/active', protect, getActiveWorkout);

// Get workout history
router.get('/history', protect, getWorkoutHistory);

export default router;