export interface Profile {
  name: string;
  email: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  fitnessLevel: string;
  goal: string;
  workoutDaysPerWeek: string;
  preferredWorkoutDuration: string;
  equipmentAccess: string;
}

export interface UserData {
  name?: string;
  email?: string;
  age?: string | number;
  gender?: string;
  height?: string | number;
  weight?: string | number;
  fitnessLevel?: string;
  fitnessGoals?: string[];
  healthConditions?: string[];
  preferredWorkoutDuration?: string;
  workoutDaysPerWeek?: string;
  equipmentAccess?: string;
  focusAreas?: string[];
  difficulty?: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  durationMinutes: number;
  warmup: string[];
  exercises: WorkoutExercise[];
  cooldown: string[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  title: string;
  difficulty: string;
  createdAt: string;
  weeklyPlan: WorkoutDay[];
  notes: string[];
}

export interface Meal {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: string[];
}

export interface NutritionPlan {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: Meal[];
  tips: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface WorkoutCompletion {
  id: string;
  userId: string;
  workoutPlanId: string;
  dayIndex?: number;
  day: string;
  focus: string;
  totalDuration: number;
  exercisesCompleted: number;
  completedAt: string;
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId: string;
  dayIndex: number;
  day: string;
  focus: string;
  durationMinutes: number;
  startedAt: string;
}

export interface StoreData {
  profile: Profile;
  workoutPlans: WorkoutPlan[];
  nutritionPlans: NutritionPlan[];
  chatHistory: ChatMessage[];
  completedWorkouts: WorkoutCompletion[];
  activeWorkoutSession: WorkoutSession | null;
}
