import { NextResponse } from 'next/server';
import { getLatestWorkoutPlan } from '@/lib/store';

export const runtime = 'nodejs';

export async function GET() {
  const workoutPlan = await getLatestWorkoutPlan();

  if (!workoutPlan) {
    return NextResponse.json({ message: 'No workout plan found' }, { status: 404 });
  }

  return NextResponse.json({ workoutPlan });
}

