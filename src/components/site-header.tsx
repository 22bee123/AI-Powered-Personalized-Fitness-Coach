import Link from 'next/link';
import { BrandMark } from './brand-mark';
import type { ReactNode } from 'react';

export function SiteHeader({
  actions,
  showDefaultLinks = true,
}: {
  actions?: ReactNode;
  showDefaultLinks?: boolean;
}) {
  return (
    <header className="site-header">
      <BrandMark />
      <nav className="site-header__actions">
        {showDefaultLinks && (
          <>
            <Link href="/dashboard" className="text-link">
              Dashboard
            </Link>
            <Link href="/sign-in" className="text-link">
              Demo access
            </Link>
          </>
        )}
        {actions}
      </nav>
    </header>
  );
}
