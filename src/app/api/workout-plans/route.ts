import { NextResponse } from 'next/server'

// Predefined workout templates
const WORKOUT_PLANS = [
  {
    id: 'push-day',
    name: 'Push Day',
    category: 'Strength',
    duration: 60,
    calories: 400,
    description: 'Chest, shoulders, and triceps focused workout',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8, weight: 60 },
      { name: 'Overhead Press', sets: 4, reps: 8, weight: 40 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 20 },
      { name: 'Lateral Raises', sets: 3, reps: 12, weight: 8 },
      { name: 'Tricep Pushdown', sets: 3, reps: 12, weight: 25 },
    ],
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    category: 'Strength',
    duration: 60,
    calories: 380,
    description: 'Back and biceps focused workout',
    exercises: [
      { name: 'Deadlift', sets: 4, reps: 5, weight: 80 },
      { name: 'Pull-ups', sets: 4, reps: 8, weight: 0 },
      { name: 'Bent Over Row', sets: 3, reps: 10, weight: 50 },
      { name: 'Lat Pulldown', sets: 3, reps: 12, weight: 45 },
      { name: 'Bicep Curls', sets: 3, reps: 12, weight: 12 },
    ],
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    category: 'Strength',
    duration: 65,
    calories: 450,
    description: 'Complete lower body workout',
    exercises: [
      { name: 'Squat', sets: 4, reps: 8, weight: 80 },
      { name: 'Romanian Deadlift', sets: 4, reps: 10, weight: 60 },
      { name: 'Leg Press', sets: 3, reps: 12, weight: 100 },
      { name: 'Lunges', sets: 3, reps: 12, weight: 0 },
      { name: 'Calf Raises', sets: 4, reps: 15, weight: 0 },
    ],
  },
  {
    id: 'upper-body',
    name: 'Upper Body Blast',
    category: 'Strength',
    duration: 55,
    calories: 350,
    description: 'Full upper body session',
    exercises: [
      { name: 'Bench Press', sets: 3, reps: 10, weight: 50 },
      { name: 'Bent Over Row', sets: 3, reps: 10, weight: 45 },
      { name: 'Overhead Press', sets: 3, reps: 10, weight: 35 },
      { name: 'Pull-ups', sets: 3, reps: 8, weight: 0 },
      { name: 'Bicep Curls', sets: 3, reps: 12, weight: 10 },
      { name: 'Tricep Dips', sets: 3, reps: 10, weight: 0 },
    ],
  },
  {
    id: 'core-blast',
    name: 'Core Blast',
    category: 'Strength',
    duration: 30,
    calories: 200,
    description: 'Intense core focused session',
    exercises: [
      { name: 'Plank', sets: 3, reps: 60, weight: 0 },
      { name: 'Crunches', sets: 3, reps: 20, weight: 0 },
      { name: 'Russian Twists', sets: 3, reps: 20, weight: 0 },
      { name: 'Leg Raises', sets: 3, reps: 15, weight: 0 },
    ],
  },
  {
    id: 'hiit-cardio',
    name: 'HIIT Cardio',
    category: 'Cardio',
    duration: 25,
    calories: 300,
    description: 'High intensity interval training',
    exercises: [
      { name: 'Jump Rope', sets: 5, reps: 60, weight: 0 },
      { name: 'Push-ups', sets: 5, reps: 15, weight: 0 },
      { name: 'Lunges', sets: 5, reps: 20, weight: 0 },
      { name: 'Plank', sets: 5, reps: 45, weight: 0 },
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body Workout',
    category: 'Strength',
    duration: 70,
    calories: 500,
    description: 'Complete full body session',
    exercises: [
      { name: 'Squat', sets: 3, reps: 10, weight: 60 },
      { name: 'Bench Press', sets: 3, reps: 10, weight: 50 },
      { name: 'Bent Over Row', sets: 3, reps: 10, weight: 45 },
      { name: 'Overhead Press', sets: 3, reps: 10, weight: 35 },
      { name: 'Deadlift', sets: 3, reps: 5, weight: 70 },
      { name: 'Plank', sets: 3, reps: 45, weight: 0 },
    ],
  },
  {
    id: 'morning-cardio',
    name: 'Morning Cardio',
    category: 'Cardio',
    duration: 30,
    calories: 280,
    description: 'Energizing morning cardio',
    exercises: [
      { name: 'Running', sets: 1, reps: 1, weight: 0 },
      { name: 'Jump Rope', sets: 3, reps: 60, weight: 0 },
    ],
  },
]

export async function GET() {
  return NextResponse.json(WORKOUT_PLANS)
}
