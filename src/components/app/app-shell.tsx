'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity,
  MessageSquare,
  Dumbbell,
  Salad,
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChatTab } from '@/components/app/chat-tab'
import { NutritionPlanTab } from '@/components/app/nutrition-plan-tab'
import type {
  UserProfile,
  WorkoutPlan,
  NutritionPlan,
} from '@/lib/types/app'
import { GOAL_LABELS } from '@/lib/types/app'

type TabId = 'chat' | 'workout' | 'nutrition'

interface AppShellProps {
  profile: UserProfile
  workoutPlan: WorkoutPlan | null
  nutritionPlan: NutritionPlan | null
  onWorkoutUpdate: (plan: WorkoutPlan) => void
  onNutritionUpdate: (plan: NutritionPlan) => void
  onLogout: () => void
  onOpenWorkoutFull: () => void
}

const TABS: { id: TabId; label: string; icon: typeof MessageSquare }[] = [
  { id: 'chat', label: 'Coach', icon: MessageSquare },
  { id: 'workout', label: 'Workout', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Salad },
]

export function AppShell({
  profile,
  workoutPlan,
  nutritionPlan,
  onNutritionUpdate,
  onLogout,
  onOpenWorkoutFull,
}: AppShellProps) {
  const [activeTab, setActiveTab] = useState<TabId>('chat')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleTabClick = (tab: TabId) => {
    if (tab === 'workout') {
      // Workout opens a full-page view (no navbar/tabs)
      onOpenWorkoutFull()
    } else {
      setActiveTab(tab)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top header */}
      <header className="shrink-0 border-b border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Activity className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-sm">
                Fit<span className="text-emerald-500">Forge</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                {GOAL_LABELS[profile.goal]}
              </span>
            </div>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-card pl-1.5 pr-3 py-1 hover:bg-muted/50 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 font-semibold text-xs">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium hidden sm:block">{profile.name}</span>
          </button>
        </div>

        {/* Profile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-4 top-14 z-50 w-64 rounded-xl border border-border/60 bg-card shadow-xl overflow-hidden"
              >
                <div className="p-4 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 font-semibold">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.age} yrs · {profile.weightKg}kg
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <div className="px-2 py-1.5 text-xs text-muted-foreground">
                    <User className="h-3.5 w-3.5 inline mr-1.5" />
                    {GOAL_LABELS[profile.goal]}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full justify-start text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Reset & Start Over
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* Tab content — only chat & nutrition render inline; workout opens full page */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeTab === 'chat' && (
              <ChatTab
                profile={profile}
                workoutPlan={workoutPlan}
                nutritionPlan={nutritionPlan}
              />
            )}
            {activeTab === 'nutrition' && (
              <ScrollArea>
                <div className="max-w-2xl mx-auto px-4 py-5 pb-28">
                  <NutritionPlanTab
                    profile={profile}
                    plan={nutritionPlan}
                    onUpdate={onNutritionUpdate}
                  />
                </div>
              </ScrollArea>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom tab bar */}
      <nav className="shrink-0 border-t border-border/40 bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 px-6 py-2 transition-colors',
                  active
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="activeTabBar"
                    className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-emerald-500"
                    transition={{ type: 'spring', duration: 0.4 }}
                  />
                )}
                <Icon
                  className={cn('h-5 w-5 transition-transform', active && 'scale-110')}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function ScrollArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin">{children}</div>
  )
}
