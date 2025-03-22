import NutritionPlan from '../model/nutrition.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Calculate base calorie needs using Harris-Benedict equation
const calculateBaseCalories = (userData) => {
  // Default values if not provided
  const age = userData.age ? parseInt(userData.age) : 30;
  const gender = userData.gender?.toLowerCase() || 'male';
  const height = userData.height ? parseInt(userData.height) : 170; // cm
  const weight = userData.weight ? parseInt(userData.weight) : 70; // kg
  
  // Activity level multiplier based on workout frequency
  let activityMultiplier = 1.2; // Sedentary (little or no exercise)
  
  const workoutDays = userData.workoutDaysPerWeek || '3-4';
  if (workoutDays === '1-2') {
    activityMultiplier = 1.375; // Lightly active (light exercise/sports 1-3 days/week)
  } else if (workoutDays === '3-4') {
    activityMultiplier = 1.55; // Moderately active (moderate exercise/sports 3-5 days/week)
  } else if (workoutDays === '5-6') {
    activityMultiplier = 1.725; // Very active (hard exercise/sports 6-7 days a week)
  } else if (workoutDays === '7') {
    activityMultiplier = 1.9; // Extra active (very hard exercise & physical job or 2x training)
  }
  
  // Calculate BMR (Basal Metabolic Rate)
  let bmr;
  if (gender === 'female') {
    bmr = 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age);
  } else {
    bmr = 66.47 + (13.75 * weight) + (5.003 * height) - (6.755 * age);
  }
  
  // Calculate TDEE (Total Daily Energy Expenditure)
  const tdee = Math.round(bmr * activityMultiplier);
  
  // Adjust based on fitness goals
  let goalAdjustedCalories = tdee;
  const fitnessGoals = userData.fitnessGoals || [];
  
  if (fitnessGoals.includes('weight loss')) {
    goalAdjustedCalories = Math.round(tdee * 0.85); // 15% deficit for weight loss
  } else if (fitnessGoals.includes('muscle gain')) {
    goalAdjustedCalories = Math.round(tdee * 1.1); // 10% surplus for muscle gain
  }
  
  return {
    bmr: Math.round(bmr),
    tdee,
    goalAdjustedCalories
  };
};

// Helper function to generate system prompt based on user data
const generateSystemPrompt = (userData) => {
  // Calculate calorie needs
  const calorieData = calculateBaseCalories(userData);
  
  return `You are an expert nutrition coach. Create a personalized daily nutrition plan based on the following user information:
  
  User Profile:
  - Age: ${userData.age || 'Not specified'}
  - Gender: ${userData.gender || 'Not specified'}
  - Height: ${userData.height || 'Not specified'} cm
  - Weight: ${userData.weight || 'Not specified'} kg
  - Fitness Level: ${userData.fitnessLevel || 'beginner'}
  - Fitness Goals: ${userData.fitnessGoals?.join(', ') || 'Not specified'}
  - Health Conditions: ${userData.healthConditions?.join(', ') || 'None'}
  - Workout Duration: ${userData.preferredWorkoutDuration || '30-45'} minutes
  - Workout Frequency: ${userData.workoutDaysPerWeek || '3-4'} days per week
  - Equipment Access: ${userData.equipmentAccess || 'limited'}
  - Focus Areas: ${userData.focusAreas?.join(', ') || 'Not specified'}
  - Workout Difficulty: ${userData.difficulty || 'medium'}
  
  Calculated Calorie Needs:
  - Basal Metabolic Rate (BMR): ${calorieData.bmr} calories/day
  - Total Daily Energy Expenditure (TDEE): ${calorieData.tdee} calories/day
  - Recommended Daily Calories (adjusted for goals): ${calorieData.goalAdjustedCalories} calories/day
  
  Create a daily nutrition plan that includes:
  1. 6 meals (breakfast, morning snack, lunch, afternoon snack, dinner, evening snack)
  2. For each meal, include:
     - Meal name
     - Recommended time
     - List of foods
     - Approximate calories
  3. Total daily calories (should be close to the recommended ${calorieData.goalAdjustedCalories} calories)
  4. Macronutrient breakdown (protein, carbs, fats in grams)
  5. 5 nutrition tips specific to the user's goals and profile
  
  Format your response as a structured JSON object with the following format:
  {
    "dailyPlan": [
      {
        "meal": "string",
        "time": "string",
        "foods": ["string", "string", ...],
        "calories": number
      },
      ...
    ],
    "totalCalories": number,
    "macros": {
      "protein": number,
      "carbs": number,
      "fats": number
    },
    "nutritionTips": ["string", "string", ...]
  }
  
  IMPORTANT: Do not include any explanatory text outside the JSON structure. Do not wrap the JSON in markdown code blocks. Return only valid JSON that can be directly parsed.`;
};

// Generate a nutrition plan using Gemini AI
export const generateNutritionPlan = async (req, res) => {
  try {
    const userData = req.body.userData || {};
    const userId = req.user.id;

    // Calculate calorie needs
    const calorieData = calculateBaseCalories(userData);

    // Generate nutrition plan using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = generateSystemPrompt(userData);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the JSON response
    let nutritionData;
    try {
      // Clean the response text to handle markdown code blocks
      let cleanedText = text;
      
      // Remove markdown code block formatting if present
      if (text.includes('```json')) {
        cleanedText = text.replace(/```json\s*/, '').replace(/\s*```\s*$/, '');
      } else if (text.includes('```')) {
        cleanedText = text.replace(/```\s*/, '').replace(/\s*```\s*$/, '');
      }
      
      nutritionData = JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', text);
      return res.status(500).json({ message: 'Failed to generate nutrition plan. Please try again.' });
    }

    // Save the nutrition plan to the database
    const nutritionPlan = new NutritionPlan({
      userId,
      dailyPlan: nutritionData.dailyPlan,
      totalCalories: nutritionData.totalCalories,
      macros: nutritionData.macros,
      nutritionTips: nutritionData.nutritionTips,
      calorieCalculations: {
        bmr: calorieData.bmr,
        tdee: calorieData.tdee,
        goalAdjustedCalories: calorieData.goalAdjustedCalories
      }
    });

    await nutritionPlan.save();

    // Include calorie calculation data in the response
    res.status(201).json({
      message: 'Nutrition plan generated successfully',
      nutritionPlan,
      calorieData
    });
  } catch (error) {
    console.error('Error generating nutrition plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get the user's latest nutrition plan
export const getLatestNutritionPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const nutritionPlan = await NutritionPlan.findOne({ userId })
      .sort({ createdAt: -1 });
    
    if (!nutritionPlan) {
      return res.status(404).json({ message: 'No nutrition plan found' });
    }
    
    res.status(200).json({ nutritionPlan });
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all nutrition plans for a user
export const getAllNutritionPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const nutritionPlans = await NutritionPlan.find({ userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({ nutritionPlans });
  } catch (error) {
    console.error('Error fetching nutrition plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a nutrition plan
export const deleteNutritionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const nutritionPlan = await NutritionPlan.findOne({ _id: id, userId });
    
    if (!nutritionPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }
    
    await NutritionPlan.deleteOne({ _id: id });
    
    res.status(200).json({ message: 'Nutrition plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting nutrition plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};