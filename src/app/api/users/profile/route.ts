import { NextResponse } from 'next/server';
import { getProfile, updateProfile } from '@/lib/store';
import type { Profile } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET() {
  const profile = await getProfile();
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<Profile>;
  const profile = await updateProfile(body);
  return NextResponse.json({ profile });
}

