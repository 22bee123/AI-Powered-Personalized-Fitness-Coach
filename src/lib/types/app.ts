// Core domain types for the AI fitness app

export type Gender = 'male' | 'female' | 'other'

export type FitnessGoal =
  | 'lose_weight'
  | 'build_muscle'
  | 'improve_endurance'
  | 'general_fitness'
  | 'flexibility'

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'athlete'

export type DietPreference =
  | 'no_preference'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'paleo'
  | 'halal'
  | 'kosher'
  | 'gluten_free'

export interface UserProfile {
  name: string
  age: number
  gender: Gender
  heightCm: number
  weightKg: number
  goal: FitnessGoal
  activityLevel: ActivityLevel
  workoutDaysPerWeek: number
  dietPreference: DietPreference
  allergies?: string
  createdAt: string
}

export interface WorkoutExercise {
  name: string
  sets: number
  reps: string
  rest: string
  notes?: string
}

export interface WorkoutSession {
  day: string
  focus: string
  durationMin: number
  exercises: WorkoutExercise[]
}

export interface WorkoutPlan {
  summary: string
  daysPerWeek: number
  weeklySplit: string
  sessions: WorkoutSession[]
  warmupTip: string
  tips: string[]
  generatedAt: string
}

export interface MealPlan {
  name: string
  time: string
  calories: number
  items: string[]
  notes?: string
}

export interface NutritionPlan {
  summary: string
  dailyCalories: number
  proteinG: number
  carbsG: number
  fatsG: number
  waterLiters: number
  meals: MealPlan[]
  foods: string[]
  avoid: string[]
  tips: string[]
  generatedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// Completed workout session (history record)
export interface CompletedExercise {
  name: string
  setsCompleted: number
  targetSets: number
  reps: string
  rest: string
}

export interface CompletedWorkout {
  id: string
  date: string // ISO timestamp when completed
  startedAt: string // ISO timestamp when started
  planDay: string // e.g., "Day 1 - Monday"
  focus: string // e.g., "Upper Body Push"
  durationSec: number // total active duration in seconds
  exercises: CompletedExercise[]
  totalSetsCompleted: number
  totalSetsTarget: number
}

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  lose_weight: 'Lose Weight',
  build_muscle: 'Build Muscle',
  improve_endurance: 'Improve Endurance',
  general_fitness: 'General Fitness',
  flexibility: 'Flexibility & Mobility',
}

export const GOAL_DESCRIPTIONS: Record<FitnessGoal, string> = {
  lose_weight: 'Burn fat and achieve a leaner physique',
  build_muscle: 'Gain muscle mass and strength',
  improve_endurance: 'Boost stamina and cardiovascular health',
  general_fitness: 'Stay active and feel great overall',
  flexibility: 'Improve mobility and reduce stiffness',
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little to no exercise)',
  lightly_active: 'Lightly Active (1-3 days/week)',
  moderately_active: 'Moderately Active (3-5 days/week)',
  very_active: 'Very Active (6-7 days/week)',
  athlete: 'Athlete (2x per day)',
}

export const DIET_LABELS: Record<DietPreference, string> = {
  no_preference: 'No preference',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  keto: 'Keto',
  paleo: 'Paleo',
  halal: 'Halal',
  kosher: 'Kosher',
  gluten_free: 'Gluten-free',
}
