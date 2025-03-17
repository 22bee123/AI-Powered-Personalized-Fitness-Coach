import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import WorkoutPlan from "../models/fitness.model.js";
import User from "../models/user.model.js";

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
    const { userId, name, difficulty, goals, preferences, limitations, age, gender, weight, height } = req.body;
    
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
    1. A detailed weekly workout schedule that includes specific exercises for each day of the week (Monday through Sunday)
    2. Specific exercises with sets, reps, and rest periods
    3. Warm-up and cool-down routines
    4. Nutrition recommendations
    5. Recovery tips
    
    Format the response in a structured, easy-to-follow manner with clear sections.
    
    For the weekly schedule, use this exact format:
    
    SCHEDULE:
    Monday: [workout type] - [brief description of focus areas and exercises]
    Tuesday: [workout type] - [brief description of focus areas and exercises]
    Wednesday: [workout type] - [brief description of focus areas and exercises]
    Thursday: [workout type] - [brief description of focus areas and exercises]
    Friday: [workout type] - [brief description of focus areas and exercises]
    Saturday: [workout type] - [brief description of focus areas and exercises]
    Sunday: [workout type] - [brief description of focus areas and exercises]
    
    Then, provide a section titled EXERCISES: with a detailed list of all exercises referenced in the schedule. For each exercise, include:
    
    EXERCISES:
    1. [Exercise Name]
    - Sets: [number]
    - Reps: [number or range]
    - Rest: [duration]
    - Instructions: [brief form instructions]
    - Muscle Group: [primary muscle group targeted]
    
    2. [Exercise Name]
    - Sets: [number]
    - Reps: [number or range]
    - Rest: [duration]
    - Instructions: [brief form instructions]
    - Muscle Group: [primary muscle group targeted]
    
    Continue for all exercises, making sure to include at least 5-8 exercises for each workout day that isn't a rest day.
    
    Then include these additional sections:
    
    WARM-UP:
    - [Warm-up exercise 1] - [duration or reps]
    - [Warm-up exercise 2] - [duration or reps]
    - [Continue for 3-5 warm-up exercises]
    
    COOL-DOWN:
    - [Cool-down exercise 1] - [duration]
    - [Cool-down exercise 2] - [duration]
    - [Continue for 3-5 cool-down exercises]
    
    NUTRITION:
    - [Nutrition tip 1]
    - [Nutrition tip 2]
    - [Continue for 3-5 nutrition tips]
    
    RECOVERY:
    - [Recovery tip 1]
    - [Recovery tip 2]
    - [Continue for 3-5 recovery tips]
    
    Make sure all exercises are appropriate for the user's fitness level, goals, and any limitations they've mentioned. Be specific and detailed in your recommendations.`;
    
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
      
      // Parse the response to extract structured data
      const parsedPlan = parseWorkoutPlan(fitnessCoachResponse);
      
      // Save the workout plan to the database if userId is provided
      if (userId) {
        try {
          // Create a new workout plan
          const workoutPlan = new WorkoutPlan({
            userId,
            name: name || `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Workout Plan`,
            difficulty,
            userDetails: {
              age: age || '',
              gender: gender || '',
              weight: weight || '',
              height: height || '',
              goals: goals || '',
              preferences: preferences || '',
              limitations: limitations || ''
            },
            rawPlan: fitnessCoachResponse,
            schedule: parsedPlan.schedule || [],
            exercises: parsedPlan.exercises || [],
            warmup: parsedPlan.warmup || [],
            cooldown: parsedPlan.cooldown || [],
            nutrition: parsedPlan.nutrition || [],
            recovery: parsedPlan.recovery || [],
            weekSchedule: parsedPlan.weekSchedule || {}
          });
          
          // Save the workout plan
          const savedPlan = await workoutPlan.save();
          
          console.log("Workout plan saved successfully:", savedPlan._id);
          
          // Return the saved plan
          return res.json({ 
            message: "Workout plan generated and saved successfully",
            plan: fitnessCoachResponse,
            difficulty,
            parsedPlan,
            savedPlan
          });
        } catch (saveError) {
          console.error("Error saving workout plan:", saveError);
          // Continue to return the generated plan even if saving fails
          return res.json({ 
            message: "Workout plan generated but failed to save",
            error: saveError.message,
            plan: fitnessCoachResponse,
            difficulty,
            parsedPlan
          });
        }
      } else {
        // Just return the generated plan without saving
        return res.json({ 
          plan: fitnessCoachResponse,
          difficulty,
          parsedPlan
        });
      }
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

// Parse a workout plan without saving it
const parseWorkoutPlanOnly = async (req, res) => {
  try {
    const { rawPlan } = req.body;
    
    if (!rawPlan) {
      return res.status(400).json({ error: "Raw plan is required" });
    }
    
    // Parse the workout plan
    const parsedPlan = parseWorkoutPlan(rawPlan);
    
    res.json({
      parsedPlan
    });
  } catch (error) {
    console.error("Error parsing workout plan:", error);
    res.status(500).json({ error: "Failed to parse workout plan" });
  }
};

// Save a workout plan to the database
const saveWorkoutPlan = async (req, res) => {
  try {
    const { 
      userId, 
      clerkId,
      name, 
      difficulty, 
      userDetails, 
      rawPlan, 
      schedule, 
      exercises, 
      warmup, 
      cooldown, 
      nutrition, 
      recovery,
      parsedPlan 
    } = req.body;

    // Validate required fields
    if (!name || !difficulty || !rawPlan) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get the clerkId from the authenticated user in the request
    const requestClerkId = req.auth?.userId || clerkId;
    
    if (!requestClerkId) {
      console.error("Authentication failed: No clerkId provided in request or body");
      return res.status(401).json({ 
        error: "Authentication required", 
        details: "No clerk ID found in request. Make sure you're logged in and the token is valid."
      });
    }

    console.log(`Processing workout plan save for user with clerkId: ${requestClerkId}`);
    
    // Find the user in our database
    let user = await User.findOne({ clerkId: requestClerkId });
    
    if (!user) {
      // Create a new user if they don't exist yet
      user = new User({
        clerkId: requestClerkId,
        email: req.body.email || 'unknown@example.com', // Fallback email
        workoutPlans: [],
        nutritionPlans: [],
        activePlanIds: {}
      });
      await user.save();
      console.log(`Created new user with clerkId: ${requestClerkId}`);
    }

    // Use parsed data if available, otherwise use the provided data or empty arrays
    const finalSchedule = parsedPlan?.schedule || schedule || [];
    const finalExercises = parsedPlan?.exercises || exercises || [];
    const finalWarmup = parsedPlan?.warmup || warmup || [];
    const finalCooldown = parsedPlan?.cooldown || cooldown || [];
    const finalNutrition = parsedPlan?.nutrition || nutrition || [];
    const finalRecovery = parsedPlan?.recovery || recovery || [];

    // Parse the raw plan to get the week schedule
    const parsedData = parseWorkoutPlan(rawPlan);
    const weekSchedule = parsedData.weekSchedule;

    console.log("Saving workout plan with weekSchedule:", JSON.stringify(weekSchedule, null, 2));

    // Create a new workout plan
    const workoutPlan = new WorkoutPlan({
      userId: user._id.toString(), // Use the MongoDB user ID
      clerkId: requestClerkId,     // Store the Clerk ID for authentication checks
      name,
      difficulty,
      userDetails,
      rawPlan,
      schedule: finalSchedule,
      exercises: finalExercises,
      warmup: finalWarmup,
      cooldown: finalCooldown,
      nutrition: finalNutrition,
      recovery: finalRecovery,
      weekSchedule // Add the week schedule to the workout plan
    });

    // Save the workout plan
    const savedPlan = await workoutPlan.save();
    
    // Add the workout plan to the user's workoutPlans array if it's not already there
    if (!user.workoutPlans.includes(savedPlan._id)) {
      user.workoutPlans.push(savedPlan._id);
      
      // If this is the user's first workout plan, set it as active
      if (!user.activePlanIds.workout) {
        user.activePlanIds.workout = savedPlan._id;
      }
      
      await user.save();
      console.log(`Added workout plan ${savedPlan._id} to user ${user._id}`);
    }
    
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
    
    // Get the clerkId from the authenticated user in the request
    const requestClerkId = req.auth?.userId;
    
    console.log(`Fetching workout plans for user ID: ${userId}, Auth ClerkID: ${requestClerkId}`);
    
    if (!requestClerkId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Find the user in our database
    const user = await User.findOne({ clerkId: requestClerkId });
    
    if (!user) {
      // Create a new user if they don't exist
      const newUser = new User({
        clerkId: requestClerkId,
        email: 'unknown@example.com', // Will be updated when user completes profile
        workoutPlans: [],
        nutritionPlans: [],
        activePlanIds: {}
      });
      await newUser.save();
      console.log(`Created new user with clerkId: ${requestClerkId}`);
      
      return res.json({
        count: 0,
        plans: []
      });
    }
    
    // First, log all workout plans in the database to debug
    const allPlans = await WorkoutPlan.find({});
    console.log(`Total workout plans in database: ${allPlans.length}`);
    
    // Find workout plans using multiple methods to ensure we get all plans for this user
    const workoutPlansByClerkId = await WorkoutPlan.find({ clerkId: requestClerkId }).sort({ createdAt: -1 });
    const workoutPlansByUserId = await WorkoutPlan.find({ userId: user._id.toString() }).sort({ createdAt: -1 });
    
    // Combine the results and remove duplicates
    const combinedPlans = [...workoutPlansByClerkId];
    
    // Add plans from workoutPlansByUserId that aren't already in combinedPlans
    workoutPlansByUserId.forEach(plan => {
      if (!combinedPlans.some(existingPlan => existingPlan._id.toString() === plan._id.toString())) {
        combinedPlans.push(plan);
      }
    });
    
    // Also get plans from user.workoutPlans that might not be found by the above queries
    if (user.workoutPlans && user.workoutPlans.length > 0) {
      const userPlanIds = user.workoutPlans.map(id => id.toString());
      const additionalPlans = await WorkoutPlan.find({ _id: { $in: userPlanIds } });
      
      additionalPlans.forEach(plan => {
        if (!combinedPlans.some(existingPlan => existingPlan._id.toString() === plan._id.toString())) {
          combinedPlans.push(plan);
        }
      });
    }
    
    // Sort by createdAt in descending order (newest first)
    combinedPlans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`Found ${combinedPlans.length} plans for user with clerkId ${requestClerkId}`);
    
    // Update user's workoutPlans array if we found plans that aren't in it
    const planIdsInUser = user.workoutPlans.map(id => id.toString());
    const planIdsToAdd = combinedPlans
      .filter(plan => !planIdsInUser.includes(plan._id.toString()))
      .map(plan => plan._id);
    
    if (planIdsToAdd.length > 0) {
      user.workoutPlans.push(...planIdsToAdd);
      await user.save();
      console.log(`Added ${planIdsToAdd.length} missing workout plans to user ${user._id}`);
    }
    
    res.json({
      count: combinedPlans.length,
      plans: combinedPlans
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
    
    // Get the clerkId from the authenticated user in the request
    const requestClerkId = req.auth?.userId;
    
    if (!requestClerkId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    const workoutPlan = await WorkoutPlan.findById(planId);
    
    if (!workoutPlan) {
      return res.status(404).json({ error: "Workout plan not found" });
    }
    
    // Check if the workout plan belongs to the authenticated user
    if (workoutPlan.clerkId !== requestClerkId) {
      return res.status(403).json({ error: "You don't have permission to access this workout plan" });
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
    
    // Get the clerkId from the authenticated user in the request
    const requestClerkId = req.auth?.userId;
    
    if (!requestClerkId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    // First find the workout plan to check ownership
    const existingPlan = await WorkoutPlan.findById(planId);
    
    if (!existingPlan) {
      return res.status(404).json({ error: "Workout plan not found" });
    }
    
    // Check if the workout plan belongs to the authenticated user
    if (existingPlan.clerkId !== requestClerkId) {
      return res.status(403).json({ error: "You don't have permission to update this workout plan" });
    }
    
    // Now update the plan
    const workoutPlan = await WorkoutPlan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true, runValidators: true }
    );
    
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
    
    // Get the clerkId from the authenticated user in the request
    const requestClerkId = req.auth?.userId;
    
    if (!requestClerkId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    // First find the workout plan to check ownership
    const existingPlan = await WorkoutPlan.findById(planId);
    
    if (!existingPlan) {
      return res.status(404).json({ error: "Workout plan not found" });
    }
    
    // Check if the workout plan belongs to the authenticated user
    if (existingPlan.clerkId !== requestClerkId) {
      return res.status(403).json({ error: "You don't have permission to delete this workout plan" });
    }
    
    // Now delete the plan
    const workoutPlan = await WorkoutPlan.findByIdAndDelete(planId);
    
    // Also remove the plan from the user's workoutPlans array
    await User.updateOne(
      { clerkId: requestClerkId },
      { $pull: { workoutPlans: planId } }
    );
    
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
    
    // Get the clerkId from the authenticated user in the request
    const requestClerkId = req.auth?.userId;
    
    if (!requestClerkId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    // First find the workout plan to check ownership
    const existingPlan = await WorkoutPlan.findById(planId);
    
    if (!existingPlan) {
      return res.status(404).json({ error: "Workout plan not found" });
    }
    
    // Check if the workout plan belongs to the authenticated user
    if (existingPlan.clerkId !== requestClerkId) {
      return res.status(403).json({ error: "You don't have permission to modify this workout plan" });
    }
    
    // Toggle the favorite status
    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(
      planId,
      { isFavorite: !existingPlan.isFavorite },
      { new: true }
    );
    
    res.json({
      message: `Workout plan ${updatedPlan.isFavorite ? 'added to' : 'removed from'} favorites`,
      plan: updatedPlan
    });
  } catch (error) {
    console.error("Error toggling favorite status:", error);
    res.status(500).json({ error: "Failed to update workout plan" });
  }
};

// Helper function to parse the workout plan text into structured data
const parseWorkoutPlan = (rawPlan) => {
  try {
    console.log("Parsing workout plan...");
    
    // Initialize the result object
    const result = {
      schedule: [],
      exercises: [],
      warmup: [],
      cooldown: [],
      nutrition: [],
      recovery: [],
      weekSchedule: {}
    };
    
    // Define the days of the week
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Initialize the week schedule with empty days
    daysOfWeek.forEach(day => {
      result.weekSchedule[day] = {
        day: day,
        focus: '',
        description: '',
        workoutType: 'strength',
        exercises: [],
        isRestDay: false
      };
    });
    
    // Split the raw plan into sections
    const sections = rawPlan.split(/(?:^|\n)#+\s+/);
    
    // Process each section
    sections.forEach(section => {
      if (!section.trim()) return;
      
      // Extract the section title and content
      const lines = section.split('\n');
      const sectionTitle = lines[0].trim();
      const sectionContent = lines.slice(1).join('\n').trim();
      
      console.log(`Processing section: ${sectionTitle}`);
      
      // Process the section based on its title
      if (sectionTitle.toLowerCase().includes('weekly schedule') || 
          sectionTitle.toLowerCase().includes('workout schedule') ||
          sectionTitle.toLowerCase().includes('weekly workout plan')) {
        // Process the weekly schedule
        processWeeklySchedule(sectionContent, result);
      } else if (sectionTitle.toLowerCase().includes('warm') && sectionTitle.toLowerCase().includes('up')) {
        // Process warm-up exercises
        result.warmup = extractWarmupExercises(sectionContent);
      } else if (sectionTitle.toLowerCase().includes('cool') && sectionTitle.toLowerCase().includes('down')) {
        // Process cool-down exercises
        result.cooldown = extractCooldownExercises(sectionContent);
      } else if (sectionTitle.toLowerCase().includes('nutrition') || 
                sectionTitle.toLowerCase().includes('diet')) {
        // Process nutrition advice
        result.nutrition = extractNutritionAdvice(sectionContent);
      } else if (sectionTitle.toLowerCase().includes('recovery') || 
                sectionTitle.toLowerCase().includes('rest')) {
        // Process recovery tips
        result.recovery = extractRecoveryTips(sectionContent);
      } else {
        // Check if this section is for a specific day
        for (const day of daysOfWeek) {
          if (sectionTitle.toLowerCase().includes(day.toLowerCase())) {
            // This section is for a specific day
            processDayWorkout(day, sectionContent, result);
            break;
          }
        }
      }
    });
    
    // Extract exercises from the weekly schedule
    extractExercisesFromSchedule(result);
    
    // Ensure each day has a focus
    ensureDayFocus(result);
    
    console.log("Parsing complete.");
    return result;
  } catch (error) {
    console.error("Error parsing workout plan:", error);
    return {
      schedule: [],
      exercises: [],
      warmup: [],
      cooldown: [],
      nutrition: [],
      recovery: [],
      weekSchedule: {}
    };
  }
};

// Helper function to process the weekly schedule
const processWeeklySchedule = (content, result) => {
  const lines = content.split('\n');
  let currentDay = null;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Check if this line starts with a day of the week
    const dayMatch = trimmedLine.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):/i);
    if (dayMatch) {
      currentDay = dayMatch[1];
      const focusMatch = trimmedLine.match(/:(.*)/);
      const focus = focusMatch ? focusMatch[1].trim() : '';
      
      // Add to the schedule
      result.schedule.push({
        day: currentDay,
        workouts: [{
          type: focus,
          description: focus
        }]
      });
      
      // Update the week schedule
      if (result.weekSchedule[currentDay]) {
        result.weekSchedule[currentDay].focus = focus;
        result.weekSchedule[currentDay].description = focus;
        result.weekSchedule[currentDay].isRestDay = focus.toLowerCase().includes('rest');
        result.weekSchedule[currentDay].workoutType = determineWorkoutType(focus);
      }
    } else if (currentDay && result.weekSchedule[currentDay]) {
      // This line contains additional details for the current day
      const existingDescription = result.weekSchedule[currentDay].description;
      result.weekSchedule[currentDay].description = existingDescription 
        ? `${existingDescription}\n${trimmedLine}`
        : trimmedLine;
    }
  });
};

// Helper function to process a day's workout
const processDayWorkout = (day, content, result) => {
  // Extract the focus from the content
  const focusMatch = content.match(/focus:?\s*([^,\n]+)/i);
  const focus = focusMatch ? focusMatch[1].trim() : determineWorkoutFocus(content);
  
  // Check if it's a rest day
  const isRestDay = content.toLowerCase().includes('rest day') || 
                    focus.toLowerCase().includes('rest');
  
  // Determine the workout type
  const workoutType = determineWorkoutType(content);
  
  // Extract exercises for this day
  const exercises = extractExercisesFromDay(content);
  
  // Update the week schedule
  result.weekSchedule[day] = {
    day: day,
    focus: focus,
    description: content.trim(),
    workoutType: workoutType,
    exercises: exercises,
    isRestDay: isRestDay
  };
  
  // Add to the schedule
  result.schedule.push({
    day: day,
    workouts: [{
      type: focus,
      description: content.trim()
    }]
  });
  
  // Add exercises to the overall exercises list
  exercises.forEach(exercise => {
    if (!result.exercises.some(e => e.name === exercise.name)) {
      result.exercises.push(exercise);
    }
  });
};

// Helper function to extract exercises from a day's content
const extractExercisesFromDay = (content) => {
  const exercises = [];
  
  // Split the content into lines
  const lines = content.split('\n');
  
  // Look for exercise blocks
  let inExerciseBlock = false;
  let exerciseBlock = '';
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Check if this line starts an exercise block
    if (trimmedLine.match(/exercises:/i) || 
        trimmedLine.match(/workout:/i) ||
        trimmedLine === '**Exercises:**' ||
        trimmedLine === '**Workout:**') {
      inExerciseBlock = true;
      return;
    }
    
    // If we're in an exercise block, collect the lines
    if (inExerciseBlock) {
      // Check if this line ends the exercise block
      if (trimmedLine.match(/^#+\s/) || 
          trimmedLine.match(/^(warm-up|cool-down|nutrition|recovery):/i)) {
        inExerciseBlock = false;
        
        // Process the collected exercise block
        const extractedExercises = extractExercisesFromBlock(exerciseBlock);
        exercises.push(...extractedExercises);
        
        exerciseBlock = '';
      } else {
        // Add this line to the exercise block
        exerciseBlock += trimmedLine + '\n';
      }
    }
  });
  
  // Process any remaining exercise block
  if (exerciseBlock.trim()) {
    const extractedExercises = extractExercisesFromBlock(exerciseBlock);
    exercises.push(...extractedExercises);
  }
  
  // If no exercises were found in blocks, try to extract them from the entire content
  if (exercises.length === 0) {
    const extractedExercises = extractExercisesFromBlock(content);
    exercises.push(...extractedExercises);
  }
  
  return exercises;
};

// Helper function to extract exercises from a block of text
const extractExercisesFromBlock = (block) => {
  const exercises = [];
  
  // Split the block into lines
  const lines = block.split('\n');
  
  // Process each line as a potential exercise
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Check if this line contains an exercise
    const exerciseMatch = trimmedLine.match(/^[*-]\s+(.*)/);
    if (exerciseMatch) {
      const exerciseText = exerciseMatch[1].trim();
      
      // Extract exercise details
      const nameMatch = exerciseText.match(/^([^:,]+)/) || 
                        exerciseText.match(/^(\d+\.\s*)?([^:,]+)/);
      const setsMatch = exerciseText.match(/sets:?\s*(\d+)/i) || 
                        exerciseText.match(/(\d+)\s*sets/i);
      const repsMatch = exerciseText.match(/reps:?\s*([^,]+)/i) || 
                        exerciseText.match(/(\d+(?:-\d+)?(?:\s*to\s*\d+)?)\s*reps/i);
      const restMatch = exerciseText.match(/rest:?\s*([^,]+)/i) || 
                        exerciseText.match(/rest\s*for\s*([^,]+)/i);
      
      if (nameMatch) {
        const exercise = {
          name: nameMatch[1].trim(),
          sets: setsMatch ? parseInt(setsMatch[1]) : undefined,
          reps: repsMatch ? repsMatch[1].trim() : undefined,
          rest: restMatch ? restMatch[1].trim() : undefined
        };
        
        exercises.push(exercise);
      }
    }
  });
  
  // If no exercises were found with bullet points, try to extract them from the text
  if (exercises.length === 0) {
    // Split the block into potential exercise blocks
    const exerciseBlocks = block.split(/\d+\.\s+|\n\s*\n/);
    
    exerciseBlocks.forEach(block => {
      if (!block.trim()) return;
      
      const nameMatch = block.match(/name:?\s*([^,\n]+)/i) || 
                       block.match(/^[*-]?\s*(\d+\.|\*|\-\s)?([^,\n:]+)/);
      
      if (nameMatch) {
        const exercise = {
          name: nameMatch[2] ? nameMatch[2].trim() : nameMatch[1].trim(),
          sets: undefined,
          reps: undefined,
          rest: undefined
        };
        
        // Try to extract sets, reps, and rest
        const setsMatch = block.match(/sets:?\s*(\d+)/i) || 
                          block.match(/(\d+)\s*sets/i);
        const repsMatch = block.match(/reps:?\s*([^,\n]+)/i) || 
                          block.match(/(\d+(?:-\d+)?(?:\s*to\s*\d+)?)\s*reps/i);
        const restMatch = block.match(/rest:?\s*([^,\n]+)/i) || 
                          block.match(/rest\s*for\s*([^,\n]+)/i);
        
        if (setsMatch) exercise.sets = parseInt(setsMatch[1]);
        if (repsMatch) exercise.reps = repsMatch[1].trim();
        if (restMatch) exercise.rest = restMatch[1].trim();
        
        exercises.push(exercise);
      }
    });
  }
  
  return exercises;
};

// Helper function to extract warm-up exercises
const extractWarmupExercises = (content) => {
  const warmupExercises = [];
  
  // Split the content into lines
  const lines = content.split('\n');
  
  // Process each line as a potential warm-up exercise
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Check if this line contains a warm-up exercise
    const exerciseMatch = trimmedLine.match(/^[*-]\s+(.*)/);
    if (exerciseMatch) {
      const exerciseText = exerciseMatch[1].trim();
      
      // Extract exercise details
      const nameMatch = exerciseText.match(/^([^:,]+)/);
      const durationMatch = exerciseText.match(/duration:?\s*([^,]+)/i) || 
                           exerciseText.match(/for\s*([^,]+)/i);
      const repsMatch = exerciseText.match(/reps:?\s*([^,]+)/i) || 
                        exerciseText.match(/(\d+(?:-\d+)?(?:\s*to\s*\d+)?)\s*reps/i);
      
      if (nameMatch) {
        const exercise = {
          name: nameMatch[1].trim(),
          duration: durationMatch ? durationMatch[1].trim() : undefined,
          reps: repsMatch ? repsMatch[1].trim() : undefined
        };
        
        warmupExercises.push(exercise);
      }
    }
  });
  
  return warmupExercises;
};

// Helper function to extract cool-down exercises
const extractCooldownExercises = (content) => {
  const cooldownExercises = [];
  
  // Split the content into lines
  const lines = content.split('\n');
  
  // Process each line as a potential cool-down exercise
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Check if this line contains a cool-down exercise
    const exerciseMatch = trimmedLine.match(/^[*-]\s+(.*)/);
    if (exerciseMatch) {
      const exerciseText = exerciseMatch[1].trim();
      
      // Extract exercise details
      const nameMatch = exerciseText.match(/^([^:,]+)/);
      const durationMatch = exerciseText.match(/duration:?\s*([^,]+)/i) || 
                           exerciseText.match(/for\s*([^,]+)/i);
      
      if (nameMatch) {
        const exercise = {
          name: nameMatch[1].trim(),
          duration: durationMatch ? durationMatch[1].trim() : undefined
        };
        
        cooldownExercises.push(exercise);
      }
    }
  });
  
  return cooldownExercises;
};

// Helper function to extract nutrition advice
const extractNutritionAdvice = (content) => {
  const nutritionAdvice = [];
  
  // Split the content into lines
  const lines = content.split('\n');
  
  // Process each line as a potential nutrition advice
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Check if this line contains nutrition advice
    const adviceMatch = trimmedLine.match(/^[*-]\s+(.*)/);
    if (adviceMatch) {
      nutritionAdvice.push(adviceMatch[1].trim());
    }
  });
  
  // If no advice was found with bullet points, add the entire content
  if (nutritionAdvice.length === 0 && content.trim()) {
    nutritionAdvice.push(content.trim());
  }
  
  return nutritionAdvice;
};

// Helper function to extract recovery tips
const extractRecoveryTips = (content) => {
  const recoveryTips = [];
  
  // Split the content into lines
  const lines = content.split('\n');
  
  // Process each line as a potential recovery tip
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Check if this line contains a recovery tip
    const tipMatch = trimmedLine.match(/^[*-]\s+(.*)/);
    if (tipMatch) {
      recoveryTips.push(tipMatch[1].trim());
    }
  });
  
  // If no tips were found with bullet points, add the entire content
  if (recoveryTips.length === 0 && content.trim()) {
    recoveryTips.push(content.trim());
  }
  
  return recoveryTips;
};

// Helper function to extract exercises from the schedule
const extractExercisesFromSchedule = (result) => {
  // Iterate through each day in the week schedule
  Object.keys(result.weekSchedule).forEach(day => {
    const daySchedule = result.weekSchedule[day];
    
    // Skip rest days
    if (daySchedule.isRestDay) return;
    
    // Find exercises for this day
    const exercises = findExercisesForDay(daySchedule.description, result.exercises);
    
    // Add the exercises to the day's schedule
    daySchedule.exercises = exercises;
  });
};

// Helper function to ensure each day has a focus
const ensureDayFocus = (result) => {
  // Define common workout focuses
  const focuses = [
    'Upper Body', 'Lower Body', 'Core', 'Cardio', 'Full Body', 
    'Strength', 'Flexibility', 'HIIT', 'Endurance', 'Rest'
  ];
  
  // Iterate through each day in the week schedule
  Object.keys(result.weekSchedule).forEach(day => {
    const daySchedule = result.weekSchedule[day];
    
    // If the day doesn't have a focus, try to determine one
    if (!daySchedule.focus) {
      // Check if it's a rest day
      if (daySchedule.isRestDay) {
        daySchedule.focus = 'Rest';
        return;
      }
      
      // Try to determine the focus from the description
      for (const focus of focuses) {
        if (daySchedule.description.toLowerCase().includes(focus.toLowerCase())) {
          daySchedule.focus = focus;
          return;
        }
      }
      
      // If no focus was found, use a default
      daySchedule.focus = 'Workout';
    }
  });
};

// Helper function to determine the workout type
const determineWorkoutType = (content) => {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('rest')) {
    return 'rest';
  } else if (contentLower.includes('cardio')) {
    return 'cardio';
  } else if (contentLower.includes('hiit')) {
    return 'hiit';
  } else if (contentLower.includes('flexibility') || contentLower.includes('stretch')) {
    return 'flexibility';
  } else if (contentLower.includes('recovery')) {
    return 'recovery';
  } else {
    return 'strength';
  }
};

// Helper function to determine the workout focus
const determineWorkoutFocus = (content) => {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('upper body')) {
    return 'Upper Body';
  } else if (contentLower.includes('lower body')) {
    return 'Lower Body';
  } else if (contentLower.includes('core')) {
    return 'Core';
  } else if (contentLower.includes('cardio')) {
    return 'Cardio';
  } else if (contentLower.includes('full body')) {
    return 'Full Body';
  } else if (contentLower.includes('rest')) {
    return 'Rest';
  } else {
    return 'Workout';
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
  parseWorkoutPlanOnly,
  exerciseData
};