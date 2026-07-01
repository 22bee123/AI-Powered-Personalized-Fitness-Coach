import { NextResponse } from 'next/server';
import { endWorkoutSession } from '@/lib/store';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { sessionId?: string };
    const activeWorkoutSession = await endWorkoutSession(body.sessionId);

    if (!activeWorkoutSession) {
      return NextResponse.json({ message: 'No active workout session found' }, { status: 404 });
    }

    return NextResponse.json({ activeWorkoutSession });
  } catch (error) {
    const statusCode =
      typeof error === 'object' && error !== null && 'statusCode' in error
        ? Number((error as { statusCode?: number }).statusCode || 500)
        : 500;
    const message = error instanceof Error ? error.message : 'Failed to end workout session';
    return NextResponse.json({ message }, { status: statusCode || 500 });
  }
}
