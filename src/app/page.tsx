import Link from 'next/link';
import {
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  ClockIcon,
  HeartIcon,
  RectangleGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { SiteHeader } from '@/components/site-header';

const features = [
  {
    title: 'One workout at a time',
    description: 'The app surfaces a single training block so the next action is always obvious.',
    icon: RectangleGroupIcon,
  },
  {
    title: 'Built-in workout timer',
    description: 'Click a workout card to start training, then track the session with a live timer.',
    icon: ClockIcon,
  },
  {
    title: 'Completed workout log',
    description: 'Every finished workout is added to your history so progress stays visible.',
    icon: CheckBadgeIcon,
  },
  {
    title: 'AI coach support',
    description: 'Ask for guidance when you need it without leaving the dashboard.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    title: 'Nutrition planning',
    description: 'Generate a simple meal structure with calories and macro targets.',
    icon: HeartIcon,
  },
  {
    title: 'No signup required',
    description: 'Try the experience immediately with a demo-first flow built for testing.',
    icon: SparklesIcon,
  },
];

const steps = [
  {
    number: '01',
    title: 'Open the demo',
    description: 'Jump straight into the dashboard and review the workout plan that is ready to train.',
  },
  {
    number: '02',
    title: 'Start the workout',
    description: 'Click the workout card to launch the timer and begin the session you are assigned.',
  },
  {
    number: '03',
    title: 'Finish and log it',
    description: 'When the timer is done, complete the workout and it is added to your history.',
  },
];

const proofPoints = [
  { label: 'Active workout', value: '1' },
  { label: 'Core actions', value: '3' },
  { label: 'Demo friction', value: '0' },
  { label: 'Plan types', value: '2' },
];

export default function HomePage() {
  return (
    <div className="page-shell page-shell--landing">
      <SiteHeader
        showDefaultLinks={false}
        actions={
          <>
            <Link href="#features" className="text-link">
              Features
            </Link>
            <Link href="#workflow" className="text-link">
              Workflow
            </Link>
            <Link href="/dashboard" className="button button-primary button--compact">
              Open demo
            </Link>
          </>
        }
      />

      <main className="landing-page">
        <section className="hero hero--landing">
          <div className="landing-hero">
            <div className="landing-hero__copy">
              <span className="pill">Minimal training platform</span>
              <div className="hero-copy">
                <h1>Train with a website that feels clear, modern, and immediately usable.</h1>
                <p>
                  AI Fitness Coach is built like a real product site and a real training tool: focused workout plans,
                  a live timer, completed workout tracking, nutrition support, and an AI coach when you need guidance.
                </p>
              </div>

              <div className="hero-actions">
                <Link href="/dashboard" className="button button-primary">
                  Open demo dashboard
                  <ArrowRightIcon className="icon icon--small" />
                </Link>
                <Link href="#features" className="button button-secondary">
                  Explore features
                </Link>
              </div>

              <div className="trust-row" aria-label="Quick product highlights">
                <span className="trust-chip">No signup required</span>
                <span className="trust-chip">Workout timer built in</span>
                <span className="trust-chip">Completed workouts tracked</span>
                <span className="trust-chip">Black and white UI</span>
              </div>
            </div>

            <aside className="hero-preview card" aria-label="Workout preview">
              <div className="preview-top">
                <div>
                  <span className="pill">Live session</span>
                  <h2>Upper body strength</h2>
                </div>
                <span className="preview-status">Timer active</span>
              </div>

              <div className="preview-timer">
                <strong>24:18</strong>
                <span>45 minute training block</span>
              </div>

              <div className="preview-list">
                <div className="preview-item">
                  <span className="preview-item__index">1</span>
                  <div>
                    <strong>Warm up</strong>
                    <p>Get moving with shoulder circles and light activation drills.</p>
                  </div>
                </div>
                <div className="preview-item preview-item--current">
                  <span className="preview-item__index">2</span>
                  <div>
                    <strong>Working set</strong>
                    <p>Press, row, and accessory work inside one tracked workout session.</p>
                  </div>
                </div>
                <div className="preview-item">
                  <span className="preview-item__index">3</span>
                  <div>
                    <strong>Finish</strong>
                    <p>Complete the timer, log the session, and move it into completed workouts.</p>
                  </div>
                </div>
              </div>

              <div className="proof-grid">
                {proofPoints.map((point) => (
                  <div key={point.label} className="proof-card">
                    <strong>{point.value}</strong>
                    <span>{point.label}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section id="features" className="section">
          <div className="section-header">
            <div>
              <span className="pill">Features</span>
              <h3>Everything is designed around one simple training flow</h3>
            </div>
            <p className="section-note">
              The landing page matches the product: precise, minimal, and focused on the next action.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-card__top">
                  <span className="feature-step">{feature.title}</span>
                  <div className="feature-badge">
                    <feature.icon className="icon" />
                  </div>
                </div>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="section split-grid">
          <article className="card">
            <div className="section-header">
              <div>
                <span className="pill">Workflow</span>
                <h3>How the product works</h3>
              </div>
            </div>

            <div className="workflow-grid">
              {steps.map((step) => (
                <div key={step.number} className="workflow-card">
                  <span className="workflow-card__number">{step.number}</span>
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <div className="section-header">
              <div>
                <span className="pill">Why it feels clean</span>
                <h3>Simple by design, not by accident</h3>
              </div>
            </div>

            <div className="micro-list">
              <strong>Focused interface</strong>
              <ul>
                <li>Clear page hierarchy with only the most useful actions visible.</li>
                <li>Monochrome styling that keeps the UI calm and easy to scan.</li>
                <li>Spacing, labels, and cards that guide users without visual noise.</li>
              </ul>

              <strong>Built for testing</strong>
              <ul>
                <li>No signup required to try the app.</li>
                <li>Workout cards start the timer immediately.</li>
                <li>Completed sessions are stored in the workout log.</li>
              </ul>
            </div>
          </article>
        </section>

        <section className="section">
          <div className="card landing-cta">
            <div>
              <span className="pill">Ready to try it</span>
              <h3>Open the demo and train without extra setup.</h3>
              <p>
                The website is now structured like a legitimate product landing page, and the app underneath is ready
                for a real training flow.
              </p>
            </div>
            <div className="landing-cta__actions">
              <Link href="/dashboard" className="button button-primary">
                Open demo dashboard
                <ArrowRightIcon className="icon icon--small" />
              </Link>
              <Link href="/sign-in" className="button button-secondary">
                Demo access
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
