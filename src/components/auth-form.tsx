'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './auth-provider';

export function AuthForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [name, setName] = useState('Demo Athlete');
  const [email, setEmail] = useState('alex@example.com');
  const [loading, setLoading] = useState(false);

  return (
    <div className="auth-card">
      <div className="auth-copy">
        <span className="pill">Minimal mode</span>
        <h1>Demo access</h1>
        <p>Skip registration and jump straight into the dashboard with a prefilled test session.</p>
      </div>

      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          signIn({
            name: name.trim() || 'Demo Athlete',
            email: email.trim() || 'demo@example.com',
          });
          router.push('/dashboard');
          setLoading(false);
        }}
      >
        <label>
          Demo name
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Demo Athlete" />
        </label>

        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="alex@example.com"
          />
        </label>

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Opening dashboard...' : 'Enter demo dashboard'}
        </button>

        <p className="small-note">
          This is a local demo session. No account creation is needed.
        </p>
      </form>
    </div>
  );
}
