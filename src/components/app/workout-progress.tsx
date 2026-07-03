'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts'
import {
  Dumbbell,
  Clock,
  Flame,
  TrendingUp,
  Calendar,
  Target,
  Award,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { CompletedWorkout, UserProfile } from '@/lib/types/app'

interface WorkoutProgressProps {
  history: CompletedWorkout[]
  profile: UserProfile | null
}

function formatDurationMin(sec: number): string {
  const m = Math.floor(sec / 60)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const remM = m % 60
    return `${h}h ${remM}m`
  }
  return `${m}m`
}

export function WorkoutProgress({ history, profile }: WorkoutProgressProps) {
  const stats = useMemo(() => computeStats(history), [history])

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No progress data yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Complete a few workouts to unlock progress charts, trends, and insights
          about your training.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCard
          icon={Dumbbell}
          value={stats.totalWorkouts.toString()}
          label="Total Workouts"
          color="emerald"
        />
        <StatCard
          icon={Clock}
          value={formatDurationMin(stats.totalDurationSec)}
          label="Total Time"
          color="teal"
        />
        <StatCard
          icon={Flame}
          value={stats.currentStreak.toString()}
          label="Day Streak"
          color="orange"
        />
        <StatCard
          icon={Target}
          value={`${stats.avgCompletion}%`}
          label="Avg Completion"
          color="amber"
        />
      </div>

      {/* Weekly goal progress */}
      {profile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold">Weekly Goal</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.thisWeek} / {profile.workoutDaysPerWeek} workouts
              </span>
            </div>
            <Progress
              value={Math.min((stats.thisWeek / profile.workoutDaysPerWeek) * 100, 100)}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.thisWeek >= profile.workoutDaysPerWeek
                ? '🎉 Goal achieved this week! Amazing work!'
                : `${profile.workoutDaysPerWeek - stats.thisWeek} more workout${profile.workoutDaysPerWeek - stats.thisWeek !== 1 ? 's' : ''} to hit your weekly target`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Last 14 days activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Activity (Last 14 Days)
          </CardTitle>
          <CardDescription>Workouts per day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={stats.last14Days}
              margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.92 0.01 155)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'oklch(0.5 0.02 160)' }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: 'oklch(1 0 0)',
                  border: '1px solid oklch(0.9 0.01 155)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
                formatter={(value: number) => [
                  `${value} workout${value !== 1 ? 's' : ''}`,
                  'Workouts',
                ]}
              />
              <Bar
                dataKey="workouts"
                fill="oklch(0.62 0.17 155)"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Duration trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Duration Trend
          </CardTitle>
          <CardDescription>Minutes per workout over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={stats.durationTrend}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="durGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.18 55)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.7 0.18 55)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(0.92 0.01 155)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'oklch(0.5 0.02 160)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  background: 'oklch(1 0 0)',
                  border: '1px solid oklch(0.9 0.01 155)',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                }}
                formatter={(value: number) => [`${value} min`, 'Duration']}
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="oklch(0.7 0.18 55)"
                strokeWidth={2.5}
                fill="url(#durGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-emerald-500/5 border-emerald-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 shrink-0">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Your Insights</p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {stats.insights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Dumbbell
  value: string
  label: string
  color: 'emerald' | 'teal' | 'orange' | 'amber'
}) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardContent className="p-3">
          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg mb-1.5 ${colorMap[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-lg font-bold leading-tight">{value}</div>
          <div className="text-[10px] text-muted-foreground">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface ProgressStats {
  totalWorkouts: number
  totalDurationSec: number
  totalSets: number
  currentStreak: number
  avgCompletion: number
  thisWeek: number
  last14Days: { label: string; date: string; workouts: number }[]
  durationTrend: { label: string; minutes: number }[]
  insights: string[]
}

function computeStats(history: CompletedWorkout[]): ProgressStats {
  const now = new Date()
  const totalWorkouts = history.length
  const totalDurationSec = history.reduce((s, w) => s + w.durationSec, 0)
  const totalSets = history.reduce((s, w) => s + w.totalSetsCompleted, 0)

  // Average completion
  const avgCompletion =
    totalWorkouts > 0
      ? Math.round(
          history.reduce(
            (s, w) =>
              s +
              (w.totalSetsTarget > 0
                ? (w.totalSetsCompleted / w.totalSetsTarget) * 100
                : 0),
            0
          ) / totalWorkouts
        )
      : 0

  // This week
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const thisWeek = history.filter((w) => new Date(w.date) >= weekStart).length

  // Current streak (consecutive days with at least one workout, ending today or yesterday)
  let currentStreak = 0
  const workoutDays = new Set(
    history.map((w) => {
      const d = new Date(w.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  let cursor = new Date(today)
  if (!workoutDays.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (workoutDays.has(cursor.getTime())) {
    currentStreak++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Last 14 days bar chart
  const last14Days: { label: string; date: string; workouts: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    day.setHours(0, 0, 0, 0)
    const nextDay = new Date(day)
    nextDay.setDate(day.getDate() + 1)

    const count = history.filter((w) => {
      const d = new Date(w.date)
      return d >= day && d < nextDay
    }).length

    last14Days.push({
      label: day.toLocaleDateString('en-US', { weekday: 'narrow' }),
      date: day.toISOString(),
      workouts: count,
    })
  }

  // Duration trend (last 10 workouts, oldest first)
  const recent = [...history].slice(0, 10).reverse()
  const durationTrend = recent.map((w, i) => ({
    label: `#${i + 1}`,
    minutes: Math.round(w.durationSec / 60),
  }))

  // Insights
  const insights: string[] = []
  if (totalWorkouts > 0) {
    const avgDur = Math.round(totalDurationSec / totalWorkouts / 60)
    insights.push(
      `Your average workout is ${avgDur} minutes across ${totalWorkouts} session${totalWorkouts !== 1 ? 's' : ''}.`
    )
  }
  if (currentStreak > 0) {
    insights.push(
      `🔥 You're on a ${currentStreak}-day streak. Keep it going!`
    )
  } else if (totalWorkouts > 0) {
    insights.push('Start a new streak today — consistency is key to results!')
  }
  if (avgCompletion >= 90) {
    insights.push(
      `Excellent completion rate at ${avgCompletion}% — you're crushing your sets!`
    )
  } else if (avgCompletion < 60 && totalWorkouts > 1) {
    insights.push(
      `Tip: Your completion is ${avgCompletion}%. Consider adjusting your plan to fewer sets if needed.`
    )
  }
  if (thisWeek > 0) {
    insights.push(
      `${thisWeek} workout${thisWeek !== 1 ? 's' : ''} logged this week. ${totalSets} total sets completed.`
    )
  }

  return {
    totalWorkouts,
    totalDurationSec,
    totalSets,
    currentStreak,
    avgCompletion,
    thisWeek,
    last14Days,
    durationTrend,
    insights,
  }
}
