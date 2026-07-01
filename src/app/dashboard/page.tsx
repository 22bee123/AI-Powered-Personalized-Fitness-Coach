'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { BrandMark } from '@/components/brand-mark';
import { CoachChat } from '@/components/coach-chat';
import { MetricCard } from '@/components/metric-card';
import { NutritionPlanCard } from '@/components/nutrition-plan-card';
import { ProfileEditor } from '@/components/profile-editor';
import { StartWorkoutPanel } from '@/components/start-workout-panel';
import { WorkoutPlanCard } from '@/components/workout-plan-card';
import { useAuth } from '@/components/auth-provider';
import { calculateDashboardStats, getTrainableWorkoutIndex } from '@/lib/fitness';
import type {
  ChatMessage,
  NutritionPlan,
  Profile,
  WorkoutCompletion,
  WorkoutPlan,
  WorkoutSession,
} from '@/lib/types';

type TabId = 'overview' | 'coach' | 'workout' | 'nutrition' | 'profile';

const tabs: Array<{ id: TabId; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'coach', label: 'AI Coach', icon: ChatBubbleLeftRightIcon },
  { id: 'workout', label: 'Workout', icon: ClipboardDocumentListIcon },
  { id: 'nutrition', label: 'Nutrition', icon: HeartIcon },
  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
];

