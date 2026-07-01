import { NextResponse } from 'next/server';
import { addWorkoutCompletion, getCompletedWorkouts } from '@/lib/store';
import type { WorkoutCompletion } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  const completedWorkouts = await getCompletedWorkouts();
  return NextResponse.json({ completedWorkouts });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<WorkoutCompletion>;

  if (!body.workoutPlanId || !body.day || !body.focus) {
    return NextResponse.json({ message: 'workoutPlanId, day, and focus are required' }, { status: 400 });
  }

  const existing = (await getCompletedWorkouts()).find(
    (entry) =>
      entry.workoutPlanId === body.workoutPlanId &&
      ((typeof body.dayIndex === 'number' && entry.dayIndex === body.dayIndex) || entry.day === body.day)
  );

  if (existing) {
    return NextResponse.json({ message: 'This workout day is already completed' }, { status: 400 });
  }

  const completedWorkout: WorkoutCompletion = {
    id: `complete_${Date.now()}`,
    userId: body.userId || 'demo-user',
    workoutPlanId: body.workoutPlanId,
    dayIndex: body.dayIndex,
    day: body.day,
    focus: body.focus,
    totalDuration: body.totalDuration || 0,
    exercisesCompleted: body.exercisesCompleted || 0,
    completedAt: new Date().toISOString(),
  };

  await addWorkoutCompletion(completedWorkout);

  return NextResponse.json({ completedWorkout }, { status: 201 });
}
