import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

// Ensure dotenv is configured properly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = express.Router();

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
        rest: "120 seconds",
        instructions: "Stand with feet hip-width apart, hinge at hips to grip barbell, drive through heels to stand while keeping back flat."
      },
      { 
        name: "Pull-ups", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Hang from bar with hands wider than shoulders, pull body up until chin clears bar, then lower with control."
      },
      { 
        name: "Overhead press", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Hold barbell at shoulder height, press overhead until arms are fully extended, then lower with control."
      },
      { 
        name: "Barbell rows", 
        sets: 4, 
        reps: "8-10", 
        rest: "90 seconds",
        instructions: "Bend at waist with back flat, pull barbell to lower chest keeping elbows close to body, then lower with control."
      },
      { 
        name: "Weighted lunges", 
        sets: 3, 
        reps: "10 each leg", 
        rest: "60 seconds",
        instructions: "Hold dumbbells at sides, step forward into lunge until both knees are at 90 degrees, then push back to start."
      },
      { 
        name: "Plank with shoulder taps", 
        sets: 3, 
        reps: "12 each arm", 
        rest: "60 seconds",
        instructions: "Start in plank position, tap opposite shoulder with hand while maintaining stable core and hip position."
      }
    ],
    cooldown: [
      { name: "Hamstring stretch", duration: "30 seconds each leg" },
      { name: "Quadriceps stretch", duration: "30 seconds each leg" },
      { name: "Hip flexor stretch", duration: "30 seconds each side" },
      { name: "Chest stretch", duration: "30 seconds" },
      { name: "Lat stretch", duration: "30 seconds each side" },
      { name: "Child's pose", duration: "45 seconds" },
      { name: "Deep breathing", duration: "2 minutes" }
    ],
    schedule: [
      "Monday: Lower body (squats, deadlifts, lunges)",
      "Tuesday: Upper body push (bench press, overhead press, dips)",
      "Wednesday: HIIT cardio (30 minutes)",
      "Thursday: Upper body pull (pull-ups, rows, face pulls)",
      "Friday: Full body compound movements",
      "Saturday: Active recovery or mobility work",
      "Sunday: Complete rest"
    ],
    nutrition: [
      "Calculate macronutrient needs based on training volume and goals",
      "Aim for 1.6-2.0g of protein per kg of bodyweight",
      "Strategically time carbohydrate intake around workouts",
      "Consider intra-workout nutrition for longer sessions",
      "Ensure adequate micronutrient intake through varied diet",
      "Stay hydrated with electrolytes during intense workouts"
    ],
    recovery: [
      "Incorporate regular foam rolling and mobility work",
      "Consider contrast therapy (alternating hot and cold)",
      "Schedule deload weeks every 4-6 weeks",
      "Prioritize 7-9 hours of quality sleep",
      "Monitor recovery using heart rate variability or subjective measures",
      "Consider sports massage for muscle recovery"
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
router.get("/difficulty-levels", (req, res) => {
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
});

// Get predefined workout plan based on difficulty
router.get("/workout-plan/:difficulty", (req, res) => {
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
});

// Generate personalized workout plan with Gemini
router.post("/personalized-plan", async (req, res) => {
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
});

// Get exercise recommendations
router.post("/exercise-recommendations", async (req, res) => {
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
});

export default router;
