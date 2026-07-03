'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Clock,
  Trash2,
  Calendar,
  Check,
  TrendingUp,
  History,
} from 'lucide-react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CompletedWorkout } from '@/lib/types/app'

interface WorkoutHistoryProps {
  history: CompletedWorkout[]
  onDelete: (id: string) => void
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  if (m >= 60) {
    const h = Math.floor(m / 60)
    const remM = m % 60
    return `${h}h ${remM}m`
  }
  return `${m}m ${s}s`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) {
    return d.toLocaleDateString('en-US', { weekday: 'long' })
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: diffDays > 365 ? 'numeric' : undefined,
  })
}

export function WorkoutHistory({ history, onDelete }: WorkoutHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <History className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No workouts yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          Complete your first workout from the Plan tab to see it here with full
          stats and history.
        </p>
      </div>
    )
  }

  // Compute summary stats
  const totalWorkouts = history.length
  const totalDuration = history.reduce((sum, w) => sum + w.durationSec, 0)
  const totalSets = history.reduce((sum, w) => sum + w.totalSetsCompleted, 0)
  const avgDuration = Math.round(totalDuration / totalWorkouts)

  // This week's workouts
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const thisWeek = history.filter(
    (w) => new Date(w.date) >= weekStart
  ).length

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2">
        <SummaryStat
          icon={Dumbbell}
          value={totalWorkouts.toString()}
          label="Total"
          color="emerald"
        />
        <SummaryStat
          icon={Clock}
          value={formatDuration(totalDuration)}
          label="Time"
          color="teal"
        />
        <SummaryStat
          icon={Check}
          value={totalSets.toString()}
          label="Sets"
          color="orange"
        />
        <SummaryStat
          icon={TrendingUp}
          value={thisWeek.toString()}
          label="This Week"
          color="amber"
        />
      </div>

      {/* History list */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
          Recent Sessions
        </h2>
        <div className="space-y-2">
          <AnimatePresence>
            {history.map((w, idx) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              >
                <HistoryCard workout={w} onDelete={() => onDelete(w.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

function SummaryStat({
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
    <div className="rounded-xl border border-border/60 bg-card p-2.5 text-center">
      <div className={cn('inline-flex h-7 w-7 items-center justify-center rounded-lg mb-1', colorMap[color])}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="text-sm font-bold leading-tight">{value}</div>
      <div className="text-[9px] text-muted-foreground">{label}</div>
    </div>
  )
}

function HistoryCard({
  workout,
  onDelete,
}: {
  workout: CompletedWorkout
  onDelete: () => void
}) {
  const completionPct =
    workout.totalSetsTarget > 0
      ? Math.round((workout.totalSetsCompleted / workout.totalSetsTarget) * 100)
      : 0

  const exercisesCompleted = workout.exercises.filter(
    (e) => e.setsCompleted > 0
  ).length

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{workout.planDay}</p>
              <p className="text-xs text-muted-foreground truncate">
                {workout.focus}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(workout.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(workout.durationSec)}
                </span>
                <span className="flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  {workout.totalSetsCompleted}/{workout.totalSetsTarget} sets
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] font-medium',
                completionPct === 100
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              )}
            >
              {completionPct}%
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Exercises done summary */}
        {exercisesCompleted > 0 && (
          <div className="mt-2.5 pt-2.5 border-t border-border/40 flex flex-wrap gap-1">
            {workout.exercises
              .filter((e) => e.setsCompleted > 0)
              .slice(0, 4)
              .map((e, i) => (
                <Badge key={i} variant="secondary" className="text-[9px] font-normal">
                  {e.name} ({e.setsCompleted}/{e.targetSets})
                </Badge>
              ))}
            {exercisesCompleted > 4 && (
              <Badge variant="secondary" className="text-[9px] font-normal">
                +{exercisesCompleted - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
