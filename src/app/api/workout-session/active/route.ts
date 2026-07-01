import { NextResponse } from 'next/server';
import { getActiveWorkoutSession } from '@/lib/store';

export const runtime = 'nodejs';

export async function GET() {
  const activeWorkoutSession = await getActiveWorkoutSession();
  return NextResponse.json({ activeWorkoutSession });
}

