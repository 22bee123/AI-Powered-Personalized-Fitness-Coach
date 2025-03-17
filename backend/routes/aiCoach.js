import express from 'express';
import { 
  chatWithAICoach,
  getWorkoutSuggestions,
  getNutritionAdvice
} from '../Controller/AICoach.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// AI Coach chat endpoint (protected)
router.post('/chat', authMiddleware, chatWithAICoach);

// Get workout suggestions from AI coach (protected)
router.post('/workout-suggestions', authMiddleware, getWorkoutSuggestions);

// Get nutrition advice from AI coach (protected)
router.post('/nutrition-advice', authMiddleware, getNutritionAdvice);

export default router;
