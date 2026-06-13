import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import { AppText } from '@kinnijije/ui';
import { IconBack } from '@icons';

// Shared chrome for the register/login screens: a back link to the landing
// page, the wordmark, and a title. Mobile-first centred card layout.
export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-[var(--paper)] px-5 py-6">
      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        <IconBack size={15} aria-hidden="true" /> Back
      </Link>

      <div className="mx-auto mt-8 w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="font-display text-[30px] tracking-display">
            Kinni<span className="text-[var(--danfo-deep)]">Jije</span>
          </span>
          <AppText variant="dish-md" className="mt-3">
            {title}
          </AppText>
        </div>
        {children}
      </div>
    </main>
  );
}
