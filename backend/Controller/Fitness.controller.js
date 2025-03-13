import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import WorkoutPlan from "../models/fitness.model.js";

// Ensure dotenv is configured properly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Exercise data for different difficulty levels
const exerciseData = {
  easy: {
    warmup: [
      { name: "Light jogging in place", duration: "3 minutes" },
      { name: "Arm circles", reps: "10 in each direction" },
      { name: "Shoulder rolls", reps: "10 forward, 10 backward" },
      { name: "Hip rotations", reps: "10 in each direction" },
      { name: "Knee lifts", reps: "10 each leg" }
    ],
    exercises: [
      { 
        name: "Bodyweight squats", 
        sets: 2, 
        reps: 10, 
        rest: "60 seconds",
        instructions: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to standing."
      },
      { 
        name: "Wall push-ups", 
        sets: 2, 
        reps: 10, 
        rest: "60 seconds",
        instructions: "Stand facing a wall, place hands on wall at shoulder height, bend elbows to bring chest toward wall, then push back."
      },
      { 
        name: "Seated rows with resistance band", 
        sets: 2, 
        reps: 10, 
        rest: "60 seconds",
        instructions: "Sit with legs extended, wrap band around feet, pull band toward waist while keeping back straight."
      },
      { 
        name: "Glute bridges", 
        sets: 2, 
        reps: 10, 
        rest: "60 seconds",
        instructions: "Lie on back with knees bent, feet flat on floor. Lift hips toward ceiling, squeezing glutes at top."
      },
      { 
        name: "Standing calf raises", 
        sets: 2, 
        reps: 12, 
        rest: "45 seconds",
        instructions: "Stand with feet hip-width apart, raise heels off ground, then lower back down."
      }
    ],
    cooldown: [
      { name: "Hamstring stretch", duration: "30 seconds each leg" },
      { name: "Quadriceps stretch", duration: "30 seconds each leg" },
      { name: "Chest stretch", duration: "30 seconds" },
      { name: "Upper back stretch", duration: "30 seconds" },
      { name: "Deep breathing", duration: "1 minute" }
    ],
    schedule: [
      "Monday: Full body workout (all exercises)",
      "Tuesday: Rest or light walking",
      "Wednesday: Full body workout (all exercises)",
      "Thursday: Rest or light walking",
      "Friday: Full body workout (all exercises)",
      "Saturday & Sunday: Rest, light activity, or stretching"
    ],
    nutrition: [
      "Focus on whole foods with balanced meals containing protein, complex carbs, and healthy fats",
      "Stay hydrated with at least 8 glasses of water daily",
      "Eat a light meal 1-2 hours before exercising",
      "Consider a protein-rich snack within 30 minutes after workout"
    ],
    recovery: [
      "Ensure 7-9 hours of quality sleep each night",
      "Take rest days seriously - they're when your body rebuilds",
      "Consider gentle stretching or yoga on rest days",
      "Use ice for any joint discomfort after workouts"
    ]
  },
  medium: {
    warmup: [
      { name: "Jogging in place", duration: "3 minutes" },
      { name: "Jumping jacks", reps: "20" },
      { name: "Arm circles", reps: "15 in each direction" },
      { name: "Hip rotations", reps: "15 in each direction" },
      { name: "High knees", reps: "20 each leg" },
      { name: "Bodyweight squats", reps: "10" }
    ],
    exercises: [
      { 
        name: "Dumbbell squats", 
        sets: 3, 
        reps: 12, 
        rest: "60 seconds",
        instructions: "Hold dumbbells at shoulders, perform a squat keeping weight in heels and chest up."
      },
      { 
        name: "Push-ups (standard or modified)", 
        sets: 3, 
        reps: 10, 
        rest: "60 seconds",
        instructions: "Start in plank position, lower body until chest nearly touches floor, then push back up."
      },
      { 
        name: "Dumbbell rows", 
        sets: 3, 
        reps: 12, 
        rest: "60 seconds",
        instructions: "Bend at waist with one hand on bench, pull dumbbell toward hip keeping elbow close to body."
      },
      { 
        name: "Lunges", 
        sets: 3, 
        reps: "10 each leg", 
        rest: "60 seconds",
        instructions: "Step forward with one leg, lowering until both knees are at 90 degrees, then push back to start."
      },
      { 
        name: "Dumbbell shoulder press", 
        sets: 3, 
        reps: 12, 
        rest: "60 seconds",
        instructions: "Hold dumbbells at shoulder height, press upward until arms are extended, then lower."
      },
      { 
        name: "Plank", 
        sets: 3, 
        duration: "30 seconds", 
        rest: "45 seconds",
        instructions: "Hold body in straight line from head to heels, supporting weight on forearms and toes."
      }
    ],
    cooldown: [
      { name: "Hamstring stretch", duration: "30 seconds each leg" },
      { name: "Quadriceps stretch", duration: "30 seconds each leg" },
      { name: "Chest stretch", duration: "30 seconds" },
      { name: "Triceps stretch", duration: "30 seconds each arm" },
      { name: "Child's pose", duration: "30 seconds" },
      { name: "Deep breathing", duration: "1 minute" }
    ],
    schedule: [
      "Monday: Upper body focus (push-ups, shoulder press, rows)",
      "Tuesday: Lower body focus (squats, lunges, calf raises)",
      "Wednesday: Rest or light cardio (30 min walk/jog)",
      "Thursday: Full body workout (all exercises)",
      "Friday: Core and cardio (planks, mountain climbers, jumping jacks)",
      "Saturday: Active recovery (yoga or light stretching)",
      "Sunday: Complete rest"
    ],
    nutrition: [
      "Calculate daily caloric needs based on activity level",
      "Aim for 1.2-1.5g of protein per kg of bodyweight",
      "Time carbohydrates around workouts for optimal energy",
      "Include healthy fats for hormone production and joint health",
      "Consider pre-workout snack with carbs and post-workout meal with protein and carbs"
    ],
    recovery: [
      "Incorporate foam rolling 2-3 times per week",
      "Consider contrast showers (alternating hot and cold) to improve circulation",
      "Prioritize 7-8 hours of quality sleep",
      "Stay hydrated throughout the day, especially before and after workouts"
    ]
  },
  hard: {
    warmup: [
      { name: "Jump rope", duration: "3 minutes" },
      { name: "Jumping jacks", reps: "30" },
      { name: "Mountain climbers", reps: "20 each leg" },
      { name: "Arm circles", reps: "20 in each direction" },
      { name: "Dynamic lunges", reps: "10 each leg" },
      { name: "Bodyweight squats", reps: "15" },
      { name: "Push-ups", reps: "10" }
    ],
    exercises: [
      { 
        name: "Barbell squats", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Place barbell across upper back, squat until thighs are parallel to ground, then drive through heels to stand."
      },
      { 
        name: "Bench press", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Lie on bench with feet flat on floor, lower barbell to chest, then press back up to starting position."
      },
      { 
        name: "Deadlifts", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Stand with feet hip-width apart, hinge at hips to grip barbell, keep back flat while lifting bar by extending hips and knees."
      },
      { 
        name: "Pull-ups", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Hang from bar with hands slightly wider than shoulders, pull body up until chin clears bar, then lower with control."
      },
      { 
        name: "Dips", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Support body on parallel bars, lower until elbows reach 90 degrees, then push back up to straight arms."
      },
      { 
        name: "Barbell rows", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Bend at waist with back flat, pull barbell to lower chest keeping elbows close to body, then lower with control."
      },
      { 
        name: "Overhead press", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Hold barbell at shoulder height, press overhead until arms are fully extended, then lower back to shoulders."
      }
    ],
    cooldown: [
      { name: "Hamstring stretch", duration: "45 seconds each leg" },
      { name: "Quadriceps stretch", duration: "45 seconds each leg" },
      { name: "Chest stretch", duration: "45 seconds" },
      { name: "Lat stretch", duration: "45 seconds each side" },
      { name: "Triceps stretch", duration: "45 seconds each arm" },
      { name: "Hip flexor stretch", duration: "45 seconds each side" },
      { name: "Child's pose", duration: "1 minute" },
      { name: "Deep breathing", duration: "2 minutes" }
    ],
    schedule: [
      "Monday: Push day (bench press, overhead press, dips)",
      "Tuesday: Pull day (deadlifts, pull-ups, barbell rows)",
      "Wednesday: Legs day (squats, lunges, calf raises)",
      "Thursday: Rest or active recovery (light cardio, mobility work)",
      "Friday: Upper body (bench press, rows, pull-ups, overhead press)",
      "Saturday: Lower body (deadlifts, squats, lunges)",
      "Sunday: Complete rest"
    ],
    nutrition: [
      "Calculate macronutrient needs based on body composition goals",
      "Aim for 1.6-2.0g of protein per kg of bodyweight",
      "Periodize carbohydrate intake (higher on training days, lower on rest days)",
      "Include adequate healthy fats (0.5-0.8g per kg of bodyweight)",
      "Consider nutrient timing (pre/intra/post workout nutrition)",
      "Stay well-hydrated (aim for clear urine throughout the day)",
      "Consider supplements if needed (protein, creatine, etc.)"
    ],
    recovery: [
      "Implement deload weeks every 4-6 weeks of training",
      "Consider sports massage or self-myofascial release regularly",
      "Prioritize 7-9 hours of quality sleep",
      "Monitor recovery markers (resting heart rate, perceived fatigue)",
      "Consider contrast therapy (alternating hot/cold) for improved recovery",
      "Implement active recovery sessions between intense workouts"
    ]
  }
};

