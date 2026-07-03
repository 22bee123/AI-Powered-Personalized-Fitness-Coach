import { NextRequest, NextResponse } from 'next/server'
import { deepseekJson } from '@/lib/deepseek'
import type {
  UserProfile,
  WorkoutPlan,
  NutritionPlan,
} from '@/lib/types/app'
import {
  GOAL_LABELS,
  ACTIVITY_LABELS,
  DIET_LABELS,
} from '@/lib/types/app'

export const runtime = 'nodejs'
export const maxDuration = 120

interface GenerateBody {
  profile: UserProfile
  planTypes: ('workout' | 'nutrition')[]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateBody
    if (!body?.profile) {
      return NextResponse.json(
        { error: 'Profile is required' },
        { status: 400 }
      )
    }

    const profile = body.profile
    const planTypes = body.planTypes || ['workout', 'nutrition']

    const profileContext = buildProfileContext(profile)

    const results: { workout?: WorkoutPlan; nutrition?: NutritionPlan } = {}

    // Generate plans in parallel for speed
    const tasks: Promise<void>[] = []

    if (planTypes.includes('workout')) {
      tasks.push(
        generateWorkoutPlan(profileContext).then((plan) => {
          if (plan) {
            results.workout = { ...plan, generatedAt: new Date().toISOString() }
          }
        })
      )
    }

    if (planTypes.includes('nutrition')) {
      tasks.push(
        generateNutritionPlan(profileContext).then((plan) => {
          if (plan) {
            results.nutrition = {
              ...plan,
              generatedAt: new Date().toISOString(),
            }
          }
        })
      )
    }

    await Promise.all(tasks)

    // Check for failures
    const failures: string[] = []
    if (planTypes.includes('workout') && !results.workout) {
      failures.push('workout')
    }
    if (planTypes.includes('nutrition') && !results.nutrition) {
      failures.push('nutrition')
    }

    if (failures.length === planTypes.length) {
      return NextResponse.json(
        { error: 'Failed to generate plans. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...results,
      partialFailure: failures.length > 0 ? failures : undefined,
    })
  } catch (err) {
    console.error('Generate plans error:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Failed to generate plans',
      },
      { status: 500 }
    )
  }
}

function buildProfileContext(p: UserProfile): string {
  const lines = [
    `Name: ${p.name}`,
    `Age: ${p.age}`,
    `Gender: ${p.gender}`,
    `Height: ${p.heightCm} cm`,
    `Weight: ${p.weightKg} kg`,
    `Primary Goal: ${GOAL_LABELS[p.goal]}`,
    `Activity Level: ${ACTIVITY_LABELS[p.activityLevel]}`,
    `Workout Days Per Week: ${p.workoutDaysPerWeek}`,
    `Diet Preference: ${DIET_LABELS[p.dietPreference]}`,
  ]
  if (p.allergies) lines.push(`Allergies/Restrictions: ${p.allergies}`)
  return lines.join('\n')
}

async function generateWorkoutPlan(
  profileContext: string
): Promise<Omit<WorkoutPlan, 'generatedAt'> | null> {
  const systemPrompt = `You are an elite certified personal trainer and exercise scientist with NASM, ACE, and CSCS certifications.
You create personalized, safe, and effective workout programs tailored to each individual.

Your programs are:
- Scientifically grounded (progressive overload, proper periodization)
- Specific to the person's goal, fitness level, and schedule
- Practical with clear instructions
- Safe with appropriate warm-ups and exercise selection

You MUST respond with valid JSON only, matching the exact schema requested.`

  const userPrompt = `Create a personalized workout program for this person:

${profileContext}

Return ONLY a JSON object with this exact schema:
{
  "summary": "2-3 sentence personalized overview of the program",
  "daysPerWeek": <number matching their available days>,
  "weeklySplit": "e.g. Push/Pull/Legs or Upper/Lower or Full Body",
  "sessions": [
    {
      "day": "Day 1 - e.g. Monday",
      "focus": "e.g. Upper Body Push",
      "durationMin": <number 30-90>,
      "exercises": [
        {
          "name": "Exercise name",
          "sets": <number>,
          "reps": "e.g. 8-12 or 30s",
          "rest": "e.g. 90s",
          "notes": "brief form cue or tip"
        }
      ]
    }
  ],
  "warmupTip": "A specific warm-up recommendation",
  "tips": ["3-5 actionable training tips specific to their goal"]
}

Rules:
- Provide exactly ${'<daysPerWeek>'} sessions matching the workout days requested
- Each session should have 4-7 exercises
- Include compound movements (squat, deadlift, press, row) appropriate to level
- Match exercise selection to their goal
- Ensure balanced muscle development across the week
- Be specific with sets, reps, and rest periods`

  const { data, error } = await deepseekJson<Omit<WorkoutPlan, 'generatedAt'>>(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.7
  )

  if (error || !data) {
    console.error('Workout plan generation failed:', error)
    return null
  }

  // Validate minimum structure
  if (!data.sessions || !Array.isArray(data.sessions) || data.sessions.length === 0) {
    console.error('Workout plan invalid: no sessions')
    return null
  }

  return data
}

async function generateNutritionPlan(
  profileContext: string
): Promise<Omit<NutritionPlan, 'generatedAt'> | null> {
  const systemPrompt = `You are a registered dietitian (RD) and sports nutritionist certified by the Academy of Nutrition and Dietetics.
You create personalized, evidence-based nutrition plans that are practical, sustainable, and tailored to each person's goals and preferences.

Your plans:
- Use evidence-based macro calculations (Mifflin-St Jeor for BMR, activity factor for TDEE)
- Adjust calories for the person's goal (deficit for weight loss, surplus for muscle gain)
- Respect dietary preferences and allergies
- Include whole, accessible foods
- Are realistic and sustainable

You MUST respond with valid JSON only, matching the exact schema requested.`

  const userPrompt = `Create a personalized daily nutrition plan for this person:

${profileContext}

Calculate their TDEE using the Mifflin-St Jeor equation, then adjust calories for their goal.
Distribute macros appropriately for their goal (e.g. higher protein for muscle gain, moderate deficit for weight loss).

Return ONLY a JSON object with this exact schema:
{
  "summary": "2-3 sentence personalized overview explaining the calorie and macro targets",
  "dailyCalories": <number, rounded to nearest 10>,
  "proteinG": <number>,
  "carbsG": <number>,
  "fatsG": <number>,
  "waterLiters": <number, e.g. 2.5 or 3.0>,
  "meals": [
    {
      "name": "Breakfast",
      "time": "e.g. 7:00 AM",
      "calories": <number>,
      "items": ["specific food item with portion", "another item"],
      "notes": "brief prep or substitution tip"
    }
  ],
  "foods": ["5-8 foods to emphasize for their goal"],
  "avoid": ["3-5 foods or habits to limit"],
  "tips": ["3-5 practical, actionable nutrition tips"]
}

Rules:
- Provide 4-5 meals/snacks (Breakfast, Lunch, Snack, Dinner, optional evening snack)
- Meal calories should sum to approximately dailyCalories
- All foods must respect their diet preference and allergies
- Be specific with portions (e.g. "150g grilled chicken breast")
- Make meals practical with accessible ingredients`

  const { data, error } = await deepseekJson<Omit<NutritionPlan, 'generatedAt'>>(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    0.7
  )

  if (error || !data) {
    console.error('Nutrition plan generation failed:', error)
    return null
  }

  // Validate minimum structure
  if (!data.meals || !Array.isArray(data.meals) || data.meals.length === 0) {
    console.error('Nutrition plan invalid: no meals')
    return null
  }

  return data
}
