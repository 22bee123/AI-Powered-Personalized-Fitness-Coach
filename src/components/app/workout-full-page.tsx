'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  Dumbbell,
  ListChecks,
  TrendingUp,
  Play,
  RefreshCw,
  Loader2,
  Sparkles,
  History,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { ActiveWorkout } from '@/components/app/active-workout'
import { WorkoutHistory } from '@/components/app/workout-history'
import { WorkoutProgress } from '@/components/app/workout-progress'
import { storage } from '@/lib/storage'
import type {
  UserProfile,
  WorkoutPlan,
  WorkoutSession,
  CompletedWorkout,
} from '@/lib/types/app'

type SubView = 'plan' | 'history' | 'progress'

interface WorkoutFullPageProps {
  profile: UserProfile
  plan: WorkoutPlan | null
  onBack: () => void
  onPlanUpdate: (plan: WorkoutPlan) => void
}

const SUB_VIEWS: { id: SubView; label: string; icon: typeof ListChecks }[] = [
  { id: 'plan', label: 'Plan', icon: ListChecks },
  { id: 'history', label: 'History', icon: History },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
]

export function WorkoutFullPage({
  profile,
  plan,
  onBack,
  onPlanUpdate,
}: WorkoutFullPageProps) {
  const [subView, setSubView] = useState<SubView>('plan')
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null)
  const [history, setHistory] = useState<CompletedWorkout[]>([])
  const [regenerating, setRegenerating] = useState(false)
  const { toast } = useToast()

  // Load history on mount
  useEffect(() => {
    setHistory(storage.getWorkoutHistory())
  }, [])

  const handleStartWorkout = (session: WorkoutSession) => {
    setActiveSession(session)
  }

  const handleWorkoutComplete = (workout: CompletedWorkout) => {
    storage.addWorkoutToHistory(workout)
    setHistory(storage.getWorkoutHistory())
    setActiveSession(null)
    setSubView('history')
    toast({
      title: 'Workout saved! 💪',
      description: `${workout.planDay} — great session!`,
      duration: 3000,
    })
  }

  const handleWorkoutExit = () => {
    setActiveSession(null)
  }

  const handleDeleteHistory = (id: string) => {
    storage.deleteWorkoutFromHistory(id)
    setHistory(storage.getWorkoutHistory())
    toast({ title: 'Workout removed', duration: 1500 })
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const res = await fetch('/api/generate-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, planTypes: ['workout'] }),
      })
      const data = await res.json()
      if (data.workout) {
        const newPlan = {
          ...data.workout,
          generatedAt: new Date().toISOString(),
        }
        onPlanUpdate(newPlan)
        toast({ title: 'Workout plan refreshed! 💪', duration: 2500 })
      } else {
        throw new Error(data.error || 'Failed to regenerate')
      }
    } catch (err) {
      toast({
        title: 'Regeneration failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setRegenerating(false)
    }
  }

  // Active workout mode — full screen, no header/tabs
  if (activeSession) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <ActiveWorkout
          session={activeSession}
          onExit={handleWorkoutExit}
          onComplete={handleWorkoutComplete}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with back button */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="flex h-14 items-center px-4 gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors -ml-1 px-1 py-1"
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Dumbbell className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-sm">Workout</span>
          </div>
          <div className="w-[60px]" />
        </div>

        {/* Sub-view tabs (only when plan exists) */}
        {plan && (
          <div className="flex items-center gap-1 px-4 pb-2">
            {SUB_VIEWS.map((v) => {
              const Icon = v.icon
              const active = subView === v.id
              return (
                <button
                  key={v.id}
                  onClick={() => setSubView(v.id)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {v.label}
                  {v.id === 'history' && history.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-0.5 h-4 px-1 text-[9px]"
                    >
                      {history.length}
                    </Badge>
                  )}
                  {active && (
                    <motion.div
                      layoutId="workoutSubTab"
                      className="absolute inset-0 -z-10 rounded-lg bg-emerald-500/10"
                      transition={{ type: 'spring', duration: 0.4 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={subView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* No plan state */}
              {!plan && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="rounded-full bg-emerald-500/10 p-5 mb-5">
                    <Dumbbell className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No workout plan yet</h2>
                  <p className="text-sm text-muted-foreground mb-5 max-w-sm">
                    Generate a personalized workout plan based on your profile to
                    start training.
                  </p>
                  <Button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {regenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Workout Plan
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Plan view */}
              {plan && subView === 'plan' && (
                <PlanView
                  plan={plan}
                  goalLabel={undefined}
                  onRegenerate={handleRegenerate}
                  regenerating={regenerating}
                  onStartWorkout={handleStartWorkout}
                />
              )}

              {/* History view */}
              {plan && subView === 'history' && (
                <WorkoutHistory history={history} onDelete={handleDeleteHistory} />
              )}

              {/* Progress view */}
              {plan && subView === 'progress' && (
                <WorkoutProgress history={history} profile={profile} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function PlanView({
  plan,
  onRegenerate,
  regenerating,
  onStartWorkout,
}: {
  plan: WorkoutPlan
  goalLabel: string | undefined
  onRegenerate: () => void
  regenerating: boolean
  onStartWorkout: (session: WorkoutSession) => void
}) {
  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-5 w-5" />
            <span className="text-sm font-medium text-emerald-50/90">
              Your Workout Program
            </span>
          </div>
          <h2 className="text-xl font-extrabold mb-2">{plan.weeklySplit}</h2>
          <p className="text-sm text-emerald-50/90 mb-3">{plan.summary}</p>
          <Badge className="bg-white/20 text-white border-0 hover:bg-white/20">
            {plan.daysPerWeek} days/week
          </Badge>
        </div>
      </div>

      {/* Sessions with start buttons */}
      <div className="space-y-3">
        {plan.sessions.map((session, idx) => (
          <SessionStartCard
            key={idx}
            session={session}
            index={idx}
            onStart={() => onStartWorkout(session)}
          />
        ))}
      </div>

      {/* Warmup tip */}
      {plan.warmupTip && (
        <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4 flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold mb-0.5">Warm-up</p>
            <p className="text-sm text-muted-foreground">{plan.warmupTip}</p>
          </div>
        </div>
      )}

      {/* Tips */}
      {plan.tips && plan.tips.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Training Tips
          </p>
          <ul className="space-y-1.5">
            {plan.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 text-[9px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Regenerate */}
      <Button
        variant="outline"
        onClick={onRegenerate}
        disabled={regenerating}
        className="w-full"
      >
        {regenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Regenerating...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Plan
          </>
        )}
      </Button>
    </div>
  )
}

function SessionStartCard({
  session,
  index,
  onStart,
}: {
  session: WorkoutSession
  index: number
  onStart: () => void
}) {
  const totalSets = session.exercises.reduce((sum, e) => sum + e.sets, 0)

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{session.day}</p>
              <p className="text-xs text-muted-foreground truncate">
                {session.focus}
              </p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                <span>{session.durationMin} min</span>
                <span>{session.exercises.length} exercises</span>
                <span>{totalSets} sets</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise preview (first 4) */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {session.exercises.slice(0, 4).map((ex, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] font-normal">
              {ex.name}
            </Badge>
          ))}
          {session.exercises.length > 4 && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              +{session.exercises.length - 4} more
            </Badge>
          )}
        </div>

        <Button
          onClick={onStart}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-10"
        >
          <Play className="h-4 w-4 mr-1.5" fill="currentColor" />
          Start Workout
        </Button>
      </div>
    </div>
  )
}
