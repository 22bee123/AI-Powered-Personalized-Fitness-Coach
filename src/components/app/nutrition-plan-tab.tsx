'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Salad,
  Droplets,
  Clock,
  RefreshCw,
  Loader2,
  Check,
  X,
  Lightbulb,
  Utensils,
  Apple,
  Beef,
  Wheat,
  Flame,
  Sparkles,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import type { UserProfile, NutritionPlan } from '@/lib/types/app'
import { DIET_LABELS } from '@/lib/types/app'

interface NutritionTabProps {
  profile: UserProfile | null
  plan: NutritionPlan | null
  onUpdate: (plan: NutritionPlan) => void
}

export function NutritionPlanTab({ profile, plan, onUpdate }: NutritionTabProps) {
  const [regenerating, setRegenerating] = useState(false)
  const { toast } = useToast()

  const handleRegenerate = async () => {
    if (!profile) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/generate-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, planTypes: ['nutrition'] }),
      })
      const data = await res.json()
      if (data.nutrition) {
        const newPlan = { ...data.nutrition, generatedAt: new Date().toISOString() }
        onUpdate(newPlan)
        toast({ title: 'Nutrition plan refreshed! 🥗', duration: 2500 })
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
          <Salad className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg">No nutrition plan yet</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs">
          Generate a personalized nutrition plan with meals and macro targets.
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
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Nutrition Plan
            </>
          )}
        </Button>
      </div>
    )
  }

  // Calculate macro percentages
  const proteinCal = plan.proteinG * 4
  const carbsCal = plan.carbsG * 4
  const fatsCal = plan.fatsG * 9
  const totalMacroCal = proteinCal + carbsCal + fatsCal || 1
  const proteinPct = Math.round((proteinCal / totalMacroCal) * 100)
  const carbsPct = Math.round((carbsCal / totalMacroCal) * 100)
  const fatsPct = Math.round((fatsCal / totalMacroCal) * 100)

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-br from-orange-500 to-amber-600 p-5 text-white">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Salad className="h-5 w-5" />
              <span className="text-sm font-medium text-orange-50/90">
                Your Nutrition Plan
              </span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-extrabold">{plan.dailyCalories}</span>
              <span className="text-sm text-orange-50/90 mb-1">kcal / day</span>
            </div>
            <p className="text-sm text-orange-50/90">{plan.summary}</p>
            {profile && (
              <Badge className="bg-white/20 text-white border-0 hover:bg-white/20 mt-3">
                {DIET_LABELS[profile.dietPreference]}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Macros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Daily Macros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <MacroCard
              icon={Beef}
              label="Protein"
              grams={plan.proteinG}
              pct={proteinPct}
              color="emerald"
            />
            <MacroCard
              icon={Wheat}
              label="Carbs"
              grams={plan.carbsG}
              pct={carbsPct}
              color="amber"
            />
            <MacroCard
              icon={Apple}
              label="Fats"
              grams={plan.fatsG}
              pct={fatsPct}
              color="orange"
            />
          </div>
          {/* Macro distribution bar */}
          <div className="flex h-2.5 rounded-full overflow-hidden bg-muted">
            <div className="bg-emerald-500" style={{ width: `${proteinPct}%` }} />
            <div className="bg-amber-500" style={{ width: `${carbsPct}%` }} />
            <div className="bg-orange-500" style={{ width: `${fatsPct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Protein {proteinPct}%</span>
            <span>Carbs {carbsPct}%</span>
            <span>Fats {fatsPct}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Hydration */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 shrink-0">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Hydration Target</p>
            <p className="text-sm text-muted-foreground">
              {plan.waterLiters} liters of water per day
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meals */}
      <div>
        <h2 className="text-base font-semibold mb-3 flex items-center gap-2 px-1">
          <Utensils className="h-4 w-4 text-emerald-600" />
          Daily Meals
        </h2>
        <div className="space-y-3">
          {plan.meals.map((meal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm">{meal.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-0.5" />
                          {meal.time}
                        </Badge>
                      </div>
                    </div>
                    <Badge className="bg-orange-500/15 text-orange-600 border-0">
                      {meal.calories} kcal
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {meal.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {meal.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      💡 {meal.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Foods to emphasize */}
      {plan.foods && plan.foods.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              Foods to Emphasize
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plan.foods.map((food, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                >
                  {food}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Foods to avoid */}
      {plan.avoid && plan.avoid.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <X className="h-4 w-4 text-rose-500" />
              Limit These
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plan.avoid.map((food, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20"
                >
                  {food}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {plan.tips && plan.tips.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Nutrition Tips
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

function MacroCard({
  icon: Icon,
  label,
  grams,
  pct,
  color,
}: {
  icon: typeof Beef
  label: string
  grams: number
  pct: number
  color: 'emerald' | 'amber' | 'orange'
}) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  }
  return (
    <div className="rounded-xl border border-border/60 p-3 text-center">
      <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg mb-1.5 ${colorMap[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-lg font-bold leading-none">{grams}g</div>
      <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
      <div className="text-[10px] text-muted-foreground/70">{pct}%</div>
    </div>
  )
}
