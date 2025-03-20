import WorkoutPlan from '../model/workout.model.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to generate system prompt based on difficulty
const generateSystemPrompt = (difficulty) => {
  return `You are an expert fitness coach. Create a detailed 7-day workout plan for a ${difficulty} difficulty level. 
  
  For each day, include:
  1. Day of the week
  2. Focus area (e.g., Upper Body, Lower Body, Core, Rest Day)
  3. Duration (in minutes)
  4. List of 4-6 specific exercises with sets and reps
  5. Brief warm-up and cool-down instructions
  
  Format your response as a structured JSON object with the following format:
  {
    "monday": {
      "focus": "string",
      "duration": "string (e.g., '45 min')",
      "exercises": [
        {"name": "string", "sets": number, "reps": "string"},
        ...
      ],
      "warmup": "string",
      "cooldown": "string"
    },
    "tuesday": {...},
    ...
    "sunday": {...}
  }
  
  Adjust the intensity based on the ${difficulty} difficulty level:
  - Easy: Beginner-friendly exercises, lower intensity, more rest days
  - Medium: Moderate intensity, balanced workout schedule
  - Hard: Challenging exercises, high intensity, minimal rest days
  
  IMPORTANT: Do not include any explanatory text outside the JSON structure. Do not wrap the JSON in markdown code blocks. Return only valid JSON that can be directly parsed.`;
};

// Generate a workout plan using Gemini AI
export const generateWorkoutPlan = async (req, res) => {
  try {
    const { difficulty } = req.body;
    const userId = req.user.id;

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ message: 'Invalid difficulty level. Must be easy, medium, or hard.' });
    }

    // Generate workout plan using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = generateSystemPrompt(difficulty);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the JSON response
    let weeklyPlan;
    try {
      // Clean the response text to handle markdown code blocks
      let cleanedText = text;
      
      // Remove markdown code block formatting if present
      if (text.includes('```json')) {
        cleanedText = text.replace(/```json\s*/, '').replace(/\s*```\s*$/, '');
      } else if (text.includes('```')) {
        cleanedText = text.replace(/```\s*/, '').replace(/\s*```\s*$/, '');
      }
      
      weeklyPlan = JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      console.error('Raw response:', text);
      return res.status(500).json({ message: 'Failed to generate workout plan. Please try again.' });
    }

    // Save the workout plan to the database
    const workoutPlan = new WorkoutPlan({
      userId,
      difficulty,
      weeklyPlan
    });

    await workoutPlan.save();

    res.status(201).json({
      message: 'Workout plan generated successfully',
      workoutPlan
    });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get the user's latest workout plan
export const getLatestWorkoutPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const workoutPlan = await WorkoutPlan.findOne({ userId })
      .sort({ createdAt: -1 });
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'No workout plan found' });
    }
    
    res.status(200).json({ workoutPlan });
  } catch (error) {
    console.error('Error fetching workout plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all workout plans for a user
export const getAllWorkoutPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const workoutPlans = await WorkoutPlan.find({ userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({ workoutPlans });
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a workout plan
export const deleteWorkoutPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const workoutPlan = await WorkoutPlan.findOne({ _id: id, userId });
    
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Workout plan not found' });
    }
    
    await WorkoutPlan.deleteOne({ _id: id });
    
    res.status(200).json({ message: 'Workout plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
};