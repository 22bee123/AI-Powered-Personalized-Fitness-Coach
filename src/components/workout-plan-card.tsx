import type { WorkoutPlan } from '@/lib/types';
import { ClockIcon, FireIcon } from '@heroicons/react/24/outline';

export function WorkoutPlanCard({
  plan,
  selectedDayIndex,
  onStartWorkout,
}: {
  plan: WorkoutPlan | null;
  selectedDayIndex?: number | null;
  onStartWorkout?: (dayIndex: number) => void | Promise<void>;
}) {
  if (!plan) {
    return (
      <section className="card placeholder-card">
        <h3>No workout plan yet</h3>
        <p>Generate a new plan in the workout tab and the weekly split will appear here.</p>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <span className="pill">Workout plan</span>
          <h3>{plan.title}</h3>
          <p>
            {plan.difficulty} level plan created on{' '}
            {new Date(plan.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="plan-stat">
          <FireIcon className="icon" />
          <span>{plan.weeklyPlan.filter((day) => day.focus !== 'Rest' && day.focus !== 'Recovery').length} training days</span>
        </div>
      </div>

      <div className="plan-grid">
        {plan.weeklyPlan.map((day, index) => {
          const isRest = day.focus === 'Rest' || day.focus === 'Recovery';
          const isSelected = typeof selectedDayIndex === 'number' && selectedDayIndex === index;

          return (
            <article
              key={`${day.day}-${index}`}
              role={isSelected && onStartWorkout ? 'button' : undefined}
              tabIndex={isSelected && onStartWorkout ? 0 : undefined}
              onClick={isSelected && onStartWorkout ? () => onStartWorkout(index) : undefined}
              onKeyDown={
                isSelected && onStartWorkout
                  ? (event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        void onStartWorkout(index);
                      }
                    }
                  : undefined
              }
              className={`day-card ${isRest ? 'day-card--rest' : ''} ${isSelected ? 'day-card--selected' : ''} ${
                isSelected && onStartWorkout ? 'day-card--clickable' : ''
              }`}
            >
              <div className="day-card__top">
                <div>
                  <p className="day-card__day">{day.day}</p>
                  <h4>{day.focus}</h4>
                </div>
                <div className="day-card__meta">
                  {isSelected && <span className="day-card__badge">Training now</span>}
                  <span className="day-card__time">
                    <ClockIcon className="icon icon--small" />
                    {day.durationMinutes} min
                  </span>
                </div>
              </div>

              <div className="micro-list">
                <strong>Warm-up</strong>
                <ul>
                  {day.warmup.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {isSelected && onStartWorkout && !isRest && (
                <p className="day-card__hint">Click to start this workout and open the timer.</p>
              )}
            </article>
          );
        })}
      </div>

      <div className="plan-notes">
        {plan.notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
    </section>
  );
}
