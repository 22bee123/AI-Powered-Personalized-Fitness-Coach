import type {
  UserProfile,
  WorkoutPlan,
  NutritionPlan,
  ChatMessage,
} from '@/lib/types/app'

const KEYS = {
  profile: 'aifit.profile',
  workoutPlan: 'aifit.workoutPlan',
  nutritionPlan: 'aifit.nutritionPlan',
  chat: 'aifit.chat',
  onboarded: 'aifit.onboarded',
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore quota errors
  }
}

function safeRemove(key: string) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export const storage = {
  getProfile: () => safeGet<UserProfile | null>(KEYS.profile, null),
  setProfile: (p: UserProfile) => safeSet(KEYS.profile, p),

  getWorkoutPlan: () => safeGet<WorkoutPlan | null>(KEYS.workoutPlan, null),
  setWorkoutPlan: (p: WorkoutPlan) => safeSet(KEYS.workoutPlan, p),

  getNutritionPlan: () => safeGet<NutritionPlan | null>(KEYS.nutritionPlan, null),
  setNutritionPlan: (p: NutritionPlan) => safeSet(KEYS.nutritionPlan, p),

  getChat: () => safeGet<ChatMessage[]>(KEYS.chat, []),
  setChat: (m: ChatMessage[]) => safeSet(KEYS.chat, m),
  clearChat: () => safeRemove(KEYS.chat),

  isOnboarded: () => safeGet<boolean>(KEYS.onboarded, false),
  setOnboarded: (v: boolean) => safeSet(KEYS.onboarded, v),

  reset: () => {
    Object.values(KEYS).forEach(safeRemove)
  },
}
