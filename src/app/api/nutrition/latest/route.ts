import { NextResponse } from 'next/server';
import { getLatestNutritionPlan } from '@/lib/store';

export const runtime = 'nodejs';

export async function GET() {
  const nutritionPlan = await getLatestNutritionPlan();

  if (!nutritionPlan) {
    return NextResponse.json({ message: 'No nutrition plan found' }, { status: 404 });
  }

  return NextResponse.json({ nutritionPlan });
}

