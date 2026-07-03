'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Target,
  Plus,
  Trash2,
  Check,
  Trophy,
  Calendar,
  TrendingUp,
  Dumbbell,
  Clock,
  Zap,
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
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import type { Goal } from '@/lib/types/fitness'
import { cn } from '@/lib/utils'

const GOAL_TYPES = [
  { value: 'Workouts', label: 'Workouts', unit: 'workouts', icon: Dumbbell },
  { value: 'Weight', label: 'Target Weight', unit: 'kg', icon: TrendingUp },
  { value: 'Volume', label: 'Total Volume', unit: 'kg', icon: Zap },
  { value: 'Duration', label: 'Training Time', unit: 'minutes', icon: Clock },
]

export function GoalsView() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const res = await fetch('/api/goals')
        const data = await res.json()
        if (!cancelled) {
          setGoals(data)
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

  const handleAdd = async (data: {
    title: string
    type: string
    target: string
    unit: string
    deadline: string
  }) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const created = await res.json()
      setGoals((prev) => [created, ...prev])
      setAddOpen(false)
      toast({ title: 'Goal created! Go get it! 🎯', duration: 2500 })
    } catch {
      toast({ title: 'Failed to create goal', variant: 'destructive' })
    }
  }

  const handleUpdate = async (id: string, current: number) => {
    try {
      const res = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: current.toString() }),
      })
      const updated = await res.json()
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
    } catch {
      toast({ title: 'Failed to update goal', variant: 'destructive' })
    }
  }

  const handleToggleComplete = async (goal: Goal) => {
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !goal.completed,
          current: !goal.completed ? goal.target : goal.current,
        }),
      })
      const updated = await res.json()
      setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)))
      toast({
        title: !goal.completed ? 'Goal achieved! 🎉' : 'Goal reopened',
        duration: 2500,
      })
    } catch {
      toast({ title: 'Failed to update goal', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      setGoals((prev) => prev.filter((g) => g.id !== id))
      toast({ title: 'Goal deleted', duration: 2000 })
    } catch {
      toast({ title: 'Failed to delete goal', variant: 'destructive' })
    }
  }

  const activeGoals = goals.filter((g) => !g.completed)
  const completedGoals = goals.filter((g) => g.completed)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Goals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Set targets and track your progress
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="h-4 w-4 mr-1.5" />
              New Goal
            </Button>
          </DialogTrigger>
          <AddGoalDialog onSubmit={handleAdd} />
        </Dialog>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeGoals.length}
            </div>
            <div className="text-xs text-muted-foreground">Active Goals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{completedGoals.length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {goals.length > 0
                ? Math.round(
                    (goals.reduce(
                      (sum, g) =>
                        sum + Math.min((g.current / g.target) * 100, 100),
                      0
                    ) /
                      goals.length)
                  )
                : 0}
              %
            </div>
            <div className="text-xs text-muted-foreground">Avg Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Active goals */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600" />
          Active Goals
          <Badge variant="secondary">{activeGoals.length}</Badge>
        </h2>
        {activeGoals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-emerald-500/10 p-4 mb-3">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold">No active goals</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
                Set a goal to stay motivated and track your progress over time.
              </p>
              <Button
                onClick={() => setAddOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AnimatePresence>
              {activeGoals.map((goal, idx) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <GoalCard
                    goal={goal}
                    onUpdate={handleUpdate}
                    onToggleComplete={handleToggleComplete}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Completed
            <Badge variant="secondary">{completedGoals.length}</Badge>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdate}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GoalCard({
  goal,
  onUpdate,
  onToggleComplete,
  onDelete,
}: {
  goal: Goal
  onUpdate: (id: string, current: number) => void
  onToggleComplete: (goal: Goal) => void
  onDelete: (id: string) => void
}) {
  const progress = Math.min((goal.current / goal.target) * 100, 100)
  const goalType = GOAL_TYPES.find((t) => t.value === goal.type)
  const Icon = goalType?.icon || Target
  const isComplete = goal.completed
  const [increment, setIncrement] = useState('1')

  const handleIncrement = () => {
    const newCurrent = Math.min(goal.current + (parseFloat(increment) || 1), goal.target * 2)
    onUpdate(goal.id, newCurrent)
  }

  const deadlinePassed =
    goal.deadline && new Date(goal.deadline) < new Date() && !isComplete

  return (
    <Card className={cn('overflow-hidden', isComplete && 'opacity-75')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg shrink-0',
                isComplete
                  ? 'bg-amber-500/15 text-amber-600'
                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              )}
            >
              {isComplete ? <Trophy className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base truncate">{goal.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-0.5">
                <span>{goal.type}</span>
                {goal.deadline && (
                  <span className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {new Date(goal.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onToggleComplete(goal)}
              title={isComplete ? 'Reopen' : 'Mark complete'}
            >
              <Check className={cn('h-3.5 w-3.5', isComplete && 'text-amber-500')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(goal.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-bold">{goal.current}</span>
            <span className="text-sm text-muted-foreground"> / {goal.target} {goal.unit}</span>
          </div>
          <Badge
            variant={progress >= 100 ? 'default' : 'secondary'}
            className={cn(
              progress >= 100 && 'bg-emerald-600 text-white'
            )}
          >
            {Math.round(progress)}%
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        {!isComplete && (
          <div className="flex items-center gap-2 pt-1">
            <Input
              type="number"
              value={increment}
              onChange={(e) => setIncrement(e.target.value)}
              className="h-8 w-20 text-sm"
              placeholder="1"
            />
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1"
              onClick={handleIncrement}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Progress
            </Button>
          </div>
        )}
        {deadlinePassed && (
          <p className="text-xs text-destructive">Deadline passed — keep pushing!</p>
        )}
      </CardContent>
    </Card>
  )
}

function AddGoalDialog({
  onSubmit,
}: {
  onSubmit: (data: {
    title: string
    type: string
    target: string
    unit: string
    deadline: string
  }) => void
}) {
  const [form, setForm] = useState({
    title: '',
    type: 'Workouts',
    target: '',
    deadline: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.target) return
    const goalType = GOAL_TYPES.find((t) => t.value === form.type)
    onSubmit({
      title: form.title,
      type: form.type,
      target: form.target,
      unit: goalType?.unit || 'units',
      deadline: form.deadline,
    })
    setForm({ title: '', type: 'Workouts', target: '', deadline: '' })
  }

  const selectedType = GOAL_TYPES.find((t) => t.value === form.type)

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Goal</DialogTitle>
        <DialogDescription>
          Set a measurable target to keep yourself accountable.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="g-title">Goal Title</Label>
          <Input
            id="g-title"
            placeholder="e.g. 20 workouts this month"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="g-type">Type</Label>
            <Select
              value={form.type}
              onValueChange={(v) => setForm({ ...form, type: v })}
            >
              <SelectTrigger id="g-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOAL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="g-target">Target ({selectedType?.unit})</Label>
            <Input
              id="g-target"
              type="number"
              placeholder="20"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="g-deadline">Deadline (optional)</Label>
          <Input
            id="g-deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Create Goal
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
