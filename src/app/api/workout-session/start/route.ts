import { NextResponse } from 'next/server';
import { getWorkoutPlanById, startWorkoutSession } from '@/lib/store';
import type { WorkoutPlan } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      workoutPlanId?: string;
      dayIndex?: number;
    };

    if (!body.workoutPlanId || typeof body.dayIndex !== 'number') {
      return NextResponse.json({ message: 'workoutPlanId and dayIndex are required' }, { status: 400 });
    }

    const plan = (await getWorkoutPlanById(body.workoutPlanId)) as WorkoutPlan | null;
    if (!plan) {
      return NextResponse.json({ message: 'Workout plan not found' }, { status: 404 });
    }

    const day = plan.weeklyPlan[body.dayIndex];
    if (!day) {
      return NextResponse.json({ message: 'Workout day not found' }, { status: 404 });
    }

    const isRest = day.focus === 'Rest' || day.focus === 'Recovery';
    if (isRest) {
      return NextResponse.json({ message: 'Only training workouts can be started' }, { status: 400 });
    }

    const activeWorkoutSession = await startWorkoutSession({
      userId: plan.userId,
      workoutPlanId: plan.id,
      dayIndex: body.dayIndex,
      day: day.day,
      focus: day.focus,
      durationMinutes: day.durationMinutes,
    });

    return NextResponse.json({ activeWorkoutSession });
  } catch (error) {
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode || 500)
        : 500;
    const message = error instanceof Error ? error.message : 'Failed to start workout session';
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
