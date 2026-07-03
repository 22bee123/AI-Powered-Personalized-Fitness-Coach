import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)

    const workouts = await db.workout.findMany({
      include: { exerciseLogs: true },
      orderBy: { date: 'asc' },
    })

    const thisWeekWorkouts = workouts.filter(
      (w) => new Date(w.date) >= startOfWeek
    )
    const lastWeekWorkouts = workouts.filter((w) => {
      const d = new Date(w.date)
      return d >= startOfLastWeek && d < startOfWeek
    })

    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0)
    const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0)
    const totalVolume = workouts.reduce(
      (sum, w) =>
        sum +
        w.exerciseLogs.reduce(
          (s, l) => s + l.sets * l.reps * l.weight,
          0
        ),
      0
    )

    const thisWeekVolume = thisWeekWorkouts.reduce(
      (sum, w) =>
        sum +
        w.exerciseLogs.reduce((s, l) => s + l.sets * l.reps * l.weight, 0),
      0
    )
    const lastWeekVolume = lastWeekWorkouts.reduce(
      (sum, w) =>
        sum +
        w.exerciseLogs.reduce((s, l) => s + l.sets * l.reps * l.weight, 0),
      0
    )

    // Build last 7 days activity array
    const last7Days: { date: string; label: string; workouts: number; volume: number; duration: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(now.getDate() - i)
      day.setHours(0, 0, 0, 0)
      const nextDay = new Date(day)
      nextDay.setDate(day.getDate() + 1)

      const dayWorkouts = workouts.filter((w) => {
        const wd = new Date(w.date)
        return wd >= day && wd < nextDay
      })

      last7Days.push({
        date: day.toISOString(),
        label: day.toLocaleDateString('en-US', { weekday: 'short' }),
        workouts: dayWorkouts.length,
        volume: dayWorkouts.reduce(
          (sum, w) =>
            sum +
            w.exerciseLogs.reduce((s, l) => s + l.sets * l.reps * l.weight, 0),
          0
        ),
        duration: dayWorkouts.reduce((sum, w) => sum + w.duration, 0),
      })
    }

    // Category distribution
    const categoryMap: Record<string, number> = {}
    workouts.forEach((w) => {
      categoryMap[w.category] = (categoryMap[w.category] || 0) + 1
    })
    const categoryDistribution = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }))

    // Muscle group focus (from exercise logs)
    const muscleMap: Record<string, number> = {}
    for (const w of workouts) {
      for (const log of w.exerciseLogs) {
        const ex = log
        // exercise is not included here; we need a separate query
        void ex
      }
    }

    const exercises = await db.exercise.findMany()
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]))
    for (const w of workouts) {
      for (const log of w.exerciseLogs) {
        const ex = exerciseMap.get(log.exerciseId)
        if (ex) {
          muscleMap[ex.category] = (muscleMap[ex.category] || 0) + log.sets
        }
      }
    }
    const muscleFocus = Object.entries(muscleMap)
      .map(([name, sets]) => ({ name, sets }))
      .sort((a, b) => b.sets - a.sets)
      .slice(0, 6)

    // Current streak (consecutive days with workouts, ending today or yesterday)
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const workoutDates = new Set(
      workouts.map((w) => {
        const d = new Date(w.date)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
      })
    )
    let cursor = new Date(today)
    // If no workout today, allow streak to continue from yesterday
    if (!workoutDates.has(cursor.getTime())) {
      cursor.setDate(cursor.getDate() - 1)
    }
    while (workoutDates.has(cursor.getTime())) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    }

    // Weekly volume trend (last 8 weeks)
    const weeklyVolume: { week: string; volume: number }[] = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() - i * 7)
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const weekWorkouts = workouts.filter((w) => {
        const d = new Date(w.date)
        return d >= weekStart && d < weekEnd
      })
      const vol = weekWorkouts.reduce(
        (sum, w) =>
          sum +
          w.exerciseLogs.reduce((s, l) => s + l.sets * l.reps * l.weight, 0),
        0
      )
      weeklyVolume.push({
        week: `W${8 - i}`,
        volume: Math.round(vol),
      })
    }

    const volumeChange =
      lastWeekVolume > 0
        ? ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100
        : thisWeekVolume > 0
          ? 100
          : 0

    return NextResponse.json({
      totals: {
        workouts: workouts.length,
        thisWeekWorkouts: thisWeekWorkouts.length,
        lastWeekWorkouts: lastWeekWorkouts.length,
        totalDuration,
        totalCalories,
        totalVolume: Math.round(totalVolume),
        thisWeekVolume: Math.round(thisWeekVolume),
        streak,
      },
      last7Days,
      categoryDistribution,
      muscleFocus,
      weeklyVolume,
      volumeChange: Math.round(volumeChange),
    })
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
