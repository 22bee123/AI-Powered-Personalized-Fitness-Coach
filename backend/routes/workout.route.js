import express from 'express';
import { generateWorkoutPlan, getLatestWorkoutPlan, getAllWorkoutPlans, deleteWorkoutPlan } from '../controller/workout.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/generate', protect, generateWorkoutPlan);
router.get('/latest', protect, getLatestWorkoutPlan);
router.get('/all', protect, getAllWorkoutPlans);
router.delete('/:id', protect, deleteWorkoutPlan);

export default router;