const defaultPlanSettings = {
  difficulty: 'intermediate',
  focus: 'strength',
  workoutDaysPerWeek: '5',
  goal: 'Build lean muscle with steady energy',
};

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(url, init);
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutCompletion[]>([]);
  const [activeWorkoutSession, setActiveWorkoutSession] = useState<WorkoutSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachLoading, setCoachLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planSettings, setPlanSettings] = useState(defaultPlanSettings);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileData, workoutData, nutritionData, completedData, chatData, sessionData] = await Promise.all([
          fetchJson<{ profile: Profile }>('/api/users/profile'),
          fetchJson<{ workoutPlan: WorkoutPlan }>('/api/workouts/latest'),
          fetchJson<{ nutritionPlan: NutritionPlan }>('/api/nutrition/latest'),
          fetchJson<{ completedWorkouts: WorkoutCompletion[] }>('/api/workout-complete'),
          fetchJson<{ chatHistory: ChatMessage[] }>('/api/coach/history'),
          fetchJson<{ activeWorkoutSession: WorkoutSession }>('/api/workout-session/active'),
        ]);

        if (profileData?.profile) {
          setProfile(profileData.profile);
          setPlanSettings((current) => ({
            ...current,
            difficulty: profileData.profile.fitnessLevel.toLowerCase().includes('beginner')
              ? 'beginner'
              : profileData.profile.fitnessLevel.toLowerCase().includes('advanced')
                ? 'advanced'
                : 'intermediate',
            workoutDaysPerWeek: profileData.profile.workoutDaysPerWeek,
            goal: profileData.profile.goal,
          }));
        }

        setWorkoutPlan(workoutData?.workoutPlan ?? null);
        setNutritionPlan(nutritionData?.nutritionPlan ?? null);
        setCompletedWorkouts(completedData?.completedWorkouts ?? []);
        setMessages(chatData?.chatHistory ?? []);
        setActiveWorkoutSession(sessionData?.activeWorkoutSession ?? null);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(
    () => calculateDashboardStats(completedWorkouts, profile?.weightKg ?? 74),
    [completedWorkouts, profile?.weightKg]
  );

  const trainableWorkoutIndex = useMemo(
    () => getTrainableWorkoutIndex(workoutPlan, completedWorkouts, activeWorkoutSession),
    [activeWorkoutSession, completedWorkouts, workoutPlan]
  );

  const recentActivity = completedWorkouts.slice(0, 4);
  const displayName = user?.name || profile?.name || 'Demo athlete';

  const refreshCompletedWorkouts = async () => {
    const completedData = await fetchJson<{ completedWorkouts: WorkoutCompletion[] }>('/api/workout-complete');
    setCompletedWorkouts(completedData?.completedWorkouts ?? []);
  };

  const generateWorkoutPlan = async () => {
    setPlanLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...planSettings,
          weight: profile?.weightKg,
          height: profile?.heightCm,
          age: profile?.age,
          fitnessLevel: profile?.fitnessLevel,
          fitnessGoals: [planSettings.goal],
          focusAreas: [planSettings.focus],
        }),
      });

      const data = (await response.json()) as { workoutPlan?: WorkoutPlan; message?: string };
      if (!response.ok || !data.workoutPlan) {
        throw new Error(data.message || 'Failed to generate workout plan');
      }

      setWorkoutPlan(data.workoutPlan);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to generate workout plan');
    } finally {
      setPlanLoading(false);
    }
  };

  const generateNutritionPlan = async () => {
    setPlanLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nutrition/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...planSettings,
          weight: profile?.weightKg,
          workoutDaysPerWeek: planSettings.workoutDaysPerWeek,
          fitnessGoals: [planSettings.goal],
        }),
      });

      const data = (await response.json()) as { nutritionPlan?: NutritionPlan; message?: string };
      if (!response.ok || !data.nutritionPlan) {
        throw new Error(data.message || 'Failed to generate nutrition plan');
      }

      setNutritionPlan(data.nutritionPlan);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to generate nutrition plan');
    } finally {
      setPlanLoading(false);
    }
  };

  const saveProfile = async (nextProfile: Profile) => {
    setSavingProfile(true);
    setError(null);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextProfile),
      });

      const data = (await response.json()) as { profile?: Profile; message?: string };
      if (!response.ok || !data.profile) {
        throw new Error(data.message || 'Failed to save profile');
      }

      setProfile(data.profile);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const startWorkoutFromPlan = async (dayIndex: number) => {
    if (!workoutPlan) {
      return;
    }

    const targetDay = workoutPlan.weeklyPlan[dayIndex];
    if (!targetDay || targetDay.focus === 'Rest' || targetDay.focus === 'Recovery') {
      return;
    }

    setError(null);

    try {
      const response = await fetch('/api/workout-session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workoutPlanId: workoutPlan.id,
          dayIndex,
        }),
      });

      const data = (await response.json()) as { activeWorkoutSession?: WorkoutSession; message?: string };
      if (!response.ok || !data.activeWorkoutSession) {
        throw new Error(data.message || 'Could not start workout');
      }

      setActiveWorkoutSession(data.activeWorkoutSession);
      setActiveTab('workout');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not start workout');
    }
  };

  const sendCoachMessage = async (message: string) => {
    setCoachLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = (await response.json()) as { response?: string; aiMessage?: ChatMessage; message?: string };
      if (!response.ok || (!data.response && !data.aiMessage)) {
        throw new Error(data.message || 'Failed to get coach response');
      }

      const aiMessage: ChatMessage =
        data.aiMessage ?? {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.response || 'I am ready to help with your training plan.',
          timestamp: new Date().toISOString(),
        };

      setMessages((current) => [...current, aiMessage]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to get coach response');
    } finally {
      setCoachLoading(false);
    }
  };

  const clearCoachHistory = async () => {
    await fetch('/api/coach/history', { method: 'DELETE' });
    setMessages([]);
  };

  return (
    <div>
      <header className="dashboard-header">
        <BrandMark compact />
        <div className="dashboard-header__actions">
          <span className="pill">{profile ? `${profile.fitnessLevel} profile` : 'Demo mode'}</span>
          <button type="button" className="button button-secondary" onClick={() => signOut()}>
            <ArrowRightOnRectangleIcon className="icon icon--small" />
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-layout">
        <section className="dashboard-hero">
          <div className="dashboard-hero__top">
            <div>
              <span className="pill">Training cockpit</span>
              <h1>Welcome back, {displayName.split(' ')[0]}.</h1>
              <p>
                Your Next.js rebuild keeps the key fitness flows in one place: generate plans, train one workout at a
                time, talk to the coach, and track progress.
              </p>
            </div>
            <div className="dashboard-toolbar">
              <button type="button" className="button button-primary" onClick={() => setActiveTab('workout')}>
                <SparklesIcon className="icon icon--small" />
                {activeWorkoutSession ? 'Continue workout' : 'Start workout'}
              </button>
              <button type="button" className="button button-primary" onClick={() => setActiveTab('coach')}>
                <ChatBubbleLeftRightIcon className="icon icon--small" />
                Ask coach
              </button>
            </div>
          </div>

          {error && (
            <div className="dashboard-note" style={{ marginTop: 18 }}>
              {error}
            </div>
          )}
        </section>

        <section className="metric-grid">
          <MetricCard
            label="Workouts completed"
            value={loading ? '...' : String(stats.workoutsCompleted)}
            hint="Completed sessions tracked locally"
            accent="accent-cyan"
          />
          <MetricCard
            label="Calories burned"
            value={loading ? '...' : stats.caloriesBurned.toLocaleString()}
            hint="Estimated from completed workouts"
            accent="accent-violet"
          />
          <MetricCard
            label="Active days"
            value={loading ? '...' : String(stats.activeDays)}
            hint="Unique training days in the log"
            accent="accent-gold"
          />
          <MetricCard
            label="Fitness score"
            value={loading ? '...' : String(stats.fitnessScore)}
            hint="Blends consistency and intensity"
            accent="accent-green"
          />
        </section>

        <nav className="tab-row" aria-label="Dashboard sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="icon icon--small" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {activeTab === 'overview' && (
          <section className="split-grid">
            <WorkoutPlanCard
              plan={workoutPlan}
              selectedDayIndex={trainableWorkoutIndex}
              onStartWorkout={startWorkoutFromPlan}
            />
            <div className="split-panel">
              <NutritionPlanCard plan={nutritionPlan} />
              <section className="card">
                <div className="section-header">
                  <div>
                    <span className="pill">Recent activity</span>
                    <h3>Training log</h3>
                  </div>
                </div>
                <div className="recent-list">
                  {recentActivity.length === 0 && <div className="recent-item">No workouts logged yet.</div>}
                  {recentActivity.map((workout) => (
                    <article key={workout.id} className="recent-item">
                      <strong>{workout.focus}</strong>
                      <span>
                        {workout.day} · {Math.round(workout.totalDuration / 60)} min ·{' '}
                        {new Date(workout.completedAt).toLocaleDateString()}
                      </span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
        )}

        {activeTab === 'coach' && (
          <CoachChat messages={messages} loading={coachLoading} onSend={sendCoachMessage} onClear={clearCoachHistory} />
        )}

        {activeTab === 'workout' && (
          <section className="dashboard-grid">
            <div className="split-grid">
              <section className="card">
                <div className="section-header">
                  <div>
                    <span className="pill">Workout generator</span>
                    <h3>Shape the next weekly split</h3>
                    <p>Adjust the inputs, then generate a plan that feels closer to the athlete you want to build.</p>
                  </div>
                </div>

                <div className="form-panel">
                  <div className="form-panel__grid">
                    <label>
                      Difficulty
                      <select
                        value={planSettings.difficulty}
                        onChange={(event) =>
                          setPlanSettings((current) => ({ ...current, difficulty: event.target.value }))
                        }
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </label>
                    <label>
                      Focus
                      <select
                        value={planSettings.focus}
                        onChange={(event) => setPlanSettings((current) => ({ ...current, focus: event.target.value }))}
                      >
                        <option value="strength">Strength</option>
                        <option value="fatLoss">Fat loss</option>
                        <option value="endurance">Endurance</option>
                        <option value="mobility">Mobility</option>
                      </select>
                    </label>
                    <label>
                      Days per week
                      <select
                        value={planSettings.workoutDaysPerWeek}
                        onChange={(event) =>
                          setPlanSettings((current) => ({ ...current, workoutDaysPerWeek: event.target.value }))
                        }
                      >
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Goal
                    <textarea
                      rows={4}
                      value={planSettings.goal}
                      onChange={(event) => setPlanSettings((current) => ({ ...current, goal: event.target.value }))}
                    />
                  </label>
                </div>

                <button type="button" className="button button-primary" onClick={generateWorkoutPlan} disabled={planLoading}>
                  {planLoading ? 'Generating...' : 'Generate workout plan'}
                </button>
              </section>

              <StartWorkoutPanel
                workoutPlan={workoutPlan}
                completedWorkouts={completedWorkouts}
                activeWorkoutSession={activeWorkoutSession}
                onActiveWorkoutSessionChange={setActiveWorkoutSession}
                onWorkoutCompleted={refreshCompletedWorkouts}
              />
            </div>

            <WorkoutPlanCard
              plan={workoutPlan}
              selectedDayIndex={trainableWorkoutIndex}
              onStartWorkout={startWorkoutFromPlan}
            />
          </section>
        )}

        {activeTab === 'nutrition' && (
          <section className="split-grid">
            <section className="card">
              <div className="section-header">
                <div>
                  <span className="pill">Nutrition generator</span>
                  <h3>Create a meal structure that supports training</h3>
                  <p>Feed the plan builder your current goal and the weekly work demand.</p>
                </div>
              </div>

              <div className="form-panel">
                <div className="form-panel__grid">
                  <label>
                    Goal angle
                    <select
                      value={planSettings.goal}
                      onChange={(event) => setPlanSettings((current) => ({ ...current, goal: event.target.value }))}
                    >
                      <option value="Build lean muscle with steady energy">Build muscle</option>
                      <option value="Lose fat while keeping strength high">Lose fat</option>
                      <option value="Improve endurance and training recovery">Performance</option>
                      <option value="Support mobility and general health">General health</option>
                    </select>
                  </label>
                  <label>
                    Workout days
                    <select
                      value={planSettings.workoutDaysPerWeek}
                      onChange={(event) =>
                        setPlanSettings((current) => ({ ...current, workoutDaysPerWeek: event.target.value }))
                      }
                    >
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </label>
                </div>
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={generateNutritionPlan}
                disabled={planLoading}
              >
                {planLoading ? 'Generating...' : 'Generate nutrition plan'}
              </button>
            </section>

            <NutritionPlanCard plan={nutritionPlan} />
          </section>
        )}

        {activeTab === 'profile' && <ProfileEditor profile={profile} onSave={saveProfile} saving={savingProfile} />}

        {loading && (
          <section className="card">
            <p>Loading dashboard data...</p>
          </section>
        )}
      </main>
    </div>
  );
}
