import { NextResponse } from 'next/server';
import { createNutritionPlan } from '@/lib/fitness';
import { addNutritionPlan } from '@/lib/store';
import type { UserData } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json()) as UserData;
  const nutritionPlan = createNutritionPlan(body);
  await addNutritionPlan(nutritionPlan);

  return NextResponse.json({ nutritionPlan });
}

