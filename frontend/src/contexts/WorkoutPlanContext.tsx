import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';

// Define types for workout plan data
interface Exercise {
  name: string;
  sets?: number;
  reps?: string | number;
  rest?: string;
  duration?: string;
  instructions?: string;
  muscleGroup?: string;
}

interface DailyWorkout {
  day: string;
  focus: string;
  description?: string;
  workoutType?: string;
  exercises: Exercise[];
  isRestDay: boolean;
}

interface ScheduleDay {
  day: string;
  workouts: {
    type: string;
    description: string;
  }[];
}

interface ParsedScheduleItem {
  day: string;
  activities: string;
  exercises: Exercise[];
}

interface WorkoutPlan {
  _id?: string;
  name: string;
  difficulty: string;
  userDetails?: {
    age: string;
    gender: string;
    weight: string;
    height: string;
    goals: string;
    preferences: string;
    limitations: string;
  };
  rawPlan?: string;
  schedule: ScheduleDay[];
  exercises: Exercise[];
  warmup?: {
    name: string;
    duration?: string;
    reps?: string;
  }[];
  cooldown?: {
    name: string;
    duration: string;
  }[];
  nutrition?: string[];
  recovery?: string[];
  createdAt?: string;
  isFavorite?: boolean;
  parsedSchedule?: ParsedScheduleItem[];
  weekSchedule?: {
    [key: string]: DailyWorkout;
  };
}

// Define the context type
interface WorkoutPlanContextType {
  workoutPlans: WorkoutPlan[];
  activePlan: WorkoutPlan | null;
  setActivePlan: (plan: WorkoutPlan) => void;
  loading: boolean;
  error: string | null;
}

const WorkoutPlanContext = createContext<WorkoutPlanContextType | undefined>(undefined);

export const WorkoutPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // API base URL
  const API_BASE_URL = 'http://localhost:3000/api/fitness-coach';

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      if (!user?.id) {
        console.log('No user ID available, skipping workout plan fetch');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching workout plans for user: ${user.id}`);
        const response = await fetch(`${API_BASE_URL}/user-workout-plans/${user.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch workout plans: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Workout plans data:', data);
        
        if (data.plans && data.plans.length > 0) {
          // Process each plan to ensure weekSchedule is properly parsed
          const processedPlans = data.plans.map((plan: WorkoutPlan) => {
            console.log('Processing plan:', plan.name);
            
            // Ensure weekSchedule is properly handled
            if (plan.weekSchedule) {
              console.log('Plan has weekSchedule:', Object.keys(plan.weekSchedule));
              
              // Make sure exercises array exists in each day's workout
              Object.keys(plan.weekSchedule).forEach(day => {
                if (plan.weekSchedule && plan.weekSchedule[day]) {
                  // Log exercises for each day
                  console.log(`Day ${day} has ${plan.weekSchedule[day].exercises?.length || 0} exercises`);
                  
                  // If exercises is undefined or null, initialize it as an empty array
                  if (!plan.weekSchedule[day].exercises) {
                    plan.weekSchedule[day].exercises = [];
                  }
                }
              });
            } else {
              console.log('Plan does not have weekSchedule');
            }
            return plan;
          });
          
          console.log('Setting workout plans:', processedPlans.length);
          setWorkoutPlans(processedPlans);
          
          // Set active plan if not already set and we're not in an update
          if (!activePlan && processedPlans.length > 0) {
            console.log('Setting active plan to:', processedPlans[0].name);
            setActivePlan(processedPlans[0]);
          }
        } else {
          console.log('No workout plans found');
          setWorkoutPlans([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        setError('Failed to fetch workout plans');
        setLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, [user?.id]); // Remove activePlan from dependency array to prevent infinite loops

  return (
    <WorkoutPlanContext.Provider value={{ workoutPlans, activePlan, setActivePlan, loading, error }}>
      {children}
    </WorkoutPlanContext.Provider>
  );
};

// Custom hook to use the workout plan context
export const useWorkoutPlan = () => {
  const context = useContext(WorkoutPlanContext);
  if (context === undefined) {
    throw new Error('useWorkoutPlan must be used within a WorkoutPlanProvider');
  }
  return context;
};
