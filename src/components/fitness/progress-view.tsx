'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Dumbbell,
  Flame,
  Scale,
  Plus,
  Activity,
  Clock,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { useToast } from '@/hooks/use-toast'
import type { Stats, BodyMetric } from '@/lib/types/fitness'

const PIE_COLORS = [
  'oklch(0.62 0.17 155)',
  'oklch(0.7 0.18 55)',
  'oklch(0.55 0.13 200)',
  'oklch(0.65 0.2 350)',
  'oklch(0.75 0.16 90)',
  'oklch(0.7 0.15 280)',
]

export function ProgressView() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [metrics, setMetrics] = useState<BodyMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [metricOpen, setMetricOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const [s, m] = await Promise.all([
          fetch('/api/stats').then((r) => r.json()),
          fetch('/api/body-metrics').then((r) => r.json()),
        ])
        if (!cancelled) {
          setStats(s)
          setMetrics(m)
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const handleAddMetric = async (data: {
    weight: string
    bodyFat: string
    muscleMass: string
    notes: string
  }) => {
    try {
      const res = await fetch('/api/body-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString(),
          ...data,
        }),
      })
      const created = await res.json()
      setMetrics((prev) => [...prev, created].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      setMetricOpen(false)
      toast({ title: 'Body metric recorded!', duration: 2000 })
    } catch {
      toast({ title: 'Failed to save metric', variant: 'destructive' })
    }
  }

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-72 bg-muted animate-pulse rounded-xl" />
          <div className="h-72 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    )
  }

  const weightData = metrics
    .filter((m) => m.weight !== null)
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight,
    }))

  const muscleData = metrics
    .filter((m) => m.muscleMass !== null)
    .map((m) => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      muscle: m.muscleMass,
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Progress</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analytics and trends across your training
          </p>
        </div>
        <Dialog open={metricOpen} onOpenChange={setMetricOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Log Body Metric
            </Button>
          </DialogTrigger>
          <MetricDialog onSubmit={handleAddMetric} />
        </Dialog>
      </div>

      {/* Top stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat
          icon={Dumbbell}
          label="Total Workouts"
          value={stats.totals.workouts.toString()}
          color="emerald"
        />
        <MiniStat
          icon={Clock}
          label="Training Time"
          value={`${Math.floor(stats.totals.totalDuration / 60)}h ${stats.totals.totalDuration % 60}m`}
          color="teal"
        />
        <MiniStat
          icon={Flame}
          label="Calories"
          value={formatNumber(stats.totals.totalCalories)}
          color="orange"
        />
        <MiniStat
          icon={Activity}
          label="Current Streak"
          value={`${stats.totals.streak}d`}
          color="amber"
        />
      </div>

      {/* Volume trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Weekly Volume Trend
          </CardTitle>
          <CardDescription>Total weight lifted per week (last 8 weeks)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.weeklyVolume} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="volArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.17 155)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.62 0.17 155)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 155)" vertical={false} />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 12, fill: 'oklch(0.5 0.02 160)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'oklch(0.5 0.02 160)' }}
                axisLine={false}
                tickLine={false}
                width={50}
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
                stroke="oklch(0.62 0.17 155)"
                strokeWidth={2.5}
                fill="url(#volArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Workout category distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workout Categories</CardTitle>
            <CardDescription>Distribution by type</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.categoryDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                No workout data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.categoryDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {stats.categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.9 0.01 155)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Muscle group focus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Muscle Group Focus</CardTitle>
            <CardDescription>Total sets per muscle group</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.muscleFocus.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                No exercise data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stats.muscleFocus}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 155)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'oklch(0.3 0.02 160)' }}
                    axisLine={false}
                    tickLine={false}
                    width={75}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'oklch(1 0 0)',
                      border: '1px solid oklch(0.9 0.01 155)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                    formatter={(value: number) => [`${value} sets`, 'Volume']}
                  />
                  <Bar
                    dataKey="sets"
                    fill="oklch(0.7 0.18 55)"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Body metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="h-4 w-4 text-amber-500" />
            Body Metrics
          </CardTitle>
          <CardDescription>
            {metrics.length > 0
              ? `${metrics.length} measurement${metrics.length !== 1 ? 's' : ''} recorded`
              : 'Log your weight and body composition over time'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <div className="text-center py-10">
              <div className="rounded-full bg-muted p-3 mb-3 inline-flex">
                <Scale className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">No body metrics logged</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Track weight, body fat, and muscle mass
              </p>
              <Button
                size="sm"
                onClick={() => setMetricOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add First Measurement
              </Button>
            </div>
          ) : weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={weightData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.75 0.16 90)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.75 0.16 90)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 155)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'oklch(0.5 0.02 160)' }}
                  axisLine={false}
                  tickLine={false}
                  width={45}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  contentStyle={{
                    background: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.9 0.01 155)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                  formatter={(value: number) => [`${value} kg`, 'Weight']}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="oklch(0.75 0.16 90)"
                  strokeWidth={2.5}
                  fill="url(#weightArea)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No weight data to display yet
            </div>
          )}

          {muscleData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/60">
              <p className="text-sm font-medium mb-2">Muscle Mass Trend</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={muscleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="muscleArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.17 155)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.62 0.17 155)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 155)" vertical={false} />
                  <XAxis
                    dataKey="date"
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
                    formatter={(value: number) => [`${value} kg`, 'Muscle']}
                  />
                  <Area
                    type="monotone"
                    dataKey="muscle"
                    stroke="oklch(0.62 0.17 155)"
                    strokeWidth={2.5}
                    fill="url(#muscleArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Dumbbell
  label: string
  value: string
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
        <CardContent className="p-4">
          <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg mb-2 ${colorMap[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MetricDialog({
  onSubmit,
}: {
  onSubmit: (data: {
    weight: string
    bodyFat: string
    muscleMass: string
    notes: string
  }) => void
}) {
  const [form, setForm] = useState({
    weight: '',
    bodyFat: '',
    muscleMass: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.weight && !form.bodyFat && !form.muscleMass) return
    onSubmit(form)
    setForm({ weight: '', bodyFat: '', muscleMass: '', notes: '' })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Log Body Metric</DialogTitle>
        <DialogDescription>
          Record today&apos;s body measurements. All fields are optional.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="m-weight">Weight (kg)</Label>
            <Input
              id="m-weight"
              type="number"
              step="0.1"
              placeholder="75.5"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="m-bf">Body Fat (%)</Label>
            <Input
              id="m-bf"
              type="number"
              step="0.1"
              placeholder="18.2"
              value={form.bodyFat}
              onChange={(e) => setForm({ ...form, bodyFat: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="m-mm">Muscle Mass (kg)</Label>
            <Input
              id="m-mm"
              type="number"
              step="0.1"
              placeholder="35.0"
              value={form.muscleMass}
              onChange={(e) => setForm({ ...form, muscleMass: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Save Measurement
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function formatNumber(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}
