import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const metrics = await db.bodyMetric.findMany({
      orderBy: { date: 'asc' },
    })
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Failed to fetch body metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch body metrics' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const metric = await db.bodyMetric.create({
      data: {
        date: body.date ? new Date(body.date) : new Date(),
        weight: body.weight ? parseFloat(body.weight) : null,
        bodyFat: body.bodyFat ? parseFloat(body.bodyFat) : null,
        muscleMass: body.muscleMass ? parseFloat(body.muscleMass) : null,
        notes: body.notes || null,
      },
    })
    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error('Failed to create body metric:', error)
    return NextResponse.json(
      { error: 'Failed to create body metric' },
      { status: 500 }
    )
  }
}
