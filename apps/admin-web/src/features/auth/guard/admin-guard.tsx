import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import { AppButton, AppErrorState, AppSkeleton } from '@kinnijije/ui';

import { tokenService } from '@shared/services/token-service.ts';

import { useLogout } from '../api/use-auth.ts';
import { useAuthContext } from '../providers/auth-provider.tsx';

// The single place that answers "can this person use the admin console?".
//  - No session token → straight to login (no doomed /me call).
//  - Session present but /me still loading → skeleton.
//  - /me failed (expired/invalid) → login.
//  - Authenticated but role !== 'admin' → refuse + offer sign-out (a normal user
//    must never see admin screens).
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthContext();
  const logout = useLogout();

  if (!tokenService.hasSession()) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
  }

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="mx-auto max-w-md p-8">
        <span className="sr-only">Checking your session…</span>
        <AppSkeleton className="h-40" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md p-8">
        <AppErrorState
          title="Not authorised"
          description="This account isn’t an admin. Sign in with an admin account to manage the platform."
          action={
            <AppButton variant="secondary" onClick={() => logout.mutate()}>
              Sign out
            </AppButton>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}
