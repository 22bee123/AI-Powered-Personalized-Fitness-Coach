import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import NutritionPlan from "../models/nutrition.model.js";
import WorkoutPlan from "../models/fitness.model.js";

// Ensure dotenv is configured properly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Generate personalized nutrition plan with Gemini
const getPersonalizedNutritionPlan = async (req, res) => {
  try {
    const { 
      userId, 
      name, 
      workoutPlanId, 
      goals, 
      preferences, 
      limitations, 
      age, 
      gender, 
      weight, 
      height, 
      allergies, 
      dietaryRestrictions 
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    // Get workout plan if workoutPlanId is provided
    let workoutPlan = null;
    if (workoutPlanId) {
      try {
        workoutPlan = await WorkoutPlan.findById(workoutPlanId);
        if (!workoutPlan) {
          return res.status(404).json({ error: "Workout plan not found" });
        }
      } catch (error) {
        console.error("Error fetching workout plan:", error);
        return res.status(500).json({ error: "Error fetching workout plan" });
      }
    }
    
    // Create prompt based on user input
    let prompt = `You are an AI-powered nutrition coach. Create a detailed nutrition plan for a user. `;
    
    if (age) prompt += `The user is ${age} years old. `;
    if (gender) prompt += `The user's gender is ${gender}. `;
    if (weight) prompt += `The user weighs ${weight}. `;
    if (height) prompt += `The user's height is ${height}. `;
    
    if (goals) {
      prompt += `The user's fitness goals are: ${goals}. `;
    }
    
    if (preferences) {
      prompt += `The user's food preferences are: ${preferences}. `;
    }
    
    if (limitations) {
      prompt += `The user has the following limitations or health concerns: ${limitations}. `;
    }
    
    if (allergies) {
      prompt += `The user has the following allergies: ${allergies}. `;
    }
    
    if (dietaryRestrictions) {
      prompt += `The user has the following dietary restrictions: ${dietaryRestrictions}. `;
    }
    
    // Include workout plan information if available
    if (workoutPlan) {
      prompt += `The user follows this workout plan: `;
      
      // Add workout schedule information
      if (workoutPlan.weekSchedule) {
        prompt += `Weekly workout schedule: `;
        for (const day in workoutPlan.weekSchedule) {
          const dailyWorkout = workoutPlan.weekSchedule[day];
          prompt += `${day}: ${dailyWorkout.focus} (${dailyWorkout.isRestDay ? 'Rest Day' : dailyWorkout.workoutType}). `;
        }
      }
      
      // Add difficulty level
      if (workoutPlan.difficulty) {
        prompt += `The workout plan difficulty is ${workoutPlan.difficulty}. `;
      }
    }
    
    prompt += `Provide:
    1. A detailed weekly nutrition schedule that includes specific meals for each day of the week (Monday through Sunday)
    2. Specific meals with ingredients, preparation instructions, and nutritional information
    3. General nutrition guidelines
    4. Hydration recommendations
    5. Supplement recommendations if appropriate
    
    Format the response in a structured, easy-to-follow manner with clear sections.
    
    For the weekly schedule, use this exact format:
    
    WEEKLY NUTRITION SCHEDULE:
    Monday:
    - Breakfast: [meal name] - [brief description]
    - Lunch: [meal name] - [brief description]
    - Dinner: [meal name] - [brief description]
    - Snacks: [snack options]
    
    Tuesday:
    - Breakfast: [meal name] - [brief description]
    - Lunch: [meal name] - [brief description]
    - Dinner: [meal name] - [brief description]
    - Snacks: [snack options]
    
    [Continue for all days of the week]
    
    Then, provide a section titled MEALS with detailed information for each meal referenced in the schedule:
    
    MEALS:
    1. [Meal Name]
    - Calories: [approximate calories]
    - Protein: [grams]
    - Carbs: [grams]
    - Fats: [grams]
    - Ingredients: [list of ingredients with amounts]
    - Instructions: [preparation instructions]
    - Time of day: [breakfast/lunch/dinner/snack]
    
    2. [Meal Name]
    - Calories: [approximate calories]
    - Protein: [grams]
    - Carbs: [grams]
    - Fats: [grams]
    - Ingredients: [list of ingredients with amounts]
    - Instructions: [preparation instructions]
    - Time of day: [breakfast/lunch/dinner/snack]
    
    [Continue for all meals]
    
    Then include these additional sections:
    
    NUTRITION GUIDELINES:
    - [Guideline 1]
    - [Guideline 2]
    - [Continue for 3-5 guidelines]
    
    HYDRATION:
    - [Hydration recommendation 1]
    - [Hydration recommendation 2]
    - [Continue for 2-3 recommendations]
    
    SUPPLEMENTS (if appropriate):
    - [Supplement recommendation 1]
    - [Supplement recommendation 2]
    - [Continue as needed]
    
    Make sure all meals and recommendations are appropriate for the user's fitness level, goals, and any dietary restrictions or allergies they've mentioned. Be specific and detailed in your recommendations.`;
    
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
          error: `Failed to generate nutrition plan: ${errorData.error?.message || 'Unknown error'}`,
          details: errorData
        });
      }
      
      const data = await response.json();
      
      // Extract the response text from Gemini API response with proper error handling
      let nutritionCoachResponse = "Unable to generate nutrition plan";
      
      if (data && data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
        nutritionCoachResponse = data.candidates[0].content.parts[0].text;
      } else if (data && data.error) {
        console.error("Gemini API Error:", data.error);
        return res.status(500).json({ error: "Failed to generate nutrition plan: " + (data.error.message || JSON.stringify(data.error)) });
      }
      
      // Parse the response to extract structured data
      const parsedPlan = parseNutritionPlan(nutritionCoachResponse);
      
      // Create a new nutrition plan
      const nutritionPlan = new NutritionPlan({
        userId,
        name: name || "Personalized Nutrition Plan",
        workoutPlanId: workoutPlanId || null,
        userDetails: {
          age: age || '',
          gender: gender || '',
          weight: weight || '',
          height: height || '',
          goals: goals || '',
          preferences: preferences || '',
          limitations: limitations || '',
          allergies: allergies || '',
          dietaryRestrictions: dietaryRestrictions || ''
        },
        rawPlan: nutritionCoachResponse,
        weekSchedule: parsedPlan.weekSchedule || {},
        guidelines: parsedPlan.guidelines || [],
        hydration: parsedPlan.hydration || [],
        supplements: parsedPlan.supplements || []
      });
      
      // Save the nutrition plan
      const savedPlan = await nutritionPlan.save();
      
      console.log("Nutrition plan saved successfully:", savedPlan._id);
      
      // Return the saved plan
      return res.json({ 
        message: "Nutrition plan generated and saved successfully",
        plan: nutritionCoachResponse,
        parsedPlan,
        savedPlan
      });
      
    } catch (fetchError) {
      console.error("Error calling Gemini API:", fetchError);
      return res.status(500).json({ error: "Failed to generate nutrition plan: " + fetchError.message });
    }
  } catch (error) {
    console.error("Error in getPersonalizedNutritionPlan:", error);
    return res.status(500).json({ error: "Failed to generate nutrition plan: " + error.message });
  }
};

