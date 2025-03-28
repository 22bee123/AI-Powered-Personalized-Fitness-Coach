export interface Exercise {
  _id: string;
  exerciseName: string;
  sets: number;
  reps: string;
  completed: boolean;
  duration: number;
}

export interface Workout {
  _id: string;
  userId: string;
  workoutPlanId: string;
  day: string;
  focus: string;
  startTime: string;
  endTime?: string;
  totalDuration: number;
  completed: boolean;
  exercises: Exercise[];
  warmupCompleted: boolean;
  cooldownCompleted: boolean;
}

export interface WorkoutPlan {
  _id: string;
  userId: string;
  difficulty: string;
  weeklyPlan: {
    [key: string]: {
      focus: string;
      duration: string;
      exercises: {
        name: string;
        sets: number;
        reps: string;
      }[];
      warmup: string;
      cooldown: string;
      isCompleted: boolean;
    };
  };
  createdAt: string;
}

export interface StartWorkoutProps {
  setActiveTab?: (tab: string) => void;
}

// Utility function to format time in HH:MM:SS format
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}; 