// Initialize Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key is not defined in environment variables");
}

// Get available difficulty levels
const getDifficultyLevels = (req, res) => {
  res.json({
    levels: [
      {
        id: "easy",
        name: "Easy",
        description: "Perfect for beginners or those returning to exercise after a break. Focuses on building basic strength and endurance with low-impact exercises."
      },
      {
        id: "medium",
        name: "Medium",
        description: "Designed for those with some fitness experience. Incorporates more challenging exercises and moderate intensity workouts."
      },
      {
        id: "hard",
        name: "Hard",
        description: "Advanced workouts for experienced fitness enthusiasts. High-intensity exercises with complex movements and shorter rest periods."
      }
    ]
  });
};

// Get predefined workout plan based on difficulty
const getWorkoutPlan = (req, res) => {
  const { difficulty } = req.params;
  
  if (!["easy", "medium", "hard"].includes(difficulty.toLowerCase())) {
    return res.status(400).json({ error: "Difficulty must be easy, medium, or hard" });
  }
  
  const workoutPlan = exerciseData[difficulty.toLowerCase()];
  
  if (!workoutPlan) {
    return res.status(404).json({ error: "Workout plan not found" });
  }
  
  res.json({
    difficulty,
    plan: workoutPlan
  });
};

// Generate personalized workout plan with Gemini
const getPersonalizedPlan = async (req, res) => {
  try {
    const { difficulty, goals, preferences, limitations, age, gender, weight, height } = req.body;
    
    if (!difficulty) {
      return res.status(400).json({ error: "Difficulty level is required" });
    }
    
    // Validate difficulty level
    if (!["easy", "medium", "hard"].includes(difficulty.toLowerCase())) {
      return res.status(400).json({ error: "Difficulty must be easy, medium, or hard" });
    }
    
    // Create prompt based on user input
    let prompt = `You are an AI-powered fitness coach. Create a detailed fitness plan for a ${difficulty} difficulty level. `;
    
    if (age) prompt += `The user is ${age} years old. `;
    if (gender) prompt += `The user's gender is ${gender}. `;
    if (weight) prompt += `The user weighs ${weight}. `;
    if (height) prompt += `The user's height is ${height}. `;
    
    if (goals) {
      prompt += `The user's fitness goals are: ${goals}. `;
    }
    
    if (preferences) {
      prompt += `The user's preferences are: ${preferences}. `;
    }
    
    if (limitations) {
      prompt += `The user has the following limitations or health concerns: ${limitations}. `;
    }
    
    prompt += `For a ${difficulty} difficulty level, provide:
    1. A detailed weekly workout schedule
    2. Specific exercises with sets, reps, and rest periods
    3. Warm-up and cool-down routines
    4. Nutrition recommendations
    5. Recovery tips
    
    Format the response in a structured, easy-to-follow manner with clear sections.`;
    
    // Call Gemini API with proper error handling
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      
      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error Response:", JSON.stringify(errorData, null, 2));
        return res.status(response.status).json({ 
          error: `Failed to generate fitness plan: ${errorData.error?.message || 'Unknown error'}`,
          details: errorData
        });
      }
      
      const data = await response.json();
      console.log("Gemini API Response Structure:", JSON.stringify(data, null, 2));
      
      // Extract the response text from Gemini API response with proper error handling
      let fitnessCoachResponse = "Unable to generate fitness plan";
      
      if (data && data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        fitnessCoachResponse = data.candidates[0].content.parts[0].text;
      } else if (data && data.error) {
        console.error("Gemini API Error:", data.error);
        return res.status(500).json({ error: "Failed to generate fitness plan: " + (data.error.message || JSON.stringify(data.error)) });
      }
      
      res.json({ 
        plan: fitnessCoachResponse,
        difficulty
      });
    } catch (fetchError) {
      console.error("Fetch error with Gemini API:", fetchError);
      return res.status(500).json({ error: `Network error with Gemini API: ${fetchError.message}` });
    }
    
  } catch (error) {
    console.error("Error with fitness coach assistant:", error);
    res.status(500).json({ error: "Failed to generate fitness plan" });
  }
};

