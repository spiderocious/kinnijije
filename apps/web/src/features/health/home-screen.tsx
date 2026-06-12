import { Link } from 'react-router-dom';

import { useHealth } from '@kinnijije/api';
import { ROUTES } from '@kinnijije/core';
import { AppButton, AppText } from '@kinnijije/ui';

export function HomeScreen() {
  const { data, isLoading, isError } = useHealth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <AppText variant="overline">KinniJije · web</AppText>
      <AppText variant="dish-lg" className="mt-2">
        What&rsquo;s in your kitchen?
      </AppText>
      <AppText variant="body" className="mt-4 max-w-2xl">
        Nx + pnpm workspace with shared <code>core</code>, <code>api</code> and{' '}
        <code>ui</code> packages. The <code>@kinnijije/ui</code> design system lives behind the
        preview link below.
      </AppText>

      <div className="mt-8 flex gap-3">
        <Link to={ROUTES.PREVIEW}>
          <AppButton variant="primary">Open UI preview</AppButton>
        </Link>
        <Link to={ROUTES.EXAMPLE}>
          <AppButton variant="secondary" type="button">
            Example
          </AppButton>
        </Link>
      </div>

      <section className="mt-12 rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-4 text-sm shadow-paint">
        <AppText variant="overline">backend health</AppText>
        <div className="mt-2">
          {isLoading && 'Checking…'}
          {isError && (
            <span className="text-[var(--warn)]">unreachable — is main-backend running?</span>
          )}
          {data && (
            <span>
              status: <strong>{data.status}</strong>
            </span>
          )}
        </div>
      </section>
    </main>
  );
}
