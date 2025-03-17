import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configure dotenv to load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System prompt for the AI fitness coach
const SYSTEM_PROMPT = `
You are an AI-powered fitness coach with expertise in exercise, nutrition, and overall wellness.
Your goal is to provide helpful, accurate, and personalized fitness advice to users.

When responding to users:
- Be encouraging, motivational, and supportive
- Provide evidence-based information about fitness, exercise techniques, and nutrition
- Offer personalized recommendations based on the user's goals, preferences, and limitations
- Suggest specific exercises with proper form instructions when appropriate
- Provide nutrition guidance that aligns with fitness goals
- Recommend recovery strategies and injury prevention tips
- Keep responses concise but informative
- Use a friendly, conversational tone

Avoid:
- Giving medical advice or diagnosing conditions
- Recommending extreme diets or dangerous exercise practices
- One-size-fits-all advice without considering individual differences
- Overwhelming users with too much information at once

Remember that you're a supportive coach helping users achieve their fitness goals safely and effectively.
`;

// Chat with the AI fitness coach
export const chatWithAICoach = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId; // Set by auth middleware

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Initialize the model with gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the prompt with system instructions
    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser question: ${message}`;

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = result.response.text();

    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error in AI coach chat:', error);
    return res.status(500).json({ 
      message: 'Failed to get response from AI coach', 
      error: error.message 
    });
  }
};

// Get workout suggestions from AI coach
export const getWorkoutSuggestions = async (req, res) => {
  try {
    const { fitnessLevel, goals, preferences, limitations } = req.body;
    const userId = req.user.userId; // Set by auth middleware

    // Construct the prompt
    const prompt = `
    ${SYSTEM_PROMPT}
    
    As a fitness coach, please create a personalized workout plan with the following details:
    
    Fitness Level: ${fitnessLevel || 'Not specified'}
    Goals: ${goals || 'Not specified'}
    Preferences: ${preferences || 'Not specified'}
    Limitations/Injuries: ${limitations || 'None mentioned'}
    
    Please include:
    1. A weekly workout schedule
    2. Specific exercises with sets and reps
    3. Rest periods
    4. Progression plan
    5. Warm-up and cool-down recommendations
    `;

    // Initialize the model with gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return res.status(200).json({ workoutPlan: response });
  } catch (error) {
    console.error('Error getting workout suggestions:', error);
    return res.status(500).json({ 
      message: 'Failed to get workout suggestions', 
      error: error.message 
    });
  }
};

// Get nutrition advice from AI coach
export const getNutritionAdvice = async (req, res) => {
  try {
    const { fitnessGoals, dietaryRestrictions, currentDiet } = req.body;
    const userId = req.user.userId; // Set by auth middleware

    // Construct the prompt
    const prompt = `
    ${SYSTEM_PROMPT}
    
    As a fitness nutrition expert, please provide personalized nutrition advice with the following details:
    
    Fitness Goals: ${fitnessGoals || 'Not specified'}
    Dietary Restrictions: ${dietaryRestrictions || 'None mentioned'}
    Current Diet: ${currentDiet || 'Not specified'}
    
    Please include:
    1. Recommended macronutrient breakdown
    2. Meal timing suggestions
    3. Sample meal ideas
    4. Hydration recommendations
    5. Supplement suggestions (if appropriate)
    `;

    // Initialize the model with gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate response
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return res.status(200).json({ nutritionPlan: response });
  } catch (error) {
    console.error('Error getting nutrition advice:', error);
    return res.status(500).json({ 
      message: 'Failed to get nutrition advice', 
      error: error.message 
    });
  }
};
