import api from './api';

// Interface for user form data
export interface UserFormData {
  age: string;
  gender: string;
  height: string;
  weight: string;
  fitnessLevel: string;
  fitnessGoals: string[];
  healthConditions: string[];
  preferredWorkoutDuration: string;
  workoutDaysPerWeek: string;
  equipmentAccess: string;
  focusAreas: string[];
  difficulty: string;
}

// Generate both workout and nutrition plans
export const generatePlans = async (userData: UserFormData) => {
  try {
    // Generate both plans in parallel
    const [workoutResponse, nutritionResponse] = await Promise.all([
      api.post('/workouts/generate', { 
        difficulty: userData.difficulty,
        userData
      }),
      api.post('/nutrition/generate', { 
        userData
      })
    ]);
    
    return {
      workoutPlan: workoutResponse.data.workoutPlan,
      nutritionPlan: nutritionResponse.data.nutritionPlan
    };
  } catch (error) {
    console.error('Error generating plans:', error);
    throw error;
  }
};

// Generate only a workout plan
export const generateWorkoutPlan = async (userData: UserFormData) => {
  try {
    const response = await api.post('/workouts/generate', { 
      difficulty: userData.difficulty,
      userData
    });
    return response.data.workoutPlan;
  } catch (error) {
    console.error('Error generating workout plan:', error);
    throw error;
  }
};

// Generate only a nutrition plan
export const generateNutritionPlan = async (userData: UserFormData) => {
  try {
    const response = await api.post('/nutrition/generate', { 
      userData
    });
    return response.data.nutritionPlan;
  } catch (error) {
    console.error('Error generating nutrition plan:', error);
    throw error;
  }
};
