import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Built-in exercise library data
const EXERCISE_LIBRARY = [
  // Chest
  { name: 'Bench Press', category: 'Chest', muscleGroup: 'Pectorals', equipment: 'Barbell', difficulty: 'Intermediate', description: 'Classic compound chest exercise', instructions: 'Lie on bench, lower bar to chest, press up', icon: 'dumbbell' },
  { name: 'Push-ups', category: 'Chest', muscleGroup: 'Pectorals', equipment: 'Bodyweight', difficulty: 'Beginner', description: 'Bodyweight chest exercise', instructions: 'Lower body to ground, push back up', icon: 'dumbbell' },
  { name: 'Incline Dumbbell Press', category: 'Chest', muscleGroup: 'Upper Pectorals', equipment: 'Dumbbell', difficulty: 'Intermediate', description: 'Targets upper chest', instructions: 'Press dumbbells up on incline bench', icon: 'dumbbell' },
  { name: 'Chest Fly', category: 'Chest', muscleGroup: 'Pectorals', equipment: 'Dumbbell', difficulty: 'Beginner', description: 'Isolation chest exercise', instructions: 'Open arms wide, squeeze chest together', icon: 'dumbbell' },

  // Back
  { name: 'Pull-ups', category: 'Back', muscleGroup: 'Lats', equipment: 'Bodyweight', difficulty: 'Advanced', description: 'Compound back exercise', instructions: 'Pull body up to bar', icon: 'dumbbell' },
  { name: 'Deadlift', category: 'Back', muscleGroup: 'Full Back', equipment: 'Barbell', difficulty: 'Advanced', description: 'King of all lifts', instructions: 'Lift barbell from ground with straight back', icon: 'dumbbell' },
  { name: 'Bent Over Row', category: 'Back', muscleGroup: 'Lats', equipment: 'Barbell', difficulty: 'Intermediate', description: 'Compound rowing movement', instructions: 'Row bar to lower chest', icon: 'dumbbell' },
  { name: 'Lat Pulldown', category: 'Back', muscleGroup: 'Lats', equipment: 'Cable', difficulty: 'Beginner', description: 'Cable back exercise', instructions: 'Pull bar down to upper chest', icon: 'dumbbell' },

  // Legs
  { name: 'Squat', category: 'Legs', muscleGroup: 'Quadriceps', equipment: 'Barbell', difficulty: 'Intermediate', description: 'Fundamental leg builder', instructions: 'Lower hips, keep chest up, drive through heels', icon: 'dumbbell' },
  { name: 'Lunges', category: 'Legs', muscleGroup: 'Quadriceps', equipment: 'Bodyweight', difficulty: 'Beginner', description: 'Unilateral leg exercise', instructions: 'Step forward, lower back knee', icon: 'dumbbell' },
  { name: 'Leg Press', category: 'Legs', muscleGroup: 'Quadriceps', equipment: 'Machine', difficulty: 'Beginner', description: 'Machine leg exercise', instructions: 'Press platform away with feet', icon: 'dumbbell' },
  { name: 'Calf Raises', category: 'Legs', muscleGroup: 'Calves', equipment: 'Bodyweight', difficulty: 'Beginner', description: 'Calf isolation', instructions: 'Rise onto toes, lower slowly', icon: 'dumbbell' },
  { name: 'Romanian Deadlift', category: 'Legs', muscleGroup: 'Hamstrings', equipment: 'Barbell', difficulty: 'Intermediate', description: 'Hamstring focused deadlift', instructions: 'Hinge at hips, keep legs slightly bent', icon: 'dumbbell' },

  // Shoulders
  { name: 'Overhead Press', category: 'Shoulders', muscleGroup: 'Deltoids', equipment: 'Barbell', difficulty: 'Intermediate', description: 'Compound shoulder exercise', instructions: 'Press bar overhead from shoulders', icon: 'dumbbell' },
  { name: 'Lateral Raises', category: 'Shoulders', muscleGroup: 'Side Delts', equipment: 'Dumbbell', difficulty: 'Beginner', description: 'Side delt isolation', instructions: 'Raise dumbbells out to sides', icon: 'dumbbell' },
  { name: 'Face Pulls', category: 'Shoulders', muscleGroup: 'Rear Delts', equipment: 'Cable', difficulty: 'Beginner', description: 'Rear delt and upper back', instructions: 'Pull rope to face, elbows high', icon: 'dumbbell' },

  // Arms
  { name: 'Bicep Curls', category: 'Arms', muscleGroup: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', description: 'Bicep isolation', instructions: 'Curl dumbbells up, squeeze bicep', icon: 'dumbbell' },
  { name: 'Tricep Dips', category: 'Arms', muscleGroup: 'Triceps', equipment: 'Bodyweight', difficulty: 'Intermediate', description: 'Compound tricep exercise', instructions: 'Lower body on parallel bars', icon: 'dumbbell' },
  { name: 'Hammer Curls', category: 'Arms', muscleGroup: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', description: 'Brachialis focused curl', instructions: 'Curl with neutral grip', icon: 'dumbbell' },
  { name: 'Tricep Pushdown', category: 'Arms', muscleGroup: 'Triceps', equipment: 'Cable', difficulty: 'Beginner', description: 'Tricep isolation', instructions: 'Push cable down, keep elbows tucked', icon: 'dumbbell' },

  // Core
  { name: 'Plank', category: 'Core', muscleGroup: 'Abs', equipment: 'Bodyweight', difficulty: 'Beginner', description: 'Core stability exercise', instructions: 'Hold straight body position on forearms', icon: 'dumbbell' },
  { name: 'Crunches', category: 'Core', muscleGroup: 'Abs', equipment: 'Bodyweight', difficulty: 'Beginner', description: 'Ab isolation', instructions: 'Curl shoulders toward hips', icon: 'dumbbell' },
  { name: 'Russian Twists', category: 'Core', muscleGroup: 'Obliques', equipment: 'Bodyweight', difficulty: 'Beginner', description: 'Oblique exercise', instructions: 'Twist torso side to side', icon: 'dumbbell' },
  { name: 'Leg Raises', category: 'Core', muscleGroup: 'Lower Abs', equipment: 'Bodyweight', difficulty: 'Intermediate', description: 'Lower ab focus', instructions: 'Raise legs up while lying down', icon: 'dumbbell' },

  // Cardio
  { name: 'Running', category: 'Cardio', muscleGroup: 'Full Body', equipment: 'None', difficulty: 'Beginner', description: 'Cardiovascular exercise', instructions: 'Run at steady or varied pace', icon: 'activity' },
  { name: 'Cycling', category: 'Cardio', muscleGroup: 'Legs', equipment: 'Bike', difficulty: 'Beginner', description: 'Low impact cardio', instructions: 'Pedal at steady cadence', icon: 'activity' },
  { name: 'Jump Rope', category: 'Cardio', muscleGroup: 'Full Body', equipment: 'Rope', difficulty: 'Beginner', description: 'High intensity cardio', instructions: 'Jump over rope continuously', icon: 'activity' },
  { name: 'Rowing', category: 'Cardio', muscleGroup: 'Full Body', equipment: 'Rower', difficulty: 'Intermediate', description: 'Full body cardio', instructions: 'Drive legs, pull arms, reverse', icon: 'activity' },
]

async function ensureSeedData() {
  const count = await db.exercise.count()
  if (count === 0) {
    await db.exercise.createMany({
      data: EXERCISE_LIBRARY.map((e) => ({ ...e, isCustom: false })),
    })
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureSeedData()
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (category && category !== 'all') {
      where.category = category
    }
    if (search) {
      where.name = { contains: search }
    }

    const exercises = await db.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(exercises)
  } catch (error) {
    console.error('Failed to fetch exercises:', error)
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const exercise = await db.exercise.create({
      data: {
        name: body.name,
        category: body.category || 'Full Body',
        muscleGroup: body.muscleGroup || '',
        equipment: body.equipment || null,
        difficulty: body.difficulty || 'Beginner',
        description: body.description || null,
        instructions: body.instructions || null,
        icon: body.icon || 'dumbbell',
        isCustom: true,
      },
    })
    return NextResponse.json(exercise, { status: 201 })
  } catch (error) {
    console.error('Failed to create exercise:', error)
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    )
  }
}