// Helper function to parse the nutrition plan text into structured data
const parseNutritionPlan = (rawPlan) => {
  try {
    // Initialize the result object
    const result = {
      weekSchedule: {
        Monday: { day: 'Monday', meals: [] },
        Tuesday: { day: 'Tuesday', meals: [] },
        Wednesday: { day: 'Wednesday', meals: [] },
        Thursday: { day: 'Thursday', meals: [] },
        Friday: { day: 'Friday', meals: [] },
        Saturday: { day: 'Saturday', meals: [] },
        Sunday: { day: 'Sunday', meals: [] }
      },
      guidelines: [],
      hydration: [],
      supplements: []
    };
    
    // Split the raw plan into sections
    const sections = rawPlan.split(/\n\s*\n/);
    
    // Process each section
    let currentSection = '';
    let allMeals = [];
    
    for (const section of sections) {
      const trimmedSection = section.trim();
      
      if (trimmedSection.startsWith('WEEKLY NUTRITION SCHEDULE:') || 
          trimmedSection.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):/)) {
        currentSection = 'schedule';
        
        // Process the weekly schedule
        const dayMatch = trimmedSection.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday):/);
        if (dayMatch) {
          const day = dayMatch[1];
          const mealLines = trimmedSection.split('\n').slice(1); // Skip the day line
          
          for (const mealLine of mealLines) {
            const mealMatch = mealLine.match(/- (Breakfast|Lunch|Dinner|Snacks?): ([^-]+)(?:- (.+))?/);
            if (mealMatch) {
              const timeOfDay = mealMatch[1].toLowerCase();
              const mealName = mealMatch[2].trim();
              const description = mealMatch[3] ? mealMatch[3].trim() : '';
              
              // Add to the day's meals
              result.weekSchedule[day].meals.push({
                name: mealName,
                description: description,
                timeOfDay: timeOfDay === 'snacks' ? 'snack' : timeOfDay.toLowerCase()
              });
              
              // Track all meal names for later matching
              allMeals.push(mealName);
            }
          }
        }
      } else if (trimmedSection.startsWith('MEALS:')) {
        currentSection = 'meals';
        
        // Process the meals section
        const mealBlocks = trimmedSection.split(/\d+\.\s+/).slice(1); // Skip the "MEALS:" header
        
        for (const mealBlock of mealBlocks) {
          const mealLines = mealBlock.split('\n');
          const mealName = mealLines[0].trim();
          
          const meal = {
            name: mealName,
            ingredients: [],
            timeOfDay: 'snack' // Default
          };
          
          for (let i = 1; i < mealLines.length; i++) {
            const line = mealLines[i].trim();
            
            if (line.startsWith('- Calories:')) {
              meal.calories = line.replace('- Calories:', '').trim();
            } else if (line.startsWith('- Protein:')) {
              meal.protein = line.replace('- Protein:', '').trim();
            } else if (line.startsWith('- Carbs:')) {
              meal.carbs = line.replace('- Carbs:', '').trim();
            } else if (line.startsWith('- Fats:')) {
              meal.fats = line.replace('- Fats:', '').trim();
            } else if (line.startsWith('- Ingredients:')) {
              // Get ingredients from this line and possibly following lines
              let ingredientsText = line.replace('- Ingredients:', '').trim();
              let j = i + 1;
              while (j < mealLines.length && !mealLines[j].trim().startsWith('- ')) {
                ingredientsText += ' ' + mealLines[j].trim();
                j++;
              }
              i = j - 1; // Update the outer loop counter
              
              // Split ingredients by commas or line breaks
              const ingredients = ingredientsText.split(/,|\n/).map(ing => ing.trim()).filter(ing => ing);
              meal.ingredients = ingredients;
            } else if (line.startsWith('- Instructions:')) {
              meal.instructions = line.replace('- Instructions:', '').trim();
              // Collect multi-line instructions
              let j = i + 1;
              while (j < mealLines.length && !mealLines[j].trim().startsWith('- ')) {
                meal.instructions += ' ' + mealLines[j].trim();
                j++;
              }
              i = j - 1; // Update the outer loop counter
            } else if (line.startsWith('- Time of day:')) {
              const timeOfDay = line.replace('- Time of day:', '').trim().toLowerCase();
              meal.timeOfDay = timeOfDay === 'snacks' ? 'snack' : timeOfDay;
            }
          }
          
          // Update the meals in the weekly schedule
          for (const day in result.weekSchedule) {
            for (let i = 0; i < result.weekSchedule[day].meals.length; i++) {
              if (result.weekSchedule[day].meals[i].name === mealName) {
                result.weekSchedule[day].meals[i] = {
                  ...result.weekSchedule[day].meals[i],
                  ...meal
                };
              }
            }
          }
        }
      } else if (trimmedSection.startsWith('NUTRITION GUIDELINES:')) {
        currentSection = 'guidelines';
        
        // Process guidelines
        const lines = trimmedSection.split('\n').slice(1); // Skip the header
        for (const line of lines) {
          const guideline = line.replace(/^-\s*/, '').trim();
          if (guideline) {
            result.guidelines.push(guideline);
          }
        }
      } else if (trimmedSection.startsWith('HYDRATION:')) {
        currentSection = 'hydration';
        
        // Process hydration recommendations
        const lines = trimmedSection.split('\n').slice(1); // Skip the header
        for (const line of lines) {
          const recommendation = line.replace(/^-\s*/, '').trim();
          if (recommendation) {
            result.hydration.push(recommendation);
          }
        }
      } else if (trimmedSection.startsWith('SUPPLEMENTS')) {
        currentSection = 'supplements';
        
        // Process supplement recommendations
        const lines = trimmedSection.split('\n').slice(1); // Skip the header
        for (const line of lines) {
          const recommendation = line.replace(/^-\s*/, '').trim();
          if (recommendation) {
            result.supplements.push(recommendation);
          }
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error parsing nutrition plan:", error);
    return {
      weekSchedule: {
        Monday: { day: 'Monday', meals: [] },
        Tuesday: { day: 'Tuesday', meals: [] },
        Wednesday: { day: 'Wednesday', meals: [] },
        Thursday: { day: 'Thursday', meals: [] },
        Friday: { day: 'Friday', meals: [] },
        Saturday: { day: 'Saturday', meals: [] },
        Sunday: { day: 'Sunday', meals: [] }
      },
      guidelines: [],
      hydration: [],
      supplements: []
    };
  }
};

