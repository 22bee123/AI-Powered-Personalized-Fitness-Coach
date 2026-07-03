'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  User,
  Target,
  Dumbbell,
  Salad,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type {
  UserProfile,
  FitnessGoal,
  ActivityLevel,
  DietPreference,
  WorkoutPlan,
  NutritionPlan,
} from '@/lib/types/app'
import {
  GOAL_LABELS,
  GOAL_DESCRIPTIONS,
  ACTIVITY_LABELS,
  DIET_LABELS,
} from '@/lib/types/app'
import { storage } from '@/lib/storage'

interface OnboardingProps {
  onComplete: (data: {
    profile: UserProfile
    workoutPlan: WorkoutPlan | null
    nutritionPlan: NutritionPlan | null
  }) => void
  onBack: () => void
}

const GOALS: FitnessGoal[] = [
  'lose_weight',
  'build_muscle',
  'improve_endurance',
  'general_fitness',
  'flexibility',
]

const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
  'athlete',
]

const DIETS: DietPreference[] = [
  'no_preference',
  'vegetarian',
  'vegan',
  'keto',
  'paleo',
  'halal',
  'kosher',
  'gluten_free',
]

const TOTAL_STEPS = 4

export function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'male' as UserProfile['gender'],
    heightCm: '',
    weightKg: '',
    goal: 'general_fitness' as FitnessGoal,
    activityLevel: 'moderately_active' as ActivityLevel,
    workoutDaysPerWeek: '4',
    dietPreference: 'no_preference' as DietPreference,
    allergies: '',
  })

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const canProceed = () => {
    switch (step) {
      case 0:
        return (
          form.name.trim().length > 0 &&
          Number(form.age) >= 10 &&
          Number(form.age) <= 100
        )
      case 1:
        return (
          Number(form.heightCm) >= 100 &&
          Number(form.heightCm) <= 250 &&
          Number(form.weightKg) >= 30 &&
          Number(form.weightKg) <= 300
        )
      case 2:
        return !!form.goal && !!form.activityLevel
      case 3:
        return (
          Number(form.workoutDaysPerWeek) >= 1 &&
          Number(form.workoutDaysPerWeek) <= 7
        )
      default:
        return true
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1)
    } else {
      void handleGenerate()
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1)
    } else {
      onBack()
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setProgress(10)

    const profile: UserProfile = {
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      heightCm: Number(form.heightCm),
      weightKg: Number(form.weightKg),
      goal: form.goal,
      activityLevel: form.activityLevel,
      workoutDaysPerWeek: Number(form.workoutDaysPerWeek),
      dietPreference: form.dietPreference,
      allergies: form.allergies.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    // Animate progress while waiting
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 85))
    }, 800)

    try {
      const res = await fetch('/api/generate-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          planTypes: ['workout', 'nutrition'],
        }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate plans')
      }

      const data = (await res.json()) as {
        workout?: WorkoutPlan
        nutrition?: NutritionPlan
        partialFailure?: string[]
      }

      // Persist to localStorage
      storage.setProfile(profile)
      if (data.workout) storage.setWorkoutPlan(data.workout)
      if (data.nutrition) storage.setNutritionPlan(data.nutrition)
      storage.setOnboarded(true)

      if (data.partialFailure && data.partialFailure.length > 0) {
        toast({
          title: 'Partial success',
          description: `${data.partialFailure.join(' and ')} plan needs a retry. You can regenerate later.`,
          variant: 'destructive',
          duration: 5000,
        })
      } else {
        toast({
          title: 'Your plans are ready! 🎉',
          description: 'Welcome to FitForge, ' + profile.name + '!',
          duration: 3000,
        })
      }

      // Small delay so user sees 100%
      await new Promise((r) => setTimeout(r, 600))

      onComplete({
        profile,
        workoutPlan: data.workout || null,
        nutritionPlan: data.nutrition || null,
      })
    } catch (err) {
      clearInterval(progressInterval)
      setGenerating(false)
      setProgress(0)
      toast({
        title: 'Generation failed',
        description:
          err instanceof Error
            ? err.message
            : 'Please check your connection and try again.',
        variant: 'destructive',
        duration: 5000,
      })
    }
  }

  if (generating) {
    return <GeneratingScreen name={form.name} progress={progress} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-emerald-50/30 dark:to-emerald-950/10">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-sm">
              Fit<span className="text-emerald-500">Forge</span>
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Step {step + 1}/{TOTAL_STEPS}
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </header>

      {/* Form content */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <StepShell
                icon={User}
                title="Let's get to know you"
                subtitle="Tell us your name and age so we can personalize your experience."
              >
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Alex"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className="mt-1.5 h-12 text-base"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium">
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      inputMode="numeric"
                      placeholder="e.g. 28"
                      value={form.age}
                      onChange={(e) => update('age', e.target.value)}
                      className="mt-1.5 h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {(['male', 'female', 'other'] as const).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => update('gender', g)}
                          className={cn(
                            'h-12 rounded-lg border-2 text-sm font-medium capitalize transition-all',
                            form.gender === g
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'border-border bg-background hover:border-emerald-300'
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </StepShell>
            )}

            {step === 1 && (
              <StepShell
                icon={Target}
                title="Your body metrics"
                subtitle="We use these to calculate your calorie needs and tailor exercises."
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height" className="text-sm font-medium">
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      inputMode="numeric"
                      placeholder="e.g. 175"
                      value={form.heightCm}
                      onChange={(e) => update('heightCm', e.target.value)}
                      className="mt-1.5 h-12 text-base"
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-sm font-medium">
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      inputMode="decimal"
                      placeholder="e.g. 72"
                      value={form.weightKg}
                      onChange={(e) => update('weightKg', e.target.value)}
                      className="mt-1.5 h-12 text-base"
                    />
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs text-muted-foreground">
                  💡 Your data stays on your device. We never share it.
                </div>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                icon={Sparkles}
                title="What's your goal?"
                subtitle="Choose your primary objective and current activity level."
              >
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Primary Goal
                    </Label>
                    <div className="grid gap-2">
                      {GOALS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => update('goal', g)}
                          className={cn(
                            'flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all',
                            form.goal === g
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-border bg-background hover:border-emerald-300'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 mt-0.5',
                              form.goal === g
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-muted-foreground/40'
                            )}
                          >
                            {form.goal === g && (
                              <Check className="h-3 w-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{GOAL_LABELS[g]}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {GOAL_DESCRIPTIONS[g]}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Current Activity Level
                    </Label>
                    <div className="grid gap-2">
                      {ACTIVITY_LEVELS.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => update('activityLevel', a)}
                          className={cn(
                            'flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all',
                            form.activityLevel === a
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-border bg-background hover:border-emerald-300'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0',
                              form.activityLevel === a
                                ? 'border-emerald-500 bg-emerald-500'
                                : 'border-muted-foreground/40'
                            )}
                          >
                            {form.activityLevel === a && (
                              <Check className="h-3 w-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <span className="text-sm font-medium">{ACTIVITY_LABELS[a]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                icon={Dumbbell}
                title="Your schedule & diet"
                subtitle="How often can you train, and do you have any dietary preferences?"
              >
                <div className="space-y-5">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Workout Days Per Week
                    </Label>
                    <div className="grid grid-cols-7 gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => update('workoutDaysPerWeek', String(d))}
                          className={cn(
                            'h-12 rounded-lg border-2 font-bold transition-all',
                            form.workoutDaysPerWeek === String(d)
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-border bg-background hover:border-emerald-300'
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Diet Preference
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {DIETS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => update('dietPreference', d)}
                          className={cn(
                            'rounded-lg border-2 p-2.5 text-xs font-medium transition-all text-center',
                            form.dietPreference === d
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                              : 'border-border bg-background hover:border-emerald-300'
                          )}
                        >
                          {DIET_LABELS[d]}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="allergies" className="text-sm font-medium">
                      Allergies or restrictions{' '}
                      <span className="text-muted-foreground font-normal">(optional)</span>
                    </Label>
                    <Textarea
                      id="allergies"
                      placeholder="e.g. peanuts, lactose, shellfish..."
                      value={form.allergies}
                      onChange={(e) => update('allergies', e.target.value)}
                      className="mt-1.5"
                      rows={2}
                    />
                  </div>
                </div>
              </StepShell>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer nav */}
      <footer className="sticky bottom-0 border-t border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 flex items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            variant="outline"
            onClick={handleBack}
            className="h-12"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold"
          >
            {step === TOTAL_STEPS - 1 ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My Plan
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  )
}

function StepShell({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof User
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      <Card>
        <CardContent className="p-5 sm:p-6">{children}</CardContent>
      </Card>
    </div>
  )
}

function GeneratingScreen({ name, progress }: { name: string; progress: number }) {
  const stages = [
    { threshold: 20, label: 'Analyzing your profile...', icon: User },
    { threshold: 45, label: 'Calculating your targets...', icon: Target },
    { threshold: 70, label: 'Designing your workout plan...', icon: Dumbbell },
    { threshold: 90, label: 'Crafting your nutrition plan...', icon: Salad },
    { threshold: 100, label: 'Finalizing your program...', icon: Sparkles },
  ]
  const currentStage = [...stages].reverse().find((s) => progress >= s.threshold) || stages[0]
  const StageIcon = currentStage.icon

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-emerald-50/30 dark:to-emerald-950/10 px-4">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-8"
        >
          <div className="relative inline-flex">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30">
              <StageIcon className="h-12 w-12 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-2 rounded-3xl border-2 border-dashed border-emerald-400/40"
            />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-extrabold tracking-tight mb-2"
        >
          Building your plan{name ? `, ${name}` : ''}...
        </motion.h2>
        <p className="text-muted-foreground mb-8">{currentStage.label}</p>

        <div className="space-y-3">
          <Progress value={progress} className="h-2.5" />
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Powered by DeepSeek AI
          </div>
        </div>

        <div className="mt-8 grid grid-cols-5 gap-2">
          {stages.map((s) => {
            const Icon = s.icon
            const done = progress >= s.threshold
            return (
              <div
                key={s.threshold}
                className={cn(
                  'flex flex-col items-center gap-1.5 transition-opacity',
                  done ? 'opacity-100' : 'opacity-30'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    done
                      ? 'bg-emerald-500/15 text-emerald-600'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
