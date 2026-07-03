'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dumbbell,
  Flame,
  Clock,
  TrendingUp,
  Calendar,
  Plus,
  Zap,
  Trophy,
  ChevronRight,
  Activity,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts'
import type { Stats, Workout } from '@/lib/types/fitness'

interface DashboardProps {
  onNavigate: (tab: 'workouts' | 'exercises' | 'progress' | 'goals' | 'coach') => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then((r) => r.json()),
      fetch('/api/workouts?limit=5').then((r) => r.json()),
    ])
      .then(([s, w]) => {
        setStats(s)
        setRecentWorkouts(w)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading || !stats) {
    return <DashboardSkeleton />
  }

  const weeklyGoal = 5
  const weeklyProgress = Math.min((stats.totals.thisWeekWorkouts / weeklyGoal) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/20"
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -right-6 -bottom-12 h-32 w-32 rounded-full bg-orange-400/30 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-orange-300" />
            <span className="text-sm font-medium text-emerald-50/90">
              {greetingTimeOfDay()}! Ready to move?
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
            {stats.totals.streak > 0
              ? `${stats.totals.streak}-day streak! Keep it up 🔥`
              : 'Let\u2019s start a new streak today'}
          </h1>
          <p className="text-emerald-50/90 text-sm max-w-md mb-4">
            You\u2019ve logged{' '}
            <span className="font-bold text-white">
              {stats.totals.thisWeekWorkouts}
            </span>{' '}
            workout{stats.totals.thisWeekWorkouts !== 1 && 's'} this week and moved{' '}
            <span className="font-bold text-white">
              {formatNumber(stats.totals.thisWeekVolume)} kg
            </span>{' '}
            of iron.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onNavigate('workouts')}
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold"
            >
              <Plus className="h-4 w-4 mr-1" />
              Log Workout
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate('coach')}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
            >
              <Activity className="h-4 w-4 mr-1" />
              Ask Coach
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Dumbbell}
          label="Total Workouts"
          value={stats.totals.workouts.toString()}
          sublabel={`${stats.totals.thisWeekWorkouts} this week`}
          color="emerald"
          delay={0.05}
        />
        <StatCard
          icon={Clock}
          label="Total Time"
          value={formatDuration(stats.totals.totalDuration)}
          sublabel="minutes trained"
          color="teal"
          delay={0.1}
        />
        <StatCard
          icon={Flame}
          label="Calories Burned"
          value={formatNumber(stats.totals.totalCalories)}
          sublabel="kcal"
          color="orange"
          delay={0.15}
        />
        <StatCard
          icon={TrendingUp}
          label="Volume Lifted"
          value={`${formatNumber(stats.totals.totalVolume)} kg`}
          sublabel={`${stats.volumeChange >= 0 ? '+' : ''}${stats.volumeChange}% vs last week`}
          color="amber"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Weekly activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Weekly Activity</CardTitle>
                <CardDescription>Workouts over the last 7 days</CardDescription>
              </div>
              <Badge variant="secondary" className="font-medium">
                <Calendar className="h-3 w-3 mr-1" />
                This Week
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 155)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: 'oklch(0.5 0.02 160)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'oklch(0.5 0.02 160)' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.9 0.01 155)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'workouts') return [`${value} workout${value !== 1 ? 's' : ''}`, 'Workouts']
                    return [value, name]
                  }}
                />
                <Bar
                  dataKey="workouts"
                  fill="oklch(0.62 0.17 155)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly goal progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Weekly Goal
            </CardTitle>
            <CardDescription>Target: {weeklyGoal} workouts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {stats.totals.thisWeekWorkouts}
                  <span className="text-base text-muted-foreground font-normal">
                    /{weeklyGoal}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">workouts logged</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-500">
                  {Math.round(weeklyProgress)}%
                </div>
                <p className="text-xs text-muted-foreground">complete</p>
              </div>
            </div>
            <Progress value={weeklyProgress} className="h-2.5" />
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onNavigate('goals')}
            >
              View All Goals
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent workouts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Workouts</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('workouts')}
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentWorkouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Dumbbell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No workouts yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Log your first workout to see it here
                </p>
                <Button size="sm" onClick={() => onNavigate('workouts')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Start Workout
                </Button>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
                {recentWorkouts.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${categoryColor(w.category)}`}>
                        <Dumbbell className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{w.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(w.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {' · '}
                          {w.exerciseLogs.length} exercise{w.exerciseLogs.length !== 1 && 's'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-sm font-semibold">{w.duration}m</p>
                        <p className="text-[10px] text-muted-foreground">
                          {w.calories} kcal
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Volume trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Volume Trend</CardTitle>
            <CardDescription>Last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={stats.weeklyVolume} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 55)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 55)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 155)" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.9 0.01 155)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                  formatter={(value: number) => [`${formatNumber(value)} kg`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="oklch(0.7 0.18 55)"
                  strokeWidth={2.5}
                  fill="url(#volGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
  delay,
}: {
  icon: typeof Dumbbell
  label: string
  value: string
  sublabel: string
  color: 'emerald' | 'teal' | 'orange' | 'amber'
  delay: number
}) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[color]}`}>
              <Icon className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{value}</div>
          <div className="text-xs font-medium text-muted-foreground mt-0.5">{label}</div>
          <div className="text-[11px] text-muted-foreground/80 mt-1">{sublabel}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-48 rounded-2xl bg-muted animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-72 rounded-xl bg-muted animate-pulse" />
        <div className="h-72 rounded-xl bg-muted animate-pulse" />
      </div>
    </div>
  )
}

function greetingTimeOfDay() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}

function formatDuration(min: number) {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m}m`
}

function categoryColor(category: string) {
  const map: Record<string, string> = {
    Strength: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    Cardio: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    Flexibility: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    Sports: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  }
  return map[category] || 'bg-muted text-muted-foreground'
}