// Get all nutrition plans for a user
const getUserNutritionPlans = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }
    
    const plans = await NutritionPlan.find({ userId }).sort({ createdAt: -1 });
    
    return res.json(plans);
  } catch (error) {
    console.error("Error fetching nutrition plans:", error);
    return res.status(500).json({ error: "Failed to fetch nutrition plans: " + error.message });
  }
};

// Get a specific nutrition plan by ID
const getNutritionPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    const plan = await NutritionPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ error: "Nutrition plan not found" });
    }
    
    return res.json(plan);
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    return res.status(500).json({ error: "Failed to fetch nutrition plan: " + error.message });
  }
};

// Update a nutrition plan
const updateNutritionPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updates = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    // Find the plan and update it
    const updatedPlan = await NutritionPlan.findByIdAndUpdate(
      planId,
      { ...updates, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedPlan) {
      return res.status(404).json({ error: "Nutrition plan not found" });
    }
    
    return res.json({
      message: "Nutrition plan updated successfully",
      plan: updatedPlan
    });
  } catch (error) {
    console.error("Error updating nutrition plan:", error);
    return res.status(500).json({ error: "Failed to update nutrition plan: " + error.message });
  }
};

// Delete a nutrition plan
const deleteNutritionPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    const deletedPlan = await NutritionPlan.findByIdAndDelete(planId);
    
    if (!deletedPlan) {
      return res.status(404).json({ error: "Nutrition plan not found" });
    }
    
    return res.json({
      message: "Nutrition plan deleted successfully",
      planId
    });
  } catch (error) {
    console.error("Error deleting nutrition plan:", error);
    return res.status(500).json({ error: "Failed to delete nutrition plan: " + error.message });
  }
};