// Get exercise recommendations
const getExerciseRecommendations = async (req, res) => {
  try {
    const { muscleGroup, equipment, difficulty, limitations } = req.body;
    
    if (!muscleGroup) {
      return res.status(400).json({ error: "Muscle group is required" });
    }
    
    let prompt = `Recommend 5 effective exercises for the ${muscleGroup} muscle group. `;
    
    if (equipment) {
      prompt += `The user has access to the following equipment: ${equipment}. `;
    } else {
      prompt += `Focus on bodyweight exercises that don't require equipment. `;
    }
    
    if (difficulty) {
      prompt += `The exercises should be at a ${difficulty} difficulty level. `;
    }
    
    if (limitations) {
      prompt += `The user has the following limitations or health concerns: ${limitations}. Provide alternative exercises that accommodate these limitations. `;
    }
    
    prompt += `For each exercise, provide:
    1. Name of the exercise
    2. Detailed instructions on proper form
    3. Recommended sets and reps
    4. Common mistakes to avoid
    5. A progression and a regression option`;
    
    // Call Gemini API with proper error handling
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });
      
      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error Response:", JSON.stringify(errorData, null, 2));
        return res.status(response.status).json({ 
          error: `Failed to generate exercise recommendations: ${errorData.error?.message || 'Unknown error'}`,
          details: errorData
        });
      }
      
      const data = await response.json();
      console.log("Gemini API Response for exercise recommendations:", JSON.stringify(data, null, 2));
      
      // Extract the response text from Gemini API response with proper error handling
      let exerciseRecommendations = "Unable to generate exercise recommendations";
      
      if (data && data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        exerciseRecommendations = data.candidates[0].content.parts[0].text;
      } else if (data && data.error) {
        console.error("Gemini API Error:", data.error);
        return res.status(500).json({ error: "Failed to generate exercise recommendations: " + (data.error.message || JSON.stringify(data.error)) });
      }
      
      res.json({ 
        muscleGroup,
        recommendations: exerciseRecommendations
      });
    } catch (fetchError) {
      console.error("Fetch error with Gemini API:", fetchError);
      return res.status(500).json({ error: `Network error with Gemini API: ${fetchError.message}` });
    }
    
  } catch (error) {
    console.error("Error with exercise recommendations:", error);
    res.status(500).json({ error: "Failed to generate exercise recommendations" });
  }
};

