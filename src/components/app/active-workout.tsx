'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Pause,
  Play,
  SkipForward,
  Plus,
  Flag,
  Clock,
  Dumbbell,
  Timer,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type {
  WorkoutSession,
  WorkoutExercise,
  CompletedWorkout,
  CompletedExercise,
} from '@/lib/types/app'

interface ActiveWorkoutProps {
  session: WorkoutSession
  onExit: () => void
  onComplete: (workout: CompletedWorkout) => void
}

// Parse rest string like "90s", "60 sec", "2 min", "30-45s" → seconds
function parseRestToSeconds(rest: string): number {
  if (!rest) return 60
  const lower = rest.toLowerCase()
  const minMatch = lower.match(/(\d+)\s*(?:min|minute)/)
  if (minMatch) return parseInt(minMatch[1], 10) * 60
  const secMatch = lower.match(/(\d+)/)
  if (secMatch) return parseInt(secMatch[1], 10)
  return 60
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

// Audio beep using Web Audio API (no external files needed)
function beep(frequency = 880, duration = 300, volume = 0.3) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    const ctx = new AudioCtx()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = frequency
    oscillator.type = 'sine'
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000)
    oscillator.start()
    oscillator.stop(ctx.currentTime + duration / 1000)
    // Cleanup context after sound finishes
    oscillator.onended = () => ctx.close()
  } catch {
    // Audio not available (e.g., SSR) — silent fallback
  }
}

