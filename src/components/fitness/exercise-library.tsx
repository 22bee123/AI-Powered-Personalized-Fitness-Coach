'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Dumbbell,
  Activity,
  Plus,
  Filter,
  Info,
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
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/hooks/use-toast'
import type { Exercise } from '@/lib/types/fitness'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Full Body',
]

export function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState<Exercise | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/exercises')
      .then((r) => r.json())
      .then((data) => {
        setExercises(data)
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchCat = category === 'all' || e.category === category
      const matchSearch =
        !search ||
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.muscleGroup || '').toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [exercises, search, category])

  const handleAdd = async (data: {
    name: string
    category: string
    muscleGroup: string
    equipment: string
    difficulty: string
    description: string
    instructions: string
  }) => {
    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const created = await res.json()
      setExercises((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
      )
      setAddOpen(false)
      toast({ title: 'Exercise added to library!', duration: 2000 })
    } catch {
      toast({ title: 'Failed to add exercise', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Exercise Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {exercises.length} exercises · {CATEGORIES.length} categories
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Custom
            </Button>
          </DialogTrigger>
          <AddExerciseDialog onSubmit={handleAdd} />
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises by name or muscle group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="sm:w-44">
                <Filter className="h-4 w-4 mr-1.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="rounded-full bg-muted p-4 mb-3 inline-flex">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No exercises found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try a different search or category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((ex, idx) => (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.4) }}
            >
              <Card
                className="cursor-pointer hover:border-emerald-400/60 hover:shadow-md transition-all h-full"
                onClick={() => setSelected(ex)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg shrink-0', categoryColor(ex.category))}>
                      {ex.category === 'Cardio' ? (
                        <Activity className="h-5 w-5" />
                      ) : (
                        <Dumbbell className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base leading-tight">
                        {ex.name}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {ex.muscleGroup}
                      </CardDescription>
                    </div>
                    {ex.isCustom && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        Custom
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {ex.category}
                    </Badge>
                    {ex.equipment && (
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {ex.equipment}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] font-normal', difficultyColor(ex.difficulty))}
                    >
                      {ex.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', categoryColor(selected.category))}>
                    {selected.category === 'Cardio' ? (
                      <Activity className="h-6 w-6" />
                    ) : (
                      <Dumbbell className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selected.name}</DialogTitle>
                    <DialogDescription>{selected.muscleGroup}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                {selected.description && (
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{selected.category}</Badge>
                  {selected.equipment && (
                    <Badge variant="outline">{selected.equipment}</Badge>
                  )}
                  <Badge variant="outline" className={difficultyColor(selected.difficulty)}>
                    {selected.difficulty}
                  </Badge>
                </div>
                {selected.instructions && (
                  <div className="rounded-lg bg-muted/40 p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Info className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold">How to perform</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selected.instructions}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddExerciseDialog({
  onSubmit,
}: {
  onSubmit: (data: {
    name: string
    category: string
    muscleGroup: string
    equipment: string
    difficulty: string
    description: string
    instructions: string
  }) => void
}) {
  const [form, setForm] = useState({
    name: '',
    category: 'Full Body',
    muscleGroup: '',
    equipment: '',
    difficulty: 'Beginner',
    description: '',
    instructions: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit(form)
    setForm({
      name: '',
      category: 'Full Body',
      muscleGroup: '',
      equipment: '',
      difficulty: 'Beginner',
      description: '',
      instructions: '',
    })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Custom Exercise</DialogTitle>
        <DialogDescription>
          Create a custom exercise to use in your workouts.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="ex-name">Name</Label>
          <Input
            id="ex-name"
            placeholder="e.g. Cable Crossover"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ex-cat">Category</Label>
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v })}
            >
              <SelectTrigger id="ex-cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ex-mg">Muscle Group</Label>
            <Input
              id="ex-mg"
              placeholder="e.g. Pectorals"
              value={form.muscleGroup}
              onChange={(e) => setForm({ ...form, muscleGroup: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ex-eq">Equipment</Label>
            <Input
              id="ex-eq"
              placeholder="e.g. Cable"
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="ex-diff">Difficulty</Label>
            <Select
              value={form.difficulty}
              onValueChange={(v) => setForm({ ...form, difficulty: v })}
            >
              <SelectTrigger id="ex-diff">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="ex-desc">Description</Label>
          <Textarea
            id="ex-desc"
            placeholder="Brief description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="ex-ins">Instructions</Label>
          <Textarea
            id="ex-ins"
            placeholder="How to perform this exercise..."
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Add Exercise
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

function categoryColor(category: string) {
  const map: Record<string, string> = {
    Chest: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    Back: 'bg-teal-500/15 text-teal-600 dark:text-teal-400',
    Legs: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    Shoulders: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    Arms: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    Core: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
    Cardio: 'bg-red-500/15 text-red-600 dark:text-red-400',
    'Full Body': 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
  }
  return map[category] || 'bg-muted text-muted-foreground'
}

function difficultyColor(diff: string) {
  const map: Record<string, string> = {
    Beginner: 'text-emerald-600 border-emerald-300',
    Intermediate: 'text-amber-600 border-amber-300',
    Advanced: 'text-rose-600 border-rose-300',
  }
  return map[diff] || ''
}