// Save a workout plan to the database
const saveWorkoutPlan = async (req, res) => {
  try {
    const { 
      userId, 
      name, 
      difficulty, 
      userDetails, 
      rawPlan, 
      schedule, 
      exercises, 
      warmup, 
      cooldown, 
      nutrition, 
      recovery 
    } = req.body;

    // Validate required fields
    if (!userId || !name || !difficulty || !rawPlan) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new workout plan
    const workoutPlan = new WorkoutPlan({
      userId,
      name,
      difficulty,
      userDetails,
      rawPlan,
      schedule,
      exercises,
      warmup,
      cooldown,
      nutrition,
      recovery
    });

    // Save the workout plan
    const savedPlan = await workoutPlan.save();
    
    res.status(201).json({
      message: "Workout plan saved successfully",
      plan: savedPlan
    });
  } catch (error) {
    console.error("Error saving workout plan:", error);
    res.status(500).json({ error: "Failed to save workout plan" });
  }
};

// Get all workout plans for a user
const getUserWorkoutPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const workoutPlans = await WorkoutPlan.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      count: workoutPlans.length,
      plans: workoutPlans
    });
  } catch (error) {
    console.error("Error fetching workout plans:", error);
    res.status(500).json({ error: "Failed to fetch workout plans" });
  }
};

