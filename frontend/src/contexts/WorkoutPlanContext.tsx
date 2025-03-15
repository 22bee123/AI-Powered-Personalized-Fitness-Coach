import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define interfaces for workout plan data
interface Exercise {
  name: string;
  sets?: number;
  reps?: string | number;
  rest?: string;
  duration?: string;
  instructions?: string;
  muscleGroup?: string;
}

interface Workout {
  type: string;
  description: string;
}

interface ScheduleItem {
  day: string;
  workouts: Workout[];
}

interface DailyWorkout {
  day: string;
  focus: string;
  description: string;
  workoutType: string;
  exercises: Exercise[];
  isRestDay: boolean;
}

interface WorkoutPlan {
  _id?: string;
  name: string;
  difficulty: string;
  schedule: ScheduleItem[];
  weekSchedule?: {
    Monday: DailyWorkout;
    Tuesday: DailyWorkout;
    Wednesday: DailyWorkout;
    Thursday: DailyWorkout;
    Friday: DailyWorkout;
    Saturday: DailyWorkout;
    Sunday: DailyWorkout;
  };
}

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

  // Mock user ID - in a real app, this would come from authentication
  const userId = "user123";

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:3000/api/fitness-coach/user-workout-plans/${userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch workout plans: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.plans && data.plans.length > 0) {
          setWorkoutPlans(data.plans);
          
          // Set the first plan as active by default
          setActivePlan(data.plans[0]);
        } else {
          console.log('No workout plans found');
        }
      } catch (error) {
        console.error('Error fetching workout plans:', error);
        setError('Failed to load workout plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutPlans();
  }, [userId]);

  return (
    <WorkoutPlanContext.Provider value={{ workoutPlans, activePlan, setActivePlan, loading, error }}>
      {children}
    </WorkoutPlanContext.Provider>
  );
};

export const useWorkoutPlan = (): WorkoutPlanContextType => {
  const context = useContext(WorkoutPlanContext);
  if (context === undefined) {
    throw new Error('useWorkoutPlan must be used within a WorkoutPlanProvider');
  }
  return context;
};
