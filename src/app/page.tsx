'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dumbbell,
  LayoutDashboard,
  ListChecks,
  TrendingUp,
  Target,
  Sparkles,
  Activity,
  Flame,
  Menu,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Dashboard } from '@/components/fitness/dashboard'
import { WorkoutsView } from '@/components/fitness/workouts-view'
import { ExerciseLibrary } from '@/components/fitness/exercise-library'
import { ProgressView } from '@/components/fitness/progress-view'
import { GoalsView } from '@/components/fitness/goals-view'
import { CoachView } from '@/components/fitness/coach-view'

type TabId = 'dashboard' | 'workouts' | 'exercises' | 'progress' | 'goals' | 'coach'

const TABS: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'exercises', label: 'Library', icon: ListChecks },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'coach', label: 'AI Coach', icon: Sparkles },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    setMobileMenuOpen(false)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-emerald-50/30 dark:to-emerald-950/10">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight leading-none">
                Pulse<span className="text-emerald-500">Fit</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">
                Train Smarter
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 -z-10 rounded-lg bg-emerald-500/10"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}
                </button>
              )
            })}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border/60 bg-background"
            >
              <div className="grid grid-cols-3 gap-2 p-4">
                {TABS.map((tab) => {
                  const Icon = tab.icon
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-lg p-3 text-xs font-medium transition-colors',
                        active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'text-muted-foreground hover:bg-muted/50'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard onNavigate={(tab: TabId) => handleTabChange(tab)} />
            )}
            {activeTab === 'workouts' && <WorkoutsView />}
            {activeTab === 'exercises' && <ExerciseLibrary />}
            {activeTab === 'progress' && <ProgressView />}
            {activeTab === 'goals' && <GoalsView />}
            {activeTab === 'coach' && <CoachView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 bg-background/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>PulseFit — Train smarter, not harder</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Built with Next.js</span>
            <span>·</span>
            <span>Your data stays local</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
