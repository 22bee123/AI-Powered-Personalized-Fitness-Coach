'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClockIcon, PlayIcon, PauseCircleIcon, StopCircleIcon } from '@heroicons/react/24/outline';
import { formatSeconds, getTrainableWorkoutIndex } from '@/lib/fitness';
import type { WorkoutCompletion, WorkoutPlan, WorkoutSession } from '@/lib/types';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(url, init);
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

export function StartWorkoutPanel({
  workoutPlan,
  completedWorkouts,
  activeWorkoutSession,
  onActiveWorkoutSessionChange,
  onWorkoutCompleted,
}: {
  workoutPlan: WorkoutPlan | null;
  completedWorkouts: WorkoutCompletion[];
  activeWorkoutSession: WorkoutSession | null;
  onActiveWorkoutSessionChange: (session: WorkoutSession | null) => void;
  onWorkoutCompleted: () => Promise<void>;
}) {
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDayIndex = useMemo(
    () => getTrainableWorkoutIndex(workoutPlan, completedWorkouts, activeWorkoutSession),
    [activeWorkoutSession, completedWorkouts, workoutPlan]
  );

  const selectedDay =
    workoutPlan && typeof selectedDayIndex === 'number' ? workoutPlan.weeklyPlan[selectedDayIndex] : null;

  useEffect(() => {
    if (!activeWorkoutSession) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeWorkoutSession]);

  const elapsedSeconds = activeWorkoutSession
    ? Math.max(0, Math.floor((now - Date.parse(activeWorkoutSession.startedAt)) / 1000))
    : 0;

  const targetSeconds = activeWorkoutSession
    ? activeWorkoutSession.durationMinutes * 60
    : selectedDay
      ? selectedDay.durationMinutes * 60
      : 0;

  const progress = targetSeconds > 0 ? Math.min(100, (elapsedSeconds / targetSeconds) * 100) : 0;

  const startWorkout = async () => {
    if (!workoutPlan || typeof selectedDayIndex !== 'number' || !selectedDay) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchJson<{ activeWorkoutSession: WorkoutSession; message?: string }>(
        '/api/workout-session/start',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutPlanId: workoutPlan.id,
            dayIndex: selectedDayIndex,
          }),
        }
      );

      if (!data?.activeWorkoutSession) {
        throw new Error(data?.message || 'Could not start workout');
      }

      onActiveWorkoutSessionChange(data.activeWorkoutSession);
      setNow(Date.now());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not start workout');
    } finally {
      setLoading(false);
    }
  };

  const finishWorkout = async () => {
    if (!workoutPlan || !selectedDay) {
      return;
    }

    setFinishing(true);
    setError(null);

    try {
      if (activeWorkoutSession) {
        const ended = await fetchJson<{ activeWorkoutSession: WorkoutSession; message?: string }>(
          '/api/workout-session/end',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: activeWorkoutSession.id }),
          }
        );

        if (!ended?.activeWorkoutSession) {
          throw new Error(ended?.message || 'Could not finish workout');
        }
      }

      const completion = await fetchJson<{ completedWorkout: WorkoutCompletion; message?: string }>(
        '/api/workout-complete',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workoutPlanId: workoutPlan.id,
            dayIndex: typeof selectedDayIndex === 'number' ? selectedDayIndex : undefined,
            day: selectedDay.day,
            focus: selectedDay.focus,
            totalDuration: elapsedSeconds,
            exercisesCompleted: selectedDay.exercises.length,
          }),
        }
      );

      if (!completion?.completedWorkout) {
        throw new Error(completion?.message || 'Could not save workout completion');
      }

      onActiveWorkoutSessionChange(null);
      await onWorkoutCompleted();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not finish workout');
    } finally {
      setFinishing(false);
    }
  };

  const displayPlan = selectedDay;

  if (!workoutPlan) {
    return (
      <section className="card workout-session-card">
        <span className="pill">Start workout</span>
        <h3>No workout plan yet</h3>
        <p>Create a workout plan first, then start the session from here.</p>
      </section>
    );
  }

  if (!displayPlan) {
    return (
      <section className="card workout-session-card">
        <span className="pill">Start workout</span>
        <h3>No trainable workout left</h3>
        <p>You have already completed every training workout in this plan.</p>
      </section>
    );
  }

  return (
    <section className="card workout-session-card">
      <div className="section-header">
        <div>
          <span className="pill">Start workout</span>
          <h3>{activeWorkoutSession ? 'Workout in progress' : 'One workout at a time'}</h3>
          <p>Only this workout is available right now. Everything else stays locked until you finish it.</p>
        </div>
        <div className="plan-stat">
          <ClockIcon className="icon" />
          <span>{activeWorkoutSession ? 'Timer running' : 'Ready to start'}</span>
        </div>
      </div>

      <div className="session-hero">
        <div>
          <p className="day-card__day">{displayPlan.day}</p>
          <h4>{displayPlan.focus}</h4>
          <p>
            {displayPlan.durationMinutes} min training block with {displayPlan.exercises.length} exercises
          </p>
        </div>
        <div className="session-timer">
          <span>{activeWorkoutSession ? 'Elapsed' : 'Timer'}</span>
          <strong>{formatSeconds(activeWorkoutSession ? elapsedSeconds : 0)}</strong>
          <small>Target {formatSeconds(targetSeconds)}</small>
        </div>
      </div>

      <div className="session-progress">
        <div className="session-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="session-grid">
        <div className="micro-list">
          <strong>Warm-up</strong>
          <ul>
            {displayPlan.warmup.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="micro-list">
          <strong>Exercises</strong>
          <ul>
            {displayPlan.exercises.map((exercise) => (
              <li key={exercise.name}>
                {exercise.name} - {exercise.sets} sets - {exercise.reps}
              </li>
            ))}
          </ul>
        </div>

        <div className="micro-list">
          <strong>Cooldown</strong>
          <ul>
            {displayPlan.cooldown.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {error && <div className="dashboard-note">{error}</div>}

      <div className="session-actions">
        {!activeWorkoutSession ? (
          <button type="button" className="button button-primary" onClick={startWorkout} disabled={loading}>
            <PlayIcon className="icon icon--small" />
            {loading ? 'Starting...' : 'Start workout'}
          </button>
        ) : (
          <button type="button" className="button button-primary" onClick={finishWorkout} disabled={finishing}>
            <StopCircleIcon className="icon icon--small" />
            {finishing ? 'Saving...' : 'Finish workout'}
          </button>
        )}

        <div className="session-lock">
          <PauseCircleIcon className="icon icon--small" />
          <span>Only this workout can be trained until the session is completed.</span>
        </div>
      </div>
    </section>
  );
}
