import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are FlexAI, an expert personal fitness coach inside a workout tracking app called "PulseFit".
You give concise, motivating, and science-based fitness advice.

Your style:
- Friendly and energetic, like a supportive trainer
- Use short paragraphs and bullet points where helpful
- Reference the user's actual workout data when provided
- Suggest concrete, actionable next steps
- Use emoji sparingly (1-2 per response max) to add energy
- Keep responses under 200 words unless asked for detail
- If asked about injuries or medical issues, advise consulting a professional

Always be encouraging and focus on progress over perfection. The user is on a fitness journey and you are their guide.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userMessage = body.message as string

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Gather context about user's recent activity
    const recentWorkouts = await db.workout.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { exerciseLogs: { include: { exercise: true } } },
    })

    const totalWorkouts = await db.workout.count()
    const goals = await db.goal.findMany({ take: 5 })

    const context = {
      totalWorkouts,
      recentWorkouts: recentWorkouts.map((w) => ({
        name: w.name,
        category: w.category,
        date: w.date,
        duration: w.duration,
        calories: w.calories,
        exercises: w.exerciseLogs.map((l) => ({
          name: l.exercise.name,
          sets: l.sets,
          reps: l.reps,
          weight: l.weight,
        })),
      })),
      goals: goals.map((g) => ({
        title: g.title,
        target: g.target,
        current: g.current,
        unit: g.unit,
        completed: g.completed,
      })),
    }

    const contextString = `User's fitness context (recent activity):\n${JSON.stringify(context, null, 2)}`

    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'system', content: contextString },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    })

    const response =
      completion.choices[0]?.message?.content ||
      "I'm here to help with your fitness journey! What would you like to know?"

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Coach API error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get coaching advice',
        response:
          "I'm having trouble connecting right now. Please try again in a moment!",
      },
      { status: 500 }
    )
  }
}