// Toggle favorite status of a nutrition plan
const toggleFavoriteNutritionPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    // Find the plan
    const plan = await NutritionPlan.findById(planId);
    
    if (!plan) {
      return res.status(404).json({ error: "Nutrition plan not found" });
    }
    
    // Toggle the favorite status
    plan.isFavorite = !plan.isFavorite;
    await plan.save();
    
    return res.json({
      message: `Nutrition plan ${plan.isFavorite ? 'marked as favorite' : 'removed from favorites'}`,
      plan
    });
  } catch (error) {
    console.error("Error toggling favorite status:", error);
    return res.status(500).json({ error: "Failed to toggle favorite status: " + error.message });
  }
};

// Get nutrition plans associated with a workout plan
const getNutritionPlansByWorkoutPlan = async (req, res) => {
  try {
    const { workoutPlanId } = req.params;
    
    if (!workoutPlanId) {
      return res.status(400).json({ error: "Workout Plan ID is required" });
    }
    
    const plans = await NutritionPlan.find({ workoutPlanId }).sort({ createdAt: -1 });
    
    return res.json(plans);
  } catch (error) {
    console.error("Error fetching nutrition plans by workout plan:", error);
    return res.status(500).json({ error: "Failed to fetch nutrition plans: " + error.message });
  }
};

export {
  getPersonalizedNutritionPlan,
  getUserNutritionPlans,
  getNutritionPlanById,
  updateNutritionPlan,
  deleteNutritionPlan,
  toggleFavoriteNutritionPlan,
  getNutritionPlansByWorkoutPlan
};
