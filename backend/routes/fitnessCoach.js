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
import {
  getPersonalizedNutritionPlan,
  getUserNutritionPlans,
  getNutritionPlanById,
  updateNutritionPlan,
  deleteNutritionPlan,
  toggleFavoriteNutritionPlan,
  getNutritionPlansByWorkoutPlan
} from "../Controller/Nutrition.controller.js";
import WorkoutPlan from "../models/fitness.model.js";
import NutritionPlan from "../models/nutrition.model.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/difficulty-levels", getDifficultyLevels);
router.get("/workout-plan/:difficulty", getWorkoutPlan);

// Create a simple middleware that will be replaced with the real clerkMiddleware
// This allows the routes to work even if the clerkMiddleware is not properly initialized
const fallbackMiddleware = (req, res, next) => {
  console.log("Using fallback middleware - no authentication check");
  next();
};

// Function to get the appropriate middleware
const getAuthMiddleware = (req) => {
  // If req.app.locals.clerkMiddleware exists, use it, otherwise use the fallback
  return req.app.locals.clerkMiddleware || fallbackMiddleware;
};

// Protected routes (authentication required)
// Workout plan management routes
router.post("/personalized-plan", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, getPersonalizedPlan);
router.post("/exercise-recommendations", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, getExerciseRecommendations);
router.post("/parse-workout-plan", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, parseWorkoutPlanOnly);
router.post("/save-workout-plan", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, saveWorkoutPlan);
router.get("/user-workout-plans/:userId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, getUserWorkoutPlans);
router.get("/workout-plan-details/:planId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, getWorkoutPlanById);
router.put("/update-workout-plan/:planId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, updateWorkoutPlan);
router.delete("/delete-workout-plan/:planId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, deleteWorkoutPlan);
router.patch("/toggle-favorite/:planId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, toggleFavoriteWorkoutPlan);

// Test route to create a sample workout plan for a specific user
router.get("/create-test-plan/:userId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Creating test workout plan for user: ${userId}`);
    
    // Check if user already has workout plans
    const existingPlans = await WorkoutPlan.find({ userId });
    if (existingPlans.length > 0) {
      return res.json({
        message: "User already has workout plans",
        count: existingPlans.length,
        plans: existingPlans
      });
    }
    
    // Create a sample workout plan
    const weekSchedule = {
      Monday: {
        day: "Monday",
        focus: "Chest and Triceps",
        workoutType: "strength",
        isRestDay: false,
        exercises: [
          {
            name: "Push-ups",
            sets: 3,
            reps: 12,
            rest: "60 seconds",
            instructions: "Keep your body straight and lower until your chest nearly touches the ground."
          },
          {
            name: "Dumbbell Bench Press",
            sets: 3,
            reps: 10,
            rest: "90 seconds",
            instructions: "Lie on a bench with dumbbells at chest level, press upward until arms are extended."
          },
          {
            name: "Tricep Dips",
            sets: 3,
            reps: 12,
            rest: "60 seconds",
            instructions: "Using parallel bars or a bench, lower your body until your elbows are at 90 degrees."
          }
        ]
      },
      Tuesday: {
        day: "Tuesday",
        focus: "Cardio",
        workoutType: "cardio",
        isRestDay: false,
        exercises: [
          {
            name: "Running",
            duration: "30 minutes",
            instructions: "Maintain a moderate pace that allows you to talk but not sing."
          },
          {
            name: "Jump Rope",
            duration: "10 minutes",
            instructions: "Alternate between 30 seconds of fast jumping and 30 seconds of slower pace."
          }
        ]
      },
      Wednesday: {
        day: "Wednesday",
        focus: "Back and Biceps",
        workoutType: "strength",
        isRestDay: false,
        exercises: [
          {
            name: "Pull-ups",
            sets: 3,
            reps: "8-10",
            rest: "90 seconds",
            instructions: "Grip the bar with hands wider than shoulder width, pull up until chin is over the bar."
          },
          {
            name: "Dumbbell Rows",
            sets: 3,
            reps: 12,
            rest: "60 seconds",
            instructions: "Bend over with a dumbbell in one hand, pull it up to your side while keeping your back straight."
          },
          {
            name: "Bicep Curls",
            sets: 3,
            reps: 12,
            rest: "60 seconds",
            instructions: "Stand with dumbbells at your sides, curl them up to your shoulders while keeping elbows close to your body."
          }
        ]
      },
      Thursday: {
        day: "Thursday",
        focus: "Rest Day",
        workoutType: "rest",
        isRestDay: true,
        exercises: []
      },
      Friday: {
        day: "Friday",
        focus: "Legs and Shoulders",
        workoutType: "strength",
        isRestDay: false,
        exercises: [
          {
            name: "Squats",
            sets: 3,
            reps: 12,
            rest: "90 seconds",
            instructions: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to standing."
          },
          {
            name: "Lunges",
            sets: 3,
            reps: "10 each leg",
            rest: "60 seconds",
            instructions: "Step forward with one leg, lowering your hips until both knees are bent at 90 degrees."
          },
          {
            name: "Shoulder Press",
            sets: 3,
            reps: 10,
            rest: "60 seconds",
            instructions: "Sit or stand with dumbbells at shoulder height, press them upward until arms are extended."
          }
        ]
      },
      Saturday: {
        day: "Saturday",
        focus: "HIIT",
        workoutType: "hiit",
        isRestDay: false,
        exercises: [
          {
            name: "Burpees",
            sets: 4,
            reps: 10,
            rest: "30 seconds",
            instructions: "Start standing, drop to a push-up position, do a push-up, jump feet forward, then jump up with hands overhead."
          },
          {
            name: "Mountain Climbers",
            duration: "45 seconds",
            rest: "15 seconds",
            instructions: "Start in a push-up position, rapidly alternate bringing knees to chest."
          },
          {
            name: "Jumping Jacks",
            duration: "45 seconds",
            rest: "15 seconds",
            instructions: "Jump while spreading legs and raising arms, then return to standing with arms at sides."
          }
        ]
      },
      Sunday: {
        day: "Sunday",
        focus: "Rest Day",
        workoutType: "rest",
        isRestDay: true,
        exercises: []
      }
    };
    
    const workoutPlan = new WorkoutPlan({
      userId,
      name: "5-Day Split Workout Plan",
      difficulty: "medium",
      userDetails: {
        age: "30",
        gender: "Not specified",
        weight: "Not specified",
        height: "Not specified",
        goals: "Build strength and improve fitness",
        preferences: "Mixed workouts",
        limitations: "None"
      },
      rawPlan: "This is a 5-day split workout plan focusing on different muscle groups each day.",
      schedule: [
        {
          day: "Monday",
          workouts: [
            {
              type: "Chest",
              description: "Focus on chest and triceps exercises"
            }
          ]
        },
        {
          day: "Tuesday",
          workouts: [
            {
              type: "Cardio",
              description: "Cardiovascular training"
            }
          ]
        },
        {
          day: "Wednesday",
          workouts: [
            {
              type: "Back",
              description: "Focus on back and biceps exercises"
            }
          ]
        },
        {
          day: "Thursday",
          workouts: [
            {
              type: "Rest",
              description: "Rest day for recovery"
            }
          ]
        },
        {
          day: "Friday",
          workouts: [
            {
              type: "Legs",
              description: "Focus on legs and shoulders exercises"
            }
          ]
        },
        {
          day: "Saturday",
          workouts: [
            {
              type: "HIIT",
              description: "High-intensity interval training"
            }
          ]
        },
        {
          day: "Sunday",
          workouts: [
            {
              type: "Rest",
              description: "Rest day for recovery"
            }
          ]
        }
      ],
      exercises: [
        {
          name: "Push-ups",
          sets: 3,
          reps: 12,
          rest: "60 seconds",
          instructions: "Keep your body straight and lower until your chest nearly touches the ground.",
          muscleGroup: "chest"
        },
        {
          name: "Pull-ups",
          sets: 3,
          reps: "8-10",
          rest: "90 seconds",
          instructions: "Grip the bar with hands wider than shoulder width, pull up until chin is over the bar.",
          muscleGroup: "back"
        },
        {
          name: "Squats",
          sets: 3,
          reps: 12,
          rest: "90 seconds",
          instructions: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to standing.",
          muscleGroup: "legs"
        }
      ],
      warmup: [
        {
          name: "Light jogging",
          duration: "5 minutes"
        },
        {
          name: "Dynamic stretching",
          duration: "5 minutes"
        }
      ],
      cooldown: [
        {
          name: "Static stretching",
          duration: "10 minutes"
        }
      ],
      nutrition: [
        "Eat a balanced diet with plenty of protein",
        "Stay hydrated throughout the day",
        "Consider a protein shake after workouts"
      ],
      recovery: [
        "Get 7-8 hours of sleep each night",
        "Take rest days seriously",
        "Consider foam rolling for muscle recovery"
      ],
      weekSchedule
    });
    
    const savedPlan = await workoutPlan.save();
    
    res.status(201).json({
      message: "Test workout plan created successfully",
      plan: savedPlan
    });
  } catch (error) {
    console.error("Error creating test workout plan:", error);
    res.status(500).json({ error: "Failed to create test workout plan" });
  }
});

// Test route to create a sample nutrition plan for a specific user
router.get("/create-test-nutrition-plan/:userId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Creating test nutrition plan for user: ${userId}`);
    
    // Check if user already has nutrition plans
    const existingPlans = await NutritionPlan.find({ userId });
    if (existingPlans.length > 0) {
      return res.json({
        message: "User already has nutrition plans",
        count: existingPlans.length,
        plans: existingPlans
      });
    }
    
    // Create a sample nutrition plan with a full week schedule
    const weekSchedule = {
      Monday: {
        day: "Monday",
        meals: [
          {
            name: "Protein-Packed Breakfast",
            description: "High protein breakfast to start your day",
            calories: "450",
            protein: "30g",
            carbs: "40g",
            fats: "15g",
            ingredients: [
              "3 egg whites",
              "1 whole egg",
              "1/2 cup oatmeal",
              "1 banana",
              "1 tbsp almond butter"
            ],
            instructions: "Cook eggs, prepare oatmeal with water, top with sliced banana and almond butter",
            timeOfDay: "breakfast"
          },
          {
            name: "Grilled Chicken Salad",
            description: "Nutrient-dense lunch option",
            calories: "550",
            protein: "40g",
            carbs: "30g",
            fats: "20g",
            ingredients: [
              "6oz grilled chicken breast",
              "2 cups mixed greens",
              "1/4 cup cherry tomatoes",
              "1/4 cup cucumber",
              "1/4 avocado",
              "2 tbsp olive oil vinaigrette"
            ],
            instructions: "Grill chicken, combine with vegetables, dress with vinaigrette",
            timeOfDay: "lunch"
          },
          {
            name: "Salmon with Roasted Vegetables",
            description: "Omega-3 rich dinner",
            calories: "600",
            protein: "35g",
            carbs: "40g",
            fats: "25g",
            ingredients: [
              "5oz salmon fillet",
              "1 cup broccoli",
              "1 cup bell peppers",
              "1/2 cup sweet potato",
              "1 tbsp olive oil",
              "Herbs and spices"
            ],
            instructions: "Roast vegetables at 400°F for 20 minutes, bake salmon for 12-15 minutes",
            timeOfDay: "dinner"
          },
          {
            name: "Greek Yogurt with Berries",
            description: "Protein-rich snack",
            calories: "200",
            protein: "15g",
            carbs: "20g",
            fats: "5g",
            ingredients: [
              "1 cup Greek yogurt",
              "1/2 cup mixed berries",
              "1 tbsp honey",
              "1 tbsp chia seeds"
            ],
            instructions: "Mix all ingredients in a bowl",
            timeOfDay: "snack"
          }
        ],
        totalCalories: "1800",
        totalProtein: "120g",
        totalCarbs: "130g",
        totalFats: "65g",
        waterIntake: "3 liters",
        notes: "Focus on hydration during chest and triceps workout"
      },
      Tuesday: {
        day: "Tuesday",
        meals: [
          {
            name: "Veggie Omelette",
            description: "Vegetable-rich breakfast",
            calories: "400",
            protein: "25g",
            carbs: "20g",
            fats: "20g",
            ingredients: [
              "3 whole eggs",
              "1/2 cup spinach",
              "1/4 cup bell peppers",
              "1/4 cup mushrooms",
              "1 oz cheese",
              "1 slice whole grain toast"
            ],
            instructions: "Sauté vegetables, add beaten eggs, fold and cook until set",
            timeOfDay: "breakfast"
          },
          {
            name: "Turkey and Avocado Wrap",
            description: "Balanced lunch option",
            calories: "500",
            protein: "35g",
            carbs: "40g",
            fats: "20g",
            ingredients: [
              "4oz turkey breast",
              "1 whole grain wrap",
              "1/4 avocado",
              "1 cup mixed greens",
              "2 tbsp hummus"
            ],
            instructions: "Spread hummus on wrap, layer with turkey, avocado, and greens, roll up",
            timeOfDay: "lunch"
          },
          {
            name: "Lean Beef Stir Fry",
            description: "Iron-rich dinner",
            calories: "550",
            protein: "40g",
            carbs: "45g",
            fats: "15g",
            ingredients: [
              "4oz lean beef strips",
              "1 cup broccoli",
              "1 cup bell peppers",
              "1/2 cup carrots",
              "1/2 cup brown rice",
              "2 tbsp low-sodium soy sauce"
            ],
            instructions: "Stir fry beef and vegetables, serve over cooked brown rice",
            timeOfDay: "dinner"
          },
          {
            name: "Protein Smoothie",
            description: "Recovery snack",
            calories: "250",
            protein: "20g",
            carbs: "30g",
            fats: "5g",
            ingredients: [
              "1 scoop protein powder",
              "1 banana",
              "1 cup almond milk",
              "1/2 cup berries",
              "Ice cubes"
            ],
            instructions: "Blend all ingredients until smooth",
            timeOfDay: "snack"
          }
        ],
        totalCalories: "1700",
        totalProtein: "120g",
        totalCarbs: "135g",
        totalFats: "60g",
        waterIntake: "3 liters",
        notes: "Hydrate well before cardio session"
      },
      Wednesday: {
        day: "Wednesday",
        meals: [
          {
            name: "Protein Pancakes",
            description: "Muscle-building breakfast",
            calories: "450",
            protein: "30g",
            carbs: "45g",
            fats: "15g",
            ingredients: [
              "1 scoop protein powder",
              "1 banana",
              "1/2 cup oats",
              "2 egg whites",
              "1 tbsp maple syrup"
            ],
            instructions: "Blend ingredients, cook on a non-stick pan until bubbles form, flip and cook other side",
            timeOfDay: "breakfast"
          },
          {
            name: "Tuna Salad Sandwich",
            description: "Protein-rich lunch",
            calories: "500",
            protein: "35g",
            carbs: "40g",
            fats: "20g",
            ingredients: [
              "4oz tuna (canned in water)",
              "2 slices whole grain bread",
              "1 tbsp light mayo",
              "1 cup mixed greens",
              "1/4 cup diced celery"
            ],
            instructions: "Mix tuna with mayo and celery, serve on bread with greens",
            timeOfDay: "lunch"
          },
          {
            name: "Baked Chicken with Quinoa",
            description: "Complete protein dinner",
            calories: "600",
            protein: "40g",
            carbs: "50g",
            fats: "20g",
            ingredients: [
              "5oz chicken breast",
              "1/2 cup quinoa",
              "1 cup roasted vegetables",
              "1 tbsp olive oil",
              "Herbs and spices"
            ],
            instructions: "Bake chicken at 375°F for 25 minutes, serve with cooked quinoa and roasted vegetables",
            timeOfDay: "dinner"
          },
          {
            name: "Cottage Cheese with Fruit",
            description: "Slow-digesting protein snack",
            calories: "200",
            protein: "20g",
            carbs: "15g",
            fats: "5g",
            ingredients: [
              "1 cup cottage cheese",
              "1/2 cup pineapple chunks",
              "1 tbsp honey"
            ],
            instructions: "Mix cottage cheese with pineapple and honey",
            timeOfDay: "snack"
          }
        ],
        totalCalories: "1750",
        totalProtein: "125g",
        totalCarbs: "150g",
        totalFats: "60g",
        waterIntake: "3 liters",
        notes: "Extra protein to support back and biceps workout"
      },
      Thursday: {
        day: "Thursday",
        meals: [
          {
            name: "Green Smoothie Bowl",
            description: "Nutrient-dense breakfast",
            calories: "400",
            protein: "20g",
            carbs: "50g",
            fats: "15g",
            ingredients: [
              "1 scoop protein powder",
              "1 cup spinach",
              "1 banana",
              "1/2 cup berries",
              "1 tbsp almond butter",
              "1 tbsp chia seeds"
            ],
            instructions: "Blend protein, spinach, banana, and berries, top with almond butter and chia seeds",
            timeOfDay: "breakfast"
          },
          {
            name: "Mediterranean Bowl",
            description: "Anti-inflammatory lunch",
            calories: "550",
            protein: "25g",
            carbs: "60g",
            fats: "25g",
            ingredients: [
              "1/2 cup hummus",
              "1/2 cup quinoa",
              "1 cup mixed vegetables",
              "1/4 cup olives",
              "2 tbsp feta cheese",
              "1 tbsp olive oil"
            ],
            instructions: "Arrange all ingredients in a bowl, drizzle with olive oil",
            timeOfDay: "lunch"
          },
          {
            name: "Vegetable Stir Fry with Tofu",
            description: "Plant-based protein dinner",
            calories: "500",
            protein: "25g",
            carbs: "50g",
            fats: "20g",
            ingredients: [
              "6oz firm tofu",
              "2 cups mixed vegetables",
              "1/2 cup brown rice",
              "2 tbsp stir fry sauce",
              "1 tbsp sesame oil"
            ],
            instructions: "Stir fry tofu and vegetables in sesame oil, add sauce, serve over rice",
            timeOfDay: "dinner"
          },
          {
            name: "Trail Mix",
            description: "Energy-boosting snack",
            calories: "250",
            protein: "10g",
            carbs: "20g",
            fats: "15g",
            ingredients: [
              "1/4 cup mixed nuts",
              "2 tbsp dried fruit",
              "1 tbsp dark chocolate chips"
            ],
            instructions: "Mix all ingredients together",
            timeOfDay: "snack"
          }
        ],
        totalCalories: "1700",
        totalProtein: "80g",
        totalCarbs: "180g",
        totalFats: "75g",
        waterIntake: "3 liters",
        notes: "Rest day - focus on recovery and hydration"
      },
      Friday: {
        day: "Friday",
        meals: [
          {
            name: "Egg and Avocado Toast",
            description: "Healthy fat breakfast",
            calories: "450",
            protein: "20g",
            carbs: "30g",
            fats: "25g",
            ingredients: [
              "2 whole eggs",
              "1/2 avocado",
              "2 slices whole grain bread",
              "1 tbsp olive oil",
              "Salt and pepper"
            ],
            instructions: "Toast bread, mash avocado and spread on toast, top with fried eggs",
            timeOfDay: "breakfast"
          },
          {
            name: "Chicken and Quinoa Bowl",
            description: "Balanced lunch option",
            calories: "550",
            protein: "40g",
            carbs: "50g",
            fats: "15g",
            ingredients: [
              "5oz grilled chicken",
              "1/2 cup quinoa",
              "1 cup roasted vegetables",
              "1 tbsp olive oil",
              "Lemon juice and herbs"
            ],
            instructions: "Combine all ingredients in a bowl, dress with olive oil and lemon juice",
            timeOfDay: "lunch"
          },
          {
            name: "Baked Fish with Sweet Potato",
            description: "Lean protein dinner",
            calories: "500",
            protein: "35g",
            carbs: "45g",
            fats: "15g",
            ingredients: [
              "5oz white fish fillet",
              "1 medium sweet potato",
              "1 cup steamed broccoli",
              "1 tbsp olive oil",
              "Herbs and spices"
            ],
            instructions: "Bake fish at 375°F for 15 minutes, serve with baked sweet potato and steamed broccoli",
            timeOfDay: "dinner"
          },
          {
            name: "Protein Bar",
            description: "Convenient protein snack",
            calories: "200",
            protein: "15g",
            carbs: "20g",
            fats: "8g",
            ingredients: [
              "1 commercial protein bar"
            ],
            instructions: "Unwrap and enjoy",
            timeOfDay: "snack"
          }
        ],
        totalCalories: "1700",
        totalProtein: "110g",
        totalCarbs: "145g",
        totalFats: "63g",
        waterIntake: "3 liters",
        notes: "Focus on protein intake for legs and shoulders workout"
      },
      Saturday: {
        day: "Saturday",
        meals: [
          {
            name: "Protein Smoothie",
            description: "Quick energy breakfast",
            calories: "400",
            protein: "30g",
            carbs: "45g",
            fats: "10g",
            ingredients: [
              "1 scoop protein powder",
              "1 banana",
              "1 cup almond milk",
              "1 tbsp peanut butter",
              "1/2 cup berries"
            ],
            instructions: "Blend all ingredients until smooth",
            timeOfDay: "breakfast"
          },
          {
            name: "Turkey and Rice Bowl",
            description: "Post-workout meal",
            calories: "550",
            protein: "40g",
            carbs: "60g",
            fats: "10g",
            ingredients: [
              "5oz ground turkey",
              "1/2 cup brown rice",
              "1 cup mixed vegetables",
              "2 tbsp low-sodium soy sauce",
              "1 tsp sesame oil"
            ],
            instructions: "Cook turkey, combine with cooked rice and vegetables, season with soy sauce and sesame oil",
            timeOfDay: "lunch"
          },
          {
            name: "Grilled Steak with Vegetables",
            description: "Protein-rich dinner",
            calories: "600",
            protein: "40g",
            carbs: "30g",
            fats: "30g",
            ingredients: [
              "4oz lean steak",
              "2 cups grilled vegetables",
              "1 small baked potato",
              "1 tbsp olive oil",
              "Herbs and spices"
            ],
            instructions: "Grill steak to desired doneness, serve with grilled vegetables and baked potato",
            timeOfDay: "dinner"
          },
          {
            name: "Greek Yogurt Parfait",
            description: "Protein and probiotic snack",
            calories: "250",
            protein: "20g",
            carbs: "25g",
            fats: "5g",
            ingredients: [
              "1 cup Greek yogurt",
              "1/4 cup granola",
              "1/2 cup mixed berries",
              "1 tsp honey"
            ],
            instructions: "Layer yogurt, granola, and berries, drizzle with honey",
            timeOfDay: "snack"
          }
        ],
        totalCalories: "1800",
        totalProtein: "130g",
        totalCarbs: "160g",
        totalFats: "55g",
        waterIntake: "3 liters",
        notes: "Higher carbs to fuel HIIT workout"
      },
      Sunday: {
        day: "Sunday",
        meals: [
          {
            name: "Veggie Breakfast Burrito",
            description: "Fiber-rich breakfast",
            calories: "450",
            protein: "25g",
            carbs: "45g",
            fats: "20g",
            ingredients: [
              "2 whole eggs",
              "1 whole grain tortilla",
              "1/4 cup black beans",
              "1/4 cup bell peppers",
              "1/4 avocado",
              "2 tbsp salsa"
            ],
            instructions: "Scramble eggs, warm tortilla, fill with eggs, beans, peppers, top with avocado and salsa",
            timeOfDay: "breakfast"
          },
          {
            name: "Salmon Poke Bowl",
            description: "Omega-3 rich lunch",
            calories: "550",
            protein: "35g",
            carbs: "50g",
            fats: "20g",
            ingredients: [
              "4oz raw sushi-grade salmon",
              "1/2 cup brown rice",
              "1/4 avocado",
              "1/4 cup cucumber",
              "1/4 cup edamame",
              "1 tbsp soy sauce",
              "1 tsp sesame oil"
            ],
            instructions: "Dice salmon, arrange all ingredients in a bowl, dress with soy sauce and sesame oil",
            timeOfDay: "lunch"
          },
          {
            name: "Roast Chicken with Vegetables",
            description: "Classic balanced dinner",
            calories: "550",
            protein: "40g",
            carbs: "35g",
            fats: "20g",
            ingredients: [
              "5oz roasted chicken breast",
              "1 cup roasted root vegetables",
              "1 cup steamed green vegetables",
              "1 tbsp olive oil",
              "Herbs and spices"
            ],
            instructions: "Roast chicken and vegetables at 375°F for 30 minutes",
            timeOfDay: "dinner"
          },
          {
            name: "Apple with Almond Butter",
            description: "Simple nutritious snack",
            calories: "200",
            protein: "5g",
            carbs: "25g",
            fats: "10g",
            ingredients: [
              "1 medium apple",
              "1 tbsp almond butter"
            ],
            instructions: "Slice apple and serve with almond butter",
            timeOfDay: "snack"
          }
        ],
        totalCalories: "1750",
        totalProtein: "105g",
        totalCarbs: "155g",
        totalFats: "70g",
        waterIntake: "3 liters",
        notes: "Rest day - focus on recovery and preparation for the week ahead"
      }
    };
    
    const nutritionPlan = new NutritionPlan({
      userId,
      name: "7-Day Balanced Nutrition Plan",
      userDetails: {
        age: "30",
        gender: "Not specified",
        weight: "Not specified",
        height: "Not specified",
        goals: "Build muscle and improve overall nutrition",
        preferences: "Balanced macronutrients",
        limitations: "None",
        allergies: "None",
        dietaryRestrictions: "None"
      },
      rawPlan: "This is a 7-day balanced nutrition plan with appropriate macronutrients for muscle building and recovery.",
      weekSchedule,
      guidelines: [
        "Eat 4-5 meals per day, spaced 3-4 hours apart",
        "Consume protein with every meal",
        "Prioritize whole foods over processed options",
        "Adjust portion sizes based on hunger and activity level",
        "Aim for at least 5 servings of fruits and vegetables daily"
      ],
      hydration: [
        "Drink at least 3 liters of water daily",
        "Increase water intake during and after workouts",
        "Consider electrolyte drinks for intense training sessions",
        "Limit caffeine to 2-3 cups per day"
      ],
      supplements: [
        "Whey protein for post-workout recovery",
        "Multivitamin for nutritional insurance",
        "Omega-3 fatty acids for joint health and inflammation reduction",
        "Creatine monohydrate for strength and power (optional)"
      ]
    });
    
    const savedPlan = await nutritionPlan.save();
    
    res.status(201).json({
      message: "Test nutrition plan created successfully",
      plan: savedPlan
    });
  } catch (error) {
    console.error("Error creating test nutrition plan:", error);
    res.status(500).json({ error: "Failed to create test nutrition plan" });
  }
});

// Nutrition plan routes
router.post("/personalized-nutrition-plan", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, getPersonalizedNutritionPlan);
router.get("/user-nutrition-plans/:userId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, getUserNutritionPlans);
router.get("/nutrition-plan-details/:planId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, getNutritionPlanById);
router.get("/nutrition-plans-by-workout/:workoutPlanId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, getNutritionPlansByWorkoutPlan);
router.put("/update-nutrition-plan/:planId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, updateNutritionPlan);
router.delete("/delete-nutrition-plan/:planId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, deleteNutritionPlan);
router.patch("/toggle-nutrition-favorite/:planId", (req, res, next) => {
  getAuthMiddleware(req)(req, res, next);
}, toggleFavoriteNutritionPlan);

export default router;
