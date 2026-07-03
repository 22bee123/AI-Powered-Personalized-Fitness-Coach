import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const workout = await db.workout.findUnique({
      where: { id },
      include: {
        exerciseLogs: {
          include: { exercise: true },
        },
      },
    })
    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }
    return NextResponse.json(workout)
  } catch (error) {
    console.error('Failed to fetch workout:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.workout.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete workout:', error)
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    )
  }
}
