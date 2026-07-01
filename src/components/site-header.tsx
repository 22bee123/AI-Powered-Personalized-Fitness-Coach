import Link from 'next/link';
import { BrandMark } from './brand-mark';
import type { ReactNode } from 'react';

export function SiteHeader({
  actions,
}: {
  actions?: ReactNode;
}) {
  return (
    <header className="site-header">
      <BrandMark />
      <nav className="site-header__actions">
        <Link href="/dashboard" className="text-link">
          Dashboard
        </Link>
        <Link href="/sign-in" className="text-link">
          Demo access
        </Link>
        {actions}
      </nav>
    </header>
  );
}
