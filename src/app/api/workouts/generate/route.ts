import { NextResponse } from 'next/server';
import { createWorkoutPlan } from '@/lib/fitness';
import { addWorkoutPlan } from '@/lib/store';
import type { UserData } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as UserData;
  const workoutPlan = createWorkoutPlan(body);
  await addWorkoutPlan(workoutPlan);

  return NextResponse.json({ workoutPlan });
}

