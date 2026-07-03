import { NextRequest, NextResponse } from 'next/server'
import { deepseekComplete } from '@/lib/deepseek'
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
export const maxDuration = 60

interface ChatBody {
  message: string
  history: { role: 'user' | 'assistant'; content: string }[]
  profile?: UserProfile | null
  workoutPlan?: WorkoutPlan | null
  nutritionPlan?: NutritionPlan | null
}

const SYSTEM_PROMPT = `You are FlexAI, an AI fitness coach inside the FitForge app. You are certified in personal training and sports nutrition.

Your personality:
- Warm, encouraging, and knowledgeable
- Concise but thorough — never ramble
- Uses practical, actionable advice
- Celebrates progress and motivates consistently
- Honest about what works and what doesn't

Your guidelines:
- Reference the user's profile, workout plan, and nutrition plan when relevant (you have access to this context)
- Give specific, personalized advice rather than generic platitudes
- Use short paragraphs and bullet points for readability
- Use 1-2 emoji max per response to add energy, not excess
- If asked about injuries or medical conditions, advise consulting a healthcare professional
- Keep responses under 250 words unless explicitly asked for detail
- Always end with an encouraging note or a clear next step

You are their coach, cheerleader, and knowledgeable guide on their fitness journey.`

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatBody

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Build context from the user's profile and plans
    const contextParts: string[] = []

    if (body.profile) {
      const p = body.profile
      contextParts.push(
        `USER PROFILE:\n` +
          `Name: ${p.name}\n` +
          `Age: ${p.age}, Gender: ${p.gender}\n` +
          `Height: ${p.heightCm}cm, Weight: ${p.weightKg}kg\n` +
          `Goal: ${GOAL_LABELS[p.goal]}\n` +
          `Activity: ${ACTIVITY_LABELS[p.activityLevel]}\n` +
          `Trains ${p.workoutDaysPerWeek} days/week\n` +
          `Diet: ${DIET_LABELS[p.dietPreference]}` +
          (p.allergies ? `\nAllergies: ${p.allergies}` : '')
      )
    }

    if (body.workoutPlan) {
      const w = body.workoutPlan
      contextParts.push(
        `USER'S WORKOUT PLAN (${w.daysPerWeek} days/week, ${w.weeklySplit}):\n` +
          w.sessions
            .map(
              (s) =>
                `- ${s.day} (${s.focus}, ${s.durationMin}min): ${s.exercises
                  .map((e) => `${e.name} ${e.sets}x${e.reps}`)
                  .join(', ')}`
            )
            .join('\n')
      )
    }

    if (body.nutritionPlan) {
      const n = body.nutritionPlan
      contextParts.push(
        `USER'S NUTRITION PLAN:\n` +
          `Daily: ${n.dailyCalories} kcal (P:${n.proteinG}g C:${n.carbsG}g F:${n.fatsG}g)\n` +
          `Meals: ${n.meals
            .map((m) => `${m.name} (${m.calories}kcal)`)
            .join(', ')}`
      )
    }

    const contextString =
      contextParts.length > 0
        ? `Here is the user's current fitness context. Use it to personalize your responses:\n\n${contextParts.join('\n\n')}`
        : 'No user profile or plan context available yet.'

    // Build message list
    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      { role: 'system' as const, content: contextString },
      // Include up to 10 most recent history messages for context
      ...body.history.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: body.message },
    ]

    const { content, error } = await deepseekComplete({
      messages,
      temperature: 0.8,
      maxTokens: 1024,
    })

    if (error || !content) {
      console.error('Chat error:', error)
      return NextResponse.json(
        {
          error: error || 'Failed to generate response',
          response:
            "I'm having trouble connecting right now. Could you try asking that again in a moment?",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ response: content })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        response:
          "Something went wrong on my end. Please try again in a moment!",
      },
      { status: 500 }
    )
  }
}
