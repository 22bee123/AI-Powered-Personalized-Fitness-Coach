import Link from 'next/link';

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="AI Fitness Coach home">
      <span className="brand-badge">AI</span>
      <span className="brand-copy">
        <strong>AI Fitness Coach</strong>
        {!compact && <span>Minimal training dashboard</span>}
      </span>
    </Link>
  );
}