// Get a specific workout plan by ID
const getWorkoutPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    const workoutPlan = await WorkoutPlan.findById(planId);
    
    if (!workoutPlan) {
      return res.status(404).json({ error: "Workout plan not found" });
    }
    
    res.json({ plan: workoutPlan });
  } catch (error) {
    console.error("Error fetching workout plan:", error);
    res.status(500).json({ error: "Failed to fetch workout plan" });
  }
};

// Update a workout plan
const updateWorkoutPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updateData = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    const workoutPlan = await WorkoutPlan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!workoutPlan) {
      return res.status(404).json({ error: "Workout plan not found" });
    }
    
    res.json({
      message: "Workout plan updated successfully",
      plan: workoutPlan
    });
  } catch (error) {
    console.error("Error updating workout plan:", error);
    res.status(500).json({ error: "Failed to update workout plan" });
  }
};

// Delete a workout plan
const deleteWorkoutPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    const workoutPlan = await WorkoutPlan.findByIdAndDelete(planId);
    
    if (!workoutPlan) {
      return res.status(404).json({ error: "Workout plan not found" });
    }
    
    res.json({
      message: "Workout plan deleted successfully",
      planId
    });
  } catch (error) {
    console.error("Error deleting workout plan:", error);
    res.status(500).json({ error: "Failed to delete workout plan" });
  }
};

// Toggle favorite status of a workout plan
const toggleFavoriteWorkoutPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    const workoutPlan = await WorkoutPlan.findById(planId);
    
    if (!workoutPlan) {
      return res.status(404).json({ error: "Workout plan not found" });
    }
    
    workoutPlan.isFavorite = !workoutPlan.isFavorite;
    await workoutPlan.save();
    
    res.json({
      message: `Workout plan ${workoutPlan.isFavorite ? 'added to' : 'removed from'} favorites`,
      plan: workoutPlan
    });
  } catch (error) {
    console.error("Error toggling favorite status:", error);
    res.status(500).json({ error: "Failed to update favorite status" });
  }
};

export {
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
  exerciseData
};