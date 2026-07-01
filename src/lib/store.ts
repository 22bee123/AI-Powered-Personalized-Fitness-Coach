import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { demoStore } from './demo-data';
import type {
  ChatMessage,
  NutritionPlan,
  StoreData,
  WorkoutCompletion,
  WorkoutPlan,
  WorkoutSession,
} from './types';

const storePath = path.join(process.cwd(), 'data', 'fitness-store.json');

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

async function ensureStoreFile() {
  try {
    await readFile(storePath, 'utf8');
  } catch {
    await mkdir(path.dirname(storePath), { recursive: true });
    await writeFile(storePath, JSON.stringify(demoStore, null, 2), 'utf8');
  }
}

function normalizeStore(store: Partial<StoreData>): StoreData {
  return {
    profile: store.profile ?? demoStore.profile,
    workoutPlans: store.workoutPlans ?? demoStore.workoutPlans,
    nutritionPlans: store.nutritionPlans ?? demoStore.nutritionPlans,
    chatHistory: store.chatHistory ?? demoStore.chatHistory,
    completedWorkouts: store.completedWorkouts ?? demoStore.completedWorkouts,
    activeWorkoutSession:
      typeof store.activeWorkoutSession === 'undefined' ? demoStore.activeWorkoutSession : store.activeWorkoutSession,
  };
}

export async function readStore(): Promise<StoreData> {
  await ensureStoreFile();
  const raw = await readFile(storePath, 'utf8');
  return normalizeStore(JSON.parse(raw) as Partial<StoreData>);
}

export async function writeStore(store: StoreData) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), 'utf8');
}

export async function getProfile() {
  const store = await readStore();
  return clone(store.profile);
}

export async function updateProfile(partialProfile: Partial<StoreData['profile']>) {
  const store = await readStore();
  store.profile = { ...store.profile, ...partialProfile };
  await writeStore(store);
  return clone(store.profile);
}

export async function addWorkoutPlan(plan: WorkoutPlan) {
  const store = await readStore();
  store.workoutPlans = [plan, ...store.workoutPlans].slice(0, 10);
  await writeStore(store);
  return clone(plan);
}

export async function getLatestWorkoutPlan() {
  const store = await readStore();
  return clone(store.workoutPlans[0] ?? null);
}

export async function getWorkoutPlanById(id: string) {
  const store = await readStore();
  return clone(store.workoutPlans.find((plan) => plan.id === id) ?? null);
}

export async function addNutritionPlan(plan: NutritionPlan) {
  const store = await readStore();
  store.nutritionPlans = [plan, ...store.nutritionPlans].slice(0, 10);
  await writeStore(store);
  return clone(plan);
}

export async function getLatestNutritionPlan() {
  const store = await readStore();
  return clone(store.nutritionPlans[0] ?? null);
}

export async function getWorkoutPlans() {
  const store = await readStore();
  return clone(store.workoutPlans);
}

export async function getNutritionPlans() {
  const store = await readStore();
  return clone(store.nutritionPlans);
}

export async function getCompletedWorkouts() {
  const store = await readStore();
  return clone(store.completedWorkouts);
}

export async function addWorkoutCompletion(entry: WorkoutCompletion) {
  const store = await readStore();
  store.completedWorkouts = [entry, ...store.completedWorkouts];
  await writeStore(store);
  return clone(entry);
}

export async function appendChatMessages(messages: ChatMessage[]) {
  const store = await readStore();
  store.chatHistory = [...store.chatHistory, ...messages];
  await writeStore(store);
  return clone(messages);
}

export async function clearChatHistory() {
  const store = await readStore();
  store.chatHistory = [];
  await writeStore(store);
}

export async function getChatHistory() {
  const store = await readStore();
  return clone(store.chatHistory);
}

export async function getActiveWorkoutSession() {
  const store = await readStore();
  return clone(store.activeWorkoutSession);
}

export async function startWorkoutSession(session: Omit<WorkoutSession, 'id' | 'startedAt'>) {
  const store = await readStore();
  const current = store.activeWorkoutSession;

  if (current) {
    if (current.workoutPlanId === session.workoutPlanId && current.dayIndex === session.dayIndex) {
      return clone(current);
    }

    const error = new Error('A workout session is already active');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  const activeWorkoutSession: WorkoutSession = {
    id: `session_${Date.now()}`,
    startedAt: new Date().toISOString(),
    ...session,
  };

  store.activeWorkoutSession = activeWorkoutSession;
  await writeStore(store);
  return clone(activeWorkoutSession);
}

export async function endWorkoutSession(sessionId?: string) {
  const store = await readStore();
  const current = store.activeWorkoutSession;

  if (!current) {
    return null;
  }

  if (sessionId && current.id !== sessionId) {
    const error = new Error('The active workout session does not match this request');
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  store.activeWorkoutSession = null;
  await writeStore(store);
  return clone(current);
}
