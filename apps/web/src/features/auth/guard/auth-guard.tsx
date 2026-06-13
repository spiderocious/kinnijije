import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import { AppSkeleton } from '@kinnijije/ui';

import { tokenService } from '@shared/services/token-service.ts';

import { useAuthContext } from '../providers/auth-provider.tsx';

// Gates the authenticated app:
//  - no session token → landing (no doomed /me call)
//  - session present, /me loading → skeleton
//  - /me failed (expired) → landing
//  - authenticated → render
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthContext();

  if (!tokenService.hasSession()) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="mx-auto max-w-md p-6">
        <span className="sr-only">Loading…</span>
        <AppSkeleton className="h-48" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
}
