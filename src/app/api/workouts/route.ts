import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const recent = searchParams.get('recent') === 'true'

    const workouts = await db.workout.findMany({
      include: {
        exerciseLogs: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
      ...(recent ? { take: 5 } : {}),
    })
    return NextResponse.json(workouts)
  } catch (error) {
    console.error('Failed to fetch workouts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, date, duration, notes, category, calories, exerciseLogs } = body

    const workout = await db.workout.create({
      data: {
        name: name || 'Workout',
        date: date ? new Date(date) : new Date(),
        duration: duration || 0,
        notes: notes || null,
        category: category || 'Strength',
        calories: calories || 0,
        exerciseLogs: {
          create: (exerciseLogs || []).map((log: {
            exerciseId: string
            sets: number
            reps: number
            weight: number
            restSeconds?: number
            notes?: string
          }) => ({
            exerciseId: log.exerciseId,
            sets: log.sets || 3,
            reps: log.reps || 10,
            weight: log.weight || 0,
            restSeconds: log.restSeconds || 60,
            notes: log.notes || null,
          })),
        },
      },
      include: {
        exerciseLogs: {
          include: { exercise: true },
        },
      },
    })
    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    console.error('Failed to create workout:', error)
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    )
  }
}
