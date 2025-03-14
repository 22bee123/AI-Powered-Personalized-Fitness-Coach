import express from "express";
import { 
  getDifficultyLevels, 
  getWorkoutPlan, 
  getPersonalizedPlan, 
  getExerciseRecommendations,
  saveWorkoutPlan,
  getUserWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  deleteWorkoutPlan,
  toggleFavoriteWorkoutPlan,
  parseWorkoutPlanOnly
} from "../Controller/Fitness.controller.js";

const router = express.Router();

// Get available difficulty levels
router.get("/difficulty-levels", getDifficultyLevels);

// Get predefined workout plan based on difficulty
router.get("/workout-plan/:difficulty", getWorkoutPlan);

// Generate personalized workout plan with Gemini
router.post("/personalized-plan", getPersonalizedPlan);

// Get exercise recommendations
router.post("/exercise-recommendations", getExerciseRecommendations);

// Parse workout plan without saving
router.post("/parse-workout-plan", parseWorkoutPlanOnly);

// Workout plan management routes
router.post("/save-workout-plan", saveWorkoutPlan);
router.get("/user-workout-plans/:userId", getUserWorkoutPlans);
router.get("/workout-plan-details/:planId", getWorkoutPlanById);
router.put("/update-workout-plan/:planId", updateWorkoutPlan);
router.delete("/delete-workout-plan/:planId", deleteWorkoutPlan);
router.patch("/toggle-favorite/:planId", toggleFavoriteWorkoutPlan);

export default router;
