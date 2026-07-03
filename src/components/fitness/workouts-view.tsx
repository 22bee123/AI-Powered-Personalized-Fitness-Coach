'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Dumbbell,
  Trash2,
  Clock,
  Flame,
  Search,
  X,
  ChevronDown,
  Calendar,
  ListTodo,
  Sparkles,
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import type { Workout, Exercise, WorkoutPlan } from '@/lib/types/fitness'
import { cn } from '@/lib/utils'

interface ExerciseLogDraft {
  exerciseId: string
  exercise?: Exercise
  sets: number
  reps: number
  weight: number
}

export function WorkoutsView() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [logOpen, setLogOpen] = useState(false)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    const [wRes, eRes, pRes] = await Promise.all([
      fetch('/api/workouts'),
      fetch('/api/exercises'),
      fetch('/api/workout-plans'),
    ])
    const [w, e, p] = await Promise.all([wRes.json(), eRes.json(), pRes.json()])
    setWorkouts(w)
    setExercises(e)
    setPlans(p)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/workouts/${id}`, { method: 'DELETE' })
      setWorkouts((prev) => prev.filter((w) => w.id !== id))
      toast({ title: 'Workout deleted', duration: 2000 })
    } catch {
      toast({ title: 'Failed to delete workout', variant: 'destructive' })
    }
  }

  const handleStartPlan = (plan: WorkoutPlan) => {
    // Map plan exercises to drafts based on existing exercise library
    const drafts: ExerciseLogDraft[] = plan.exercises
      .map((pe) => {
        const ex = exercises.find((e) => e.name === pe.name)
        if (!ex) return null
        return {
          exerciseId: ex.id,
          exercise: ex,
          sets: pe.sets,
          reps: pe.reps,
          weight: pe.weight,
        }
      })
      .filter((d): d is ExerciseLogDraft => d !== null)

    setDraft(drafts)
    setWorkoutName(plan.name)
    setWorkoutCategory(plan.category)
    setWorkoutDuration(plan.duration.toString())
    setWorkoutCalories(plan.calories.toString())
    setLogOpen(true)
  }

  const [draft, setDraft] = useState<ExerciseLogDraft[]>([])
  const [workoutName, setWorkoutName] = useState('')
  const [workoutCategory, setWorkoutCategory] = useState('Strength')
  const [workoutDuration, setWorkoutDuration] = useState('45')
  const [workoutCalories, setWorkoutCalories] = useState('300')
  const [workoutNotes, setWorkoutNotes] = useState('')
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [exerciseCategory, setExerciseCategory] = useState('all')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const filteredExercises = exercises.filter((e) => {
    const matchCat = exerciseCategory === 'all' || e.category === exerciseCategory
    const matchSearch =
      !exerciseSearch ||
      e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
    return matchCat && matchSearch
  })

  const addExercise = (ex: Exercise) => {
    if (draft.find((d) => d.exerciseId === ex.id)) return
    setDraft((prev) => [
      ...prev,
      { exerciseId: ex.id, exercise: ex, sets: 3, reps: 10, weight: 20 },
    ])
    setPickerOpen(false)
    setExerciseSearch('')
  }

  const updateDraft = (id: string, field: keyof ExerciseLogDraft, value: string | number) => {
    setDraft((prev) =>
      prev.map((d) =>
        d.exerciseId === id
          ? { ...d, [field]: field === 'exerciseId' ? value : Number(value) || 0 }
          : d
      )
    )
  }

  const removeDraft = (id: string) => {
    setDraft((prev) => prev.filter((d) => d.exerciseId !== id))
  }

  const resetForm = () => {
    setDraft([])
    setWorkoutName('')
    setWorkoutCategory('Strength')
    setWorkoutDuration('45')
    setWorkoutCalories('300')
    setWorkoutNotes('')
  }

  const handleSave = async () => {
    if (draft.length === 0) {
      toast({ title: 'Add at least one exercise', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workoutName || 'Custom Workout',
          category: workoutCategory,
          duration: parseInt(workoutDuration) || 0,
          calories: parseInt(workoutCalories) || 0,
          notes: workoutNotes,
          exerciseLogs: draft.map((d) => ({
            exerciseId: d.exerciseId,
            sets: d.sets,
            reps: d.reps,
            weight: d.weight,
          })),
        }),
      })
      const created = await res.json()
      setWorkouts((prev) => [created, ...prev])
      setLogOpen(false)
      resetForm()
      toast({ title: 'Workout logged! Nice work! 💪', duration: 2500 })
    } catch {
      toast({ title: 'Failed to save workout', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Workouts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log training sessions and track your history
          </p>
        </div>
        <Sheet open={logOpen} onOpenChange={setLogOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4 mr-1.5" />
              Log Workout
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Log a Workout</SheetTitle>
              <SheetDescription>
                Add exercises, sets, reps, and weight to record your session.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 mt-6">
              {/* Workout meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="w-name">Workout Name</Label>
                  <Input
                    id="w-name"
                    placeholder="e.g. Push Day"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="w-cat">Category</Label>
                  <Select value={workoutCategory} onValueChange={setWorkoutCategory}>
                    <SelectTrigger id="w-cat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Strength">Strength</SelectItem>
                      <SelectItem value="Cardio">Cardio</SelectItem>
                      <SelectItem value="Flexibility">Flexibility</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="w-dur">Duration (min)</Label>
                  <Input
                    id="w-dur"
                    type="number"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="w-cal">Calories Burned</Label>
                  <Input
                    id="w-cal"
                    type="number"
                    value={workoutCalories}
                    onChange={(e) => setWorkoutCalories(e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="w-notes">Notes (optional)</Label>
                  <Textarea
                    id="w-notes"
                    placeholder="How did it feel?"
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  Exercises{' '}
                  <span className="text-muted-foreground">({draft.length})</span>
                </h3>
                <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Exercise
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Choose Exercise</DialogTitle>
                      <DialogDescription>
                        Search the exercise library
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search exercises..."
                            value={exerciseSearch}
                            onChange={(e) => setExerciseSearch(e.target.value)}
                            className="pl-8"
                          />
                        </div>
                        <Select value={exerciseCategory} onValueChange={setExerciseCategory}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="Chest">Chest</SelectItem>
                            <SelectItem value="Back">Back</SelectItem>
                            <SelectItem value="Legs">Legs</SelectItem>
                            <SelectItem value="Shoulders">Shoulders</SelectItem>
                            <SelectItem value="Arms">Arms</SelectItem>
                            <SelectItem value="Core">Core</SelectItem>
                            <SelectItem value="Cardio">Cardio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="max-h-72 overflow-y-auto scrollbar-thin space-y-1">
                        {filteredExercises.map((ex) => {
                          const added = draft.find((d) => d.exerciseId === ex.id)
                          return (
                            <button
                              key={ex.id}
                              onClick={() => addExercise(ex)}
                              disabled={!!added}
                              className={cn(
                                'flex items-center justify-between w-full rounded-lg border border-border/60 p-2.5 text-left hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                              )}
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{ex.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ex.category} · {ex.equipment || 'Bodyweight'}
                                </p>
                              </div>
                              {added ? (
                                <Badge variant="secondary" className="ml-2 shrink-0">
                                  Added
                                </Badge>
                              ) : (
                                <Plus className="h-4 w-4 ml-2 shrink-0 text-muted-foreground" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Exercise drafts */}
              <div className="space-y-2">
                {draft.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center">
                    <ListTodo className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No exercises added yet
                    </p>
                  </div>
                ) : (
                  draft.map((d) => (
                    <div
                      key={d.exerciseId}
                      className="rounded-lg border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm truncate">{d.exercise?.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeDraft(d.exerciseId)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Sets</Label>
                          <Input
                            type="number"
                            value={d.sets}
                            onChange={(e) => updateDraft(d.exerciseId, 'sets', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Reps</Label>
                          <Input
                            type="number"
                            value={d.reps}
                            onChange={(e) => updateDraft(d.exerciseId, 'reps', e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Weight (kg)</Label>
                          <Input
                            type="number"
                            value={d.weight}
                            onChange={(e) => updateDraft(d.exerciseId, 'weight', e.target.value)}
                            className="h-9"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <SheetFooter className="mt-6">
              <Button
                onClick={handleSave}
                disabled={saving || draft.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
              >
                {saving ? 'Saving...' : 'Save Workout'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">
            <Calendar className="h-4 w-4 mr-1.5" />
            History
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Sparkles className="h-4 w-4 mr-1.5" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Workout history */}
        <TabsContent value="history" className="space-y-3 mt-4">
          {workouts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-emerald-500/10 p-4 mb-4">
                  <Dumbbell className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg">No workouts logged yet</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
                  Start tracking your training sessions to see them here. Every rep counts!
                </p>
                <Button
                  onClick={() => setLogOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Log Your First Workout
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {workouts.map((w, idx) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <WorkoutCard workout={w} onDelete={() => handleDelete(w.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground mb-3">
            Quick-start templates — tap to prefill a workout log.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className="overflow-hidden hover:border-emerald-400/60 transition-colors cursor-pointer group"
              >
                <button onClick={() => handleStartPlan(plan)} className="text-left w-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {plan.name}
                        </CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {plan.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {plan.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" />
                        {plan.calories} kcal
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-3.5 w-3.5" />
                        {plan.exercises.length} exercises
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.exercises.slice(0, 4).map((e, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] font-normal">
                          {e.name}
                        </Badge>
                      ))}
                      {plan.exercises.length > 4 && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          +{plan.exercises.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function WorkoutCard({ workout, onDelete }: { workout: Workout; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const totalVolume = workout.exerciseLogs.reduce(
    (sum, l) => sum + l.sets * l.reps * l.weight,
    0
  )

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-lg shrink-0', categoryColor(workout.category))}>
              <Dumbbell className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-base">{workout.name}</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {workout.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(workout.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {workout.duration}m
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {workout.calories} kcal
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-3 w-3" />
                  {workout.exerciseLogs.length} ex
                </span>
                {totalVolume > 0 && (
                  <span className="hidden sm:flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    {Math.round(totalVolume)} kg vol
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {workout.exerciseLogs.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setExpanded(!expanded)}
              >
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')}
                />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && workout.exerciseLogs.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                {workout.exerciseLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{log.exercise.name}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline">{log.sets}×{log.reps}</Badge>
                      {log.weight > 0 && (
                        <Badge variant="outline">{log.weight}kg</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {workout.notes && (
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/60 italic">
            &ldquo;{workout.notes}&rdquo;
          </p>
        )}
      </CardContent>
    </Card>
  )
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
