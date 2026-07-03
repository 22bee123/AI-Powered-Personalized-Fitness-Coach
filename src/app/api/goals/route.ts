import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const goals = await db.goal.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(goals)
  } catch (error) {
    console.error('Failed to fetch goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const goal = await db.goal.create({
      data: {
        title: body.title,
        type: body.type || 'Workouts',
        target: parseFloat(body.target),
        current: parseFloat(body.current || 0),
        unit: body.unit || 'workouts',
        deadline: body.deadline ? new Date(body.deadline) : null,
        completed: false,
      },
    })
    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Failed to create goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}
