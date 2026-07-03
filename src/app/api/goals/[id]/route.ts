import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const target = body.current !== undefined ? parseFloat(body.current) : undefined
    const completed =
      body.completed !== undefined ? Boolean(body.completed) : undefined

    const goal = await db.goal.update({
      where: { id },
      data: {
        ...(target !== undefined ? { current: target } : {}),
        ...(completed !== undefined ? { completed } : {}),
      },
    })
    return NextResponse.json(goal)
  } catch (error) {
    console.error('Failed to update goal:', error)
    return NextResponse.json(
      { error: 'Failed to update goal' },
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
    await db.goal.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete goal:', error)
    return NextResponse.json(
      { error: 'Failed to delete goal' },
      { status: 500 }
    )
  }
}
