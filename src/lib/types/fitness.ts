export interface Exercise {
  id: string
  name: string
  category: string
  muscleGroup: string
  equipment: string | null
  difficulty: string
  description: string | null
  instructions: string | null
  icon: string | null
  isCustom: boolean
}

export interface ExerciseLog {
  id: string
  workoutId: string
  exerciseId: string
  exercise: Exercise
  sets: number
  reps: number
  weight: number
  restSeconds: number
  notes: string | null
}

export interface Workout {
  id: string
  name: string
  date: string
  duration: number
  notes: string | null
  category: string
  calories: number
  exerciseLogs: ExerciseLog[]
}

export interface Goal {
  id: string
  title: string
  type: string
  target: number
  current: number
  unit: string
  deadline: string | null
  completed: boolean
  createdAt: string
}

export interface BodyMetric {
  id: string
  date: string
  weight: number | null
  bodyFat: number | null
  muscleMass: number | null
  notes: string | null
}

export interface WorkoutPlan {
  id: string
  name: string
  category: string
  duration: number
  calories: number
  description: string
  exercises: { name: string; sets: number; reps: number; weight: number }[]
}

export interface Stats {
  totals: {
    workouts: number
    thisWeekWorkouts: number
    lastWeekWorkouts: number
    totalDuration: number
    totalCalories: number
    totalVolume: number
    thisWeekVolume: number
    streak: number
  }
  last7Days: {
    date: string
    label: string
    workouts: number
    volume: number
    duration: number
  }[]
  categoryDistribution: { name: string; value: number }[]
  muscleFocus: { name: string; sets: number }[]
  weeklyVolume: { week: string; volume: number }[]
  volumeChange: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
