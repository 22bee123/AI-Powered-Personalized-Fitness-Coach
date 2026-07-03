'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  Clock,
  ChevronDown,
  Flame,
  Target,
  RefreshCw,
  Loader2,
  Calendar,
  Lightbulb,
  Zap,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { UserProfile, WorkoutPlan } from '@/lib/types/app'
import { GOAL_LABELS } from '@/lib/types/app'

interface WorkoutTabProps {
  profile: UserProfile | null
  plan: WorkoutPlan | null
  onUpdate: (plan: WorkoutPlan) => void
}

export function WorkoutPlanTab({ profile, plan, onUpdate }: WorkoutTabProps) {
  const [regenerating, setRegenerating] = useState(false)
  const { toast } = useToast()

  const handleRegenerate = async () => {
    if (!profile) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/generate-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, planTypes: ['workout'] }),
      })
      const data = await res.json()
      if (data.workout) {
        const newPlan = { ...data.workout, generatedAt: new Date().toISOString() }
        onUpdate(newPlan)
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

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Dumbbell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No workout plan yet</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs">
          Generate a personalized workout plan based on your profile.
        </p>
        <Button
          onClick={handleRegenerate}
          disabled={regenerating || !profile}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {regenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles />
              Generate Workout Plan
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="h-5 w-5" />
              <span className="text-sm font-medium text-emerald-50/90">
                Your Workout Program
              </span>
            </div>
            <h2 className="text-xl font-extrabold mb-2">{plan.weeklySplit}</h2>
            <p className="text-sm text-emerald-50/90 mb-4">{plan.summary}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/20">
                <Calendar className="h-3 w-3 mr-1" />
                {plan.daysPerWeek} days/week
              </Badge>
              {profile && (
                <Badge className="bg-white/20 text-white border-0 hover:bg-white/20">
                  <Target className="h-3 w-3 mr-1" />
                  {GOAL_LABELS[profile.goal]}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Sessions */}
      <div className="space-y-3">
        {plan.sessions.map((session, idx) => (
          <SessionCard key={idx} session={session} index={idx} />
        ))}
      </div>

      {/* Tips */}
      {plan.tips && plan.tips.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Training Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-muted-foreground">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Warmup tip */}
      {plan.warmupTip && (
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 shrink-0">
              <Zap className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5">Warm-up Recommendation</p>
              <p className="text-sm text-muted-foreground">{plan.warmupTip}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regenerate */}
      <Button
        variant="outline"
        onClick={handleRegenerate}
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

function SessionCard({
  session,
  index,
}: {
  session: WorkoutPlan['sessions'][number]
  index: number
}) {
  const [expanded, setExpanded] = useState(index === 0)
  const totalSets = session.exercises.reduce((sum, e) => sum + e.sets, 0)

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{session.day}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.focus}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {session.durationMin}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3" />
                    {session.exercises.length} ex
                  </span>
                  <span>{totalSets} sets</span>
                </div>
              </div>
            </div>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform shrink-0',
                expanded && 'rotate-180'
              )}
            />
          </div>
        </CardContent>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 p-4 pt-3 space-y-2">
              {session.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-muted/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-medium text-sm">{ex.name}</p>
                    <div className="flex gap-1 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">
                        {ex.sets} × {ex.reps}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>Rest: {ex.rest}</span>
                  </div>
                  {ex.notes && (
                    <p className="text-xs text-muted-foreground mt-1.5 italic">
                      💡 {ex.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

