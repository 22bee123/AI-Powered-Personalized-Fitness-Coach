import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';

// Define interfaces for nutrition plan data
interface Meal {
  name: string;
  description?: string;
  calories?: string;
  protein?: string;
  carbs?: string;
  fats?: string;
  ingredients?: string[];
  instructions?: string;
  timeOfDay: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface DailyNutrition {
  day: string;
  meals: Meal[];
  totalCalories?: string;
  totalProtein?: string;
  totalCarbs?: string;
  totalFats?: string;
  waterIntake?: string;
  notes?: string;
}

interface NutritionPlan {
  _id?: string;
  userId: string;
  name: string;
  workoutPlanId?: string;
  userDetails?: {
    age: string;
    gender: string;
    weight: string;
    height: string;
    goals: string;
    preferences: string;
    limitations: string;
    allergies: string;
    dietaryRestrictions: string;
  };
  rawPlan?: string;
  weekSchedule: {
    [key: string]: DailyNutrition;
  };
  guidelines: string[];
  hydration: string[];
  supplements: string[];
  createdAt?: string;
  updatedAt?: string;
  isFavorite?: boolean;
  isActive?: boolean;
}

interface NutritionPlanContextType {
  nutritionPlans: NutritionPlan[];
  activePlan: NutritionPlan | null;
  setActivePlan: (plan: NutritionPlan) => void;
  loading: boolean;
  error: string | null;
  fetchUserNutritionPlans: (userId?: string) => Promise<void>;
  fetchNutritionPlansByWorkout: (workoutPlanId: string) => Promise<void>;
}

const NutritionPlanContext = createContext<NutritionPlanContextType | undefined>(undefined);

// Create a default nutrition plan for when no plans exist
const createDefaultNutritionPlan = (userId: string): NutritionPlan => {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const weekSchedule: { [key: string]: DailyNutrition } = {};
  
  weekdays.forEach(day => {
    weekSchedule[day] = {
      day,
      meals: [
        {
          name: 'Breakfast',
          description: 'Healthy breakfast option',
          calories: '400-500',
          protein: '20-30g',
          carbs: '40-50g',
          fats: '15-20g',
          timeOfDay: 'breakfast'
        },
        {
          name: 'Lunch',
          description: 'Balanced lunch option',
          calories: '500-600',
          protein: '30-40g',
          carbs: '50-60g',
          fats: '15-20g',
          timeOfDay: 'lunch'
        },
        {
          name: 'Dinner',
          description: 'Nutritious dinner option',
          calories: '400-500',
          protein: '25-35g',
          carbs: '30-40g',
          fats: '10-15g',
          timeOfDay: 'dinner'
        },
        {
          name: 'Snack',
          description: 'Healthy snack option',
          calories: '150-200',
          protein: '10-15g',
          carbs: '15-20g',
          fats: '5-10g',
          timeOfDay: 'snack'
        }
      ]
    };
  });
  
  return {
    userId,
    name: 'Default Nutrition Plan',
    weekSchedule,
    guidelines: [
      'Stay hydrated throughout the day',
      'Aim for balanced macronutrients in each meal',
      'Include a variety of fruits and vegetables',
      'Limit processed foods and added sugars'
    ],
    hydration: [
      'Drink at least 8 glasses of water daily',
      'Increase water intake during workouts',
      'Consider electrolyte drinks for intense training'
    ],
    supplements: [
      'Protein powder for muscle recovery',
      'Multivitamin for overall health',
      'Omega-3 for joint health and inflammation'
    ]
  };
};

export const NutritionPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([]);
  const [activePlan, setActivePlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/fitness-coach';

  const fetchUserNutritionPlans = async (userId?: string) => {
    // Don't fetch if Clerk hasn't loaded yet or user isn't signed in
    if (!isLoaded || !isSignedIn || !user) {
      console.log('User not authenticated, skipping nutrition plan fetch');
      setLoading(false);
      return;
    }
    
    // Use the provided userId or default to the authenticated user's ID
    const clerkId = userId || user.id;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`NutritionPlanContext: Fetching nutrition plans for user: ${clerkId}`);
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/user-nutrition-plans/${clerkId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch nutrition plans: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('NutritionPlanContext: Nutrition plans data received:', {
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'not an array',
        data: data
      });
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('NutritionPlanContext: Setting nutrition plans from API data');
        setNutritionPlans(data);
        setActivePlan(data[0]);
      } else {
        // If no plans exist, create a default one
        console.log('NutritionPlanContext: No nutrition plans found, creating default plan');
        const defaultPlan = createDefaultNutritionPlan(clerkId);
        setNutritionPlans([defaultPlan]);
        setActivePlan(defaultPlan);
      }
    } catch (error) {
      console.error('NutritionPlanContext: Error fetching nutrition plans:', error);
      
      // If there's an error, still create a default plan
      console.log('NutritionPlanContext: Error occurred, creating default plan');
      const defaultPlan = createDefaultNutritionPlan(clerkId);
      setNutritionPlans([defaultPlan]);
      setActivePlan(defaultPlan);
      
      setError('Failed to load nutrition plans from server. Using default plan instead.');
    } finally {
      console.log('NutritionPlanContext: Setting loading to false');
      setLoading(false);
    }
  };

  const fetchNutritionPlansByWorkout = async (workoutPlanId: string) => {
    if (!isLoaded || !isSignedIn || !user) {
      console.log('User not authenticated, skipping nutrition plan fetch by workout');
      return;
    }
    
    if (!workoutPlanId) {
      console.error('Workout Plan ID is required to fetch related nutrition plans');
      setError('Workout Plan ID is required to fetch related nutrition plans');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching nutrition plans for workout plan: ${workoutPlanId}`);
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/workout-nutrition-plans/${workoutPlanId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch nutrition plans: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        setNutritionPlans(data);
        setActivePlan(data[0]);
      } else {
        // If no plans exist for this workout, use the default one
        const defaultPlan = createDefaultNutritionPlan(user.id);
        defaultPlan.workoutPlanId = workoutPlanId;
        setNutritionPlans([defaultPlan]);
        setActivePlan(defaultPlan);
      }
    } catch (error) {
      console.error('Error fetching nutrition plans by workout:', error);
      setError('Failed to load nutrition plans for this workout');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of nutrition plans when the component mounts
  useEffect(() => {
    console.log('NutritionPlanContext: Initial fetch of nutrition plans');
    if (isLoaded && isSignedIn && user) {
      fetchUserNutritionPlans();
    }
  }, [isLoaded, isSignedIn, user]);

  return (
    <NutritionPlanContext.Provider value={{
      nutritionPlans,
      activePlan,
      setActivePlan,
      loading,
      error,
      fetchUserNutritionPlans,
      fetchNutritionPlansByWorkout
    }}>
      {children}
    </NutritionPlanContext.Provider>
  );
};

export const useNutritionPlan = (): NutritionPlanContextType => {
  const context = useContext(NutritionPlanContext);
  if (context === undefined) {
    throw new Error('useNutritionPlan must be used within a NutritionPlanProvider');
  }
  return context;
};
