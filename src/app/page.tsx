import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { PageHero } from '@/components/page-hero';
import { BoltIcon, HeartIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Workout plan',
    description: 'Generate a simple weekly split based on your goal and training frequency.',
    icon: BoltIcon,
  },
  {
    title: 'Nutrition plan',
    description: 'Build a straightforward meal structure with calories and macro targets.',
    icon: HeartIcon,
  },
  {
    title: 'Progress tracking',
    description: 'See completed workouts, active days, and a clear fitness score.',
    icon: ChartBarIcon,
  },
];

export default function HomePage() {
  return (
    <div className="page-shell">
      <SiteHeader />

      <PageHero
        eyebrow="Minimal fitness coach"
        title="Simple, black and white, easy to use."
        description="The app is now designed to be clearer and calmer, with a clean Next.js structure and a lighter interface that is easier to scan and use."
      />

      <div className="hero-actions">
        <Link href="/dashboard" className="button button-primary">
          Try demo dashboard
        </Link>
        <Link href="/sign-in" className="button button-secondary">
          Demo access
        </Link>
      </div>

      <section className="section">
        <div className="feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="feature-card">
              <div className="feature-card__top">
                <div className="pill">Built for training</div>
                <div className="feature-badge">
                  <feature.icon className="icon" />
                </div>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split-grid">
        <article className="card">
          <span className="pill">What changed</span>
          <h3>Less noise, clearer actions.</h3>
          <p>
            The layout now focuses on the three things most people need first: what the plan is, what to do next, and
            where to track progress.
          </p>
          <p>
            Colors are kept neutral, sections are separated with clear borders, and the main buttons are easy to spot.
          </p>
        </article>
        <article className="card">
          <span className="pill">How to use it</span>
          <h3>Open the demo, then pick one task.</h3>
          <p>
            Start with the dashboard, choose workout or nutrition, and use the coach only when you need advice. The UI
            stays calm so each step is obvious.
          </p>
        </article>
      </section>

      <section className="section">
        <div className="card">
          <div className="section-header">
            <div>
              <span className="pill">Workflow</span>
              <h3>Three simple actions</h3>
            </div>
          </div>
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-accent accent-cyan" />
              <p className="metric-label">1. Open</p>
              <p className="metric-value">Start</p>
              <p className="metric-hint">Go straight into the demo dashboard.</p>
            </div>
            <div className="metric-card">
              <div className="metric-accent accent-violet" />
              <p className="metric-label">2. Generate</p>
              <p className="metric-value">Plan</p>
              <p className="metric-hint">Create a workout or nutrition plan with a few inputs.</p>
            </div>
            <div className="metric-card">
              <div className="metric-accent accent-gold" />
              <p className="metric-label">3. Track</p>
              <p className="metric-value">Log</p>
              <p className="metric-hint">Mark workouts complete and follow your progress over time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
