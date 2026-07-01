'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '@/lib/types';

export function ProfileEditor({
  profile,
  onSave,
  saving,
}: {
  profile: Profile | null;
  onSave: (profile: Profile) => Promise<void>;
  saving: boolean;
}) {
  const [form, setForm] = useState<Profile | null>(profile);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  if (!form) {
    return (
      <section className="card placeholder-card">
        <h3>Profile unavailable</h3>
        <p>Load the profile to edit it here.</p>
      </section>
    );
  }

  const update = (key: keyof Profile, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <span className="pill">Profile</span>
          <h3>Personalize your plan</h3>
          <p>These values feed the plan generator and training stats.</p>
        </div>
      </div>

      <div className="profile-grid">
        <label>
          Name
          <input value={form.name} onChange={(event) => update('name', event.target.value)} />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(event) => update('email', event.target.value)} />
        </label>
        <label>
          Age
          <input type="number" value={form.age} onChange={(event) => update('age', Number(event.target.value))} />
        </label>
        <label>
          Weight (kg)
          <input
            type="number"
            value={form.weightKg}
            onChange={(event) => update('weightKg', Number(event.target.value))}
          />
        </label>
        <label>
          Fitness level
          <input value={form.fitnessLevel} onChange={(event) => update('fitnessLevel', event.target.value)} />
        </label>
        <label>
          Workout days
          <input
            value={form.workoutDaysPerWeek}
            onChange={(event) => update('workoutDaysPerWeek', event.target.value)}
          />
        </label>
        <label className="profile-grid__wide">
          Goal
          <textarea value={form.goal} onChange={(event) => update('goal', event.target.value)} rows={3} />
        </label>
      </div>

      <button
        type="button"
        className="button button-primary"
        onClick={() => onSave(form)}
        disabled={saving}
      >
        {saving ? 'Saving profile...' : 'Save profile'}
      </button>
    </section>
  );
}