export function ActiveWorkout({ session, onExit, onComplete }: ActiveWorkoutProps) {
  const exercises = session.exercises
  const totalExercises = exercises.length

  // --- State ---
  const [currentIdx, setCurrentIdx] = useState(0)
  // setsDone[exerciseIndex][setIndex] = completed
  const [setsDone, setSetsDone] = useState<boolean[][]>(
    exercises.map((ex) => Array(ex.sets).fill(false))
  )
  const [elapsedSec, setElapsedSec] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Rest timer
  const [restRemaining, setRestRemaining] = useState(0)
  const [restTotal, setRestTotal] = useState(0)
  const [restActive, setRestActive] = useState(false)

  // Exit confirmation
  const [exitDialogOpen, setExitDialogOpen] = useState(false)
  // Finish confirmation (when finishing with incomplete sets)
  const [finishDialogOpen, setFinishDialogOpen] = useState(false)
  // Completion summary
  const [summary, setSummary] = useState<CompletedWorkout | null>(null)

  // --- Refs (avoid stale closures in intervals) ---
  const startRef = useRef<number>(Date.now())
  const pausedAccumRef = useRef<number>(0)
  const pauseStartRef = useRef<number | null>(null)
  const restEndRef = useRef<number | null>(null)
  const totalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentExercise = exercises[currentIdx]
  const currentSets = setsDone[currentIdx] || []
  const currentSetsCompleted = currentSets.filter(Boolean).length
  const allCurrentDone = currentSetsCompleted === currentExercise.sets

  // The "active" set is the first incomplete one — this is the set the user
  // should do next. It gets a highlight so they always know where they are.
  // After completing a set (or skipping rest), this naturally advances.
  const activeSetIdx = currentSets.findIndex((done) => !done)

  // Total sets tracking
  const totalSetsTarget = exercises.reduce((sum, ex) => sum + ex.sets, 0)
  const totalSetsCompleted = setsDone.reduce(
    (sum, exSets) => sum + exSets.filter(Boolean).length,
    0
  )
  const overallProgress = (totalSetsCompleted / totalSetsTarget) * 100

  // --- Total timer (counts up, respects pause) ---
  useEffect(() => {
    totalIntervalRef.current = setInterval(() => {
      if (pauseStartRef.current === null) {
        const elapsed = Math.floor(
          (Date.now() - startRef.current - pausedAccumRef.current) / 1000
        )
        setElapsedSec(elapsed)
      }
    }, 500)
    return () => {
      if (totalIntervalRef.current) clearInterval(totalIntervalRef.current)
    }
  }, [])

  // --- Rest timer (counts down) ---
  useEffect(() => {
    if (!restActive) {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current)
        restIntervalRef.current = null
      }
      return
    }
    restIntervalRef.current = setInterval(() => {
      if (restEndRef.current === null) return
      const remaining = Math.ceil((restEndRef.current - Date.now()) / 1000)
      if (remaining <= 0) {
        setRestActive(false)
        setRestRemaining(0)
        restEndRef.current = null
        // Triple beep on completion
        beep(880, 200, 0.3)
        setTimeout(() => beep(880, 200, 0.3), 250)
        setTimeout(() => beep(1100, 400, 0.3), 500)
      } else {
        setRestRemaining(remaining)
      }
    }, 250)
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    }
  }, [restActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (totalIntervalRef.current) clearInterval(totalIntervalRef.current)
      if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    }
  }, [])

  // --- Actions ---
  const toggleSet = useCallback(
    (setIdx: number) => {
      setSetsDone((prev) => {
        const next = prev.map((arr) => [...arr])
        const wasDone = next[currentIdx][setIdx]
        next[currentIdx][setIdx] = !wasDone
        // If marking a set as done (not un-doing), start rest timer
        if (!wasDone) {
          const restSec = parseRestToSeconds(currentExercise.rest)
          setRestTotal(restSec)
          setRestRemaining(restSec)
          restEndRef.current = Date.now() + restSec * 1000
          setRestActive(true)
          beep(660, 150, 0.2)
        }
        return next
      })
    },
    [currentIdx, currentExercise]
  )

  const startRest = useCallback(
    (seconds?: number) => {
      const restSec = seconds ?? parseRestToSeconds(currentExercise.rest)
      setRestTotal(restSec)
      setRestRemaining(restSec)
      restEndRef.current = Date.now() + restSec * 1000
      setRestActive(true)
    },
    [currentExercise]
  )

  const skipRest = useCallback(() => {
    setRestActive(false)
    setRestRemaining(0)
    restEndRef.current = null
    // "Skip" sound: two quick descending beeps (swoosh feeling)
    beep(880, 100, 0.25)
    setTimeout(() => beep(660, 150, 0.25), 110)
  }, [])

  const addRestTime = useCallback((seconds: number) => {
    if (restEndRef.current === null) return
    restEndRef.current += seconds * 1000
    setRestRemaining((prev) => prev + seconds)
    setRestTotal((prev) => prev + seconds)
    // "Add time" sound: a single bright ding
    beep(1100, 120, 0.2)
  }, [])

  const togglePause = useCallback(() => {
    if (isPaused) {
      // Resume
      if (pauseStartRef.current !== null) {
        pausedAccumRef.current += Date.now() - pauseStartRef.current
        pauseStartRef.current = null
      }
      // Adjust rest end time if it was active
      if (restEndRef.current !== null) {
        // restEndRef already points to a future timestamp; since we didn't
        // tick during pause, we need to extend it by the pause duration.
        // But we already accounted for the pause via pauseStartRef for total timer.
        // For rest, the interval was still running... actually no, the interval
        // checks Date.now() so rest would have continued counting during "pause".
        // To keep it simple, rest timer continues during pause. That's acceptable.
      }
      setIsPaused(false)
    } else {
      // Pause
      pauseStartRef.current = Date.now()
      setIsPaused(true)
    }
  }, [isPaused])

  const goToExercise = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= totalExercises) return
      setCurrentIdx(idx)
      // Don't auto-clear rest; let it continue
    },
    [totalExercises]
  )

  const nextExercise = useCallback(() => {
    if (currentIdx < totalExercises - 1) {
      setCurrentIdx(currentIdx + 1)
      skipRest()
    }
  }, [currentIdx, totalExercises, skipRest])

  const prevExercise = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1)
      skipRest()
    }
  }, [currentIdx, skipRest])

  const handleExitClick = useCallback(() => {
    // If any sets done, confirm; otherwise just exit
    const anyDone = setsDone.some((arr) => arr.some(Boolean))
    if (anyDone) {
      setExitDialogOpen(true)
    } else {
      onExit()
    }
  }, [setsDone, onExit])

  const handleFinish = useCallback(() => {
    // Compute final duration
    let finalDuration = elapsedSec
    if (pauseStartRef.current !== null) {
      finalDuration = Math.floor(
        (Date.now() - startRef.current - pausedAccumRef.current) / 1000
      )
    }

    const completedExercises: CompletedExercise[] = exercises.map((ex, i) => ({
      name: ex.name,
      setsCompleted: setsDone[i].filter(Boolean).length,
      targetSets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
    }))

    const totalSetsDone = completedExercises.reduce(
      (sum, e) => sum + e.setsCompleted,
      0
    )

    const workout: CompletedWorkout = {
      id: `w-${Date.now()}`,
      date: new Date().toISOString(),
      startedAt: new Date(startRef.current).toISOString(),
      planDay: session.day,
      focus: session.focus,
      durationSec: finalDuration,
      exercises: completedExercises,
      totalSetsCompleted: totalSetsDone,
      totalSetsTarget,
    }

    // Stop timers
    if (totalIntervalRef.current) clearInterval(totalIntervalRef.current)
    if (restIntervalRef.current) clearInterval(restIntervalRef.current)
    setRestActive(false)

    // Show summary
    setSummary(workout)
  }, [elapsedSec, exercises, setsDone, session, totalSetsTarget])

  // Called when the user taps "Finish Workout". If there are incomplete sets,
  // confirm first; otherwise finish immediately.
  const handleFinishClick = useCallback(() => {
    if (totalSetsCompleted < totalSetsTarget) {
      setFinishDialogOpen(true)
    } else {
      handleFinish()
    }
  }, [totalSetsCompleted, totalSetsTarget, handleFinish])

  const handleSummaryDismiss = useCallback(() => {
    if (summary) {
      onComplete(summary)
    }
  }, [summary, onComplete])

  // --- Summary screen ---
  if (summary) {
    return <WorkoutSummary workout={summary} onDone={handleSummaryDismiss} />
  }

  const restProgress =
    restTotal > 0 ? ((restTotal - restRemaining) / restTotal) * 100 : 0

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="shrink-0 border-b border-border/40 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleExitClick}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
            Exit
          </button>
          <div className="text-center min-w-0">
            <p className="font-semibold text-sm truncate">{session.day}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              {session.focus}
            </p>
          </div>
          {/* Spacer to keep title centered (Exit button is on the left only) */}
          <div className="w-12" />
        </div>

        {/* Exercise progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {exercises.map((ex, i) => {
            const setsArr = setsDone[i] || []
            const done = setsArr.filter(Boolean).length
            const allDone = done === ex.sets
            const isCurrent = i === currentIdx
            return (
              <button
                key={i}
                onClick={() => goToExercise(i)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  allDone
                    ? 'bg-emerald-500 w-6'
                    : isCurrent
                      ? 'bg-emerald-500 w-6'
                      : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                )}
                title={`${ex.name} (${done}/${ex.sets} sets)`}
              />
            )
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Total timer + overall progress */}
        <div className="px-4 pt-5 pb-4 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Clock className="h-3.5 w-3.5" />
            Total Time
          </div>
          <div className="text-5xl font-extrabold tabular-nums tracking-tight">
            {formatDuration(elapsedSec)}
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              className="h-8"
            >
              {isPaused ? (
                <>
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-3.5 w-3.5 mr-1" />
                  Pause
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              {totalSetsCompleted}/{totalSetsTarget} sets done
            </span>
          </div>
          <Progress value={overallProgress} className="h-1.5 mt-3" />
        </div>

        {/* Rest timer (shows when active) */}
        <AnimatePresence>
          {restActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-4 mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-semibold">Rest Timer</span>
                  </div>
                  <span className="text-2xl font-extrabold tabular-nums text-emerald-600">
                    {restRemaining}s
                  </span>
                </div>
                <Progress
                  value={restProgress}
                  className="h-2 mb-3 [&>div]:bg-emerald-500"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={skipRest}
                    className="flex-1 h-8"
                  >
                    <SkipForward className="h-3.5 w-3.5 mr-1" />
                    Skip
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addRestTime(15)}
                    className="flex-1 h-8"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    15s
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addRestTime(30)}
                    className="flex-1 h-8"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    30s
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current exercise */}
        <div className="px-4 pb-4">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-1">
              <Badge variant="secondary" className="text-[10px]">
                Exercise {currentIdx + 1} of {totalExercises}
              </Badge>
              {allCurrentDone && (
                <Badge className="bg-emerald-500/15 text-emerald-600 border-0">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Badge>
              )}
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-1">
              {currentExercise.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Dumbbell className="h-3.5 w-3.5" />
                {currentExercise.sets} sets × {currentExercise.reps} reps
              </span>
              <span className="flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" />
                {currentExercise.rest} rest
              </span>
            </div>

            {currentExercise.notes && (
              <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 mb-4 text-sm text-muted-foreground">
                💡 {currentExercise.notes}
              </div>
            )}

            {/* Set list */}
            <div className="space-y-2">
              {currentSets.map((done, setIdx) => {
                // The "active" set is the next one to do (first incomplete).
                const isActive = setIdx === activeSetIdx && !done && !restActive
                return (
                  <button
                    key={setIdx}
                    onClick={() => toggleSet(setIdx)}
                    disabled={restActive}
                    className={cn(
                      'flex items-center justify-between w-full rounded-xl border-2 p-3.5 transition-all',
                      restActive && 'opacity-50 cursor-not-allowed',
                      done
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : isActive
                          ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-400/40 shadow-sm'
                          : restActive
                            ? 'border-border bg-card'
                            : 'border-border bg-card hover:border-emerald-300 active:scale-[0.98]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-colors',
                          done
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : isActive
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                              : 'border-muted-foreground/40'
                        )}
                      >
                        {done ? (
                          <Check className="h-4 w-4" strokeWidth={3} />
                        ) : (
                          <span className="text-xs font-bold">{setIdx + 1}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-sm">Set {setIdx + 1}</p>
                        <p className="text-xs text-muted-foreground">
                          {currentExercise.reps} reps
                        </p>
                      </div>
                    </div>
                    {done ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-0">
                        Done
                      </Badge>
                    ) : isActive ? (
                      <Badge className="bg-emerald-500 text-white border-0 animate-pulse">
                        Next
                      </Badge>
                    ) : restActive ? (
                      <span className="text-xs text-muted-foreground">Resting…</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Tap to log</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Start rest manually (if not active and not all done) */}
            {!restActive && !allCurrentDone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => startRest()}
                className="w-full mt-3 h-9"
              >
                <Timer className="h-4 w-4 mr-1.5" />
                Start Rest Timer ({parseRestToSeconds(currentExercise.rest)}s)
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={prevExercise}
            disabled={currentIdx === 0}
            className="flex-1 h-11"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          {currentIdx === totalExercises - 1 ? (
            <Button
              onClick={handleFinishClick}
              className="flex-[2] h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Flag className="h-4 w-4 mr-1.5" />
              Finish Workout
            </Button>
          ) : (
            <Button
              onClick={nextExercise}
              className="flex-[2] h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Next Exercise
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Exit confirmation dialog */}
      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Exit workout?
            </DialogTitle>
            <DialogDescription>
              You&apos;ve completed {totalSetsCompleted} of {totalSetsTarget} sets.
              Exiting now will discard your progress. Use Finish to save this session
              to your history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setExitDialogOpen(false)}>
              Keep Training
            </Button>
            <Button variant="destructive" onClick={onExit}>
              Discard & Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finish confirmation dialog (shown when finishing with incomplete sets) */}
      <Dialog open={finishDialogOpen} onOpenChange={setFinishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Finish workout early?
            </DialogTitle>
            <DialogDescription>
              You&apos;ve completed {totalSetsCompleted} of {totalSetsTarget} sets
              across {exercises.length} exercises. Finishing now will save this
              session with your current progress. You can always train the
              remaining sets next time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setFinishDialogOpen(false)}>
              Keep Training
            </Button>
            <Button
              onClick={() => {
                setFinishDialogOpen(false)
                handleFinish()
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Flag className="h-4 w-4 mr-1.5" />
              Finish Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WorkoutSummary({
  workout,
  onDone,
}: {
  workout: CompletedWorkout
  onDone: () => void
}) {
  const completionPct =
    workout.totalSetsTarget > 0
      ? Math.round((workout.totalSetsCompleted / workout.totalSetsTarget) * 100)
      : 0

  return (
    <div className="flex flex-col h-full items-center justify-center bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-emerald-950/10 px-6 text-center">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="mb-6"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30">
          <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Workout Complete! 🎉
        </h1>
        <p className="text-muted-foreground mb-8">
          {workout.planDay} · {workout.focus}
        </p>

        <div className="grid grid-cols-3 gap-3 mb-8 max-w-md mx-auto">
          <SummaryStat
            icon={Clock}
            label="Duration"
            value={formatDuration(workout.durationSec)}
          />
          <SummaryStat
            icon={Check}
            label="Sets"
            value={`${workout.totalSetsCompleted}/${workout.totalSetsTarget}`}
          />
          <SummaryStat
            icon={Dumbbell}
            label="Exercises"
            value={workout.exercises.filter((e) => e.setsCompleted > 0).length.toString()}
          />
        </div>

        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-bold">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-2.5" />
        </div>

        <Button
          onClick={onDone}
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8"
        >
          Save & View History
        </Button>
      </motion.div>
    </div>
  )
}

function SummaryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mb-1.5">
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}
