import express from 'express';
import { 
  generateNutritionPlan, 
  getLatestNutritionPlan, 
  getAllNutritionPlans, 
  deleteNutritionPlan 
} from '../Controller/nutrition.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Generate a nutrition plan
router.post('/generate', generateNutritionPlan);

// Get the latest nutrition plan
router.get('/latest', getLatestNutritionPlan);

// Get all nutrition plans
router.get('/all', getAllNutritionPlans);

// Delete a nutrition plan
router.delete('/:id', deleteNutritionPlan);

export default router;