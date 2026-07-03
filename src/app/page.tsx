'use client'

import { useState, useSyncExternalStore } from 'react'
import { Landing } from '@/components/app/landing'
import { Onboarding } from '@/components/app/onboarding'
import { AppShell } from '@/components/app/app-shell'
import { WorkoutFullPage } from '@/components/app/workout-full-page'
import { storage } from '@/lib/storage'
import type {
  UserProfile,
  WorkoutPlan,
  NutritionPlan,
} from '@/lib/types/app'

type View = 'landing' | 'onboarding' | 'app' | 'workout-full'

function readInitialState() {
  if (typeof window === 'undefined') {
    return { view: 'landing' as View, profile: null, workout: null, nutrition: null }
  }
  const profile = storage.getProfile()
  const onboarded = storage.isOnboarded()
  if (profile && onboarded) {
    return {
      view: 'app' as View,
      profile,
      workout: storage.getWorkoutPlan(),
      nutrition: storage.getNutritionPlan(),
    }
  }
  return { view: 'landing' as View, profile: null, workout: null, nutrition: null }
}

// SSR-safe hydration signal using useSyncExternalStore (no setState-in-effect).
const emptySubscribe = () => () => {}
function useHydrated() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export default function Home() {
  const hydrated = useHydrated()
  const initial = readInitialState()
  const [view, setView] = useState<View>(initial.view)
  const [profile, setProfile] = useState<UserProfile | null>(initial.profile)
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(initial.workout)
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(initial.nutrition)

  const handleGetStarted = () => {
    setView('onboarding')
  }

  const handleOnboardingComplete = (data: {
    profile: UserProfile
    workoutPlan: WorkoutPlan | null
    nutritionPlan: NutritionPlan | null
  }) => {
    setProfile(data.profile)
    setWorkoutPlan(data.workoutPlan)
    setNutritionPlan(data.nutritionPlan)
    setView('app')
  }

  const handleLogout = () => {
    storage.reset()
    setProfile(null)
    setWorkoutPlan(null)
    setNutritionPlan(null)
    setView('landing')
  }

  const handleWorkoutUpdate = (plan: WorkoutPlan) => {
    setWorkoutPlan(plan)
    storage.setWorkoutPlan(plan)
  }

  const handleNutritionUpdate = (plan: NutritionPlan) => {
    setNutritionPlan(plan)
    storage.setNutritionPlan(plan)
  }

  const handleOpenWorkoutFull = () => {
    setView('workout-full')
  }

  const handleBackFromWorkout = () => {
    setView('app')
  }

  // On the server (before mount), show a neutral loader to avoid hydration mismatch
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading FitForge...</p>
        </div>
      </div>
    )
  }

  if (view === 'landing') {
    return <Landing onGetStarted={handleGetStarted} />
  }

  if (view === 'onboarding') {
    return (
      <Onboarding
        onComplete={handleOnboardingComplete}
        onBack={() => setView('landing')}
      />
    )
  }

  if (view === 'workout-full' && profile) {
    return (
      <WorkoutFullPage
        profile={profile}
        plan={workoutPlan}
        onBack={handleBackFromWorkout}
        onPlanUpdate={handleWorkoutUpdate}
      />
    )
  }

  if (view === 'app' && profile) {
    return (
      <AppShell
        profile={profile}
        workoutPlan={workoutPlan}
        nutritionPlan={nutritionPlan}
        onWorkoutUpdate={handleWorkoutUpdate}
        onNutritionUpdate={handleNutritionUpdate}
        onLogout={handleLogout}
        onOpenWorkoutFull={handleOpenWorkoutFull}
      />
    )
  }

  // Fallback
  return <Landing onGetStarted={handleGetStarted} />
}
