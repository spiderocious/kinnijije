import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { User } from '@kinnijije/core';

import { useLogout, useMe } from '../api/use-auth.ts';

// Exposes the current admin user + a logout action to the whole console. Server
// state stays in React Query (useMe); this context is a thin, typed accessor so
// the shell + screens don't each re-query identity.
interface AuthContextValue {
  readonly user: User | null;
  readonly isLoading: boolean;
  readonly logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const me = useMe();
  const logoutMutation = useLogout();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: me.data ?? null,
      isLoading: me.isPending,
      logout: () => logoutMutation.mutate(),
    }),
    [me.data, me.isPending, logoutMutation],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
