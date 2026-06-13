import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { AuthResult, User } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';
import { tokenService } from '@shared/services/token-service.ts';

// GET /me — the current user. Enabled only when a session token exists, so the
// login screen doesn't fire a doomed request. staleTime long: identity rarely
// changes within a session.
export function useMe() {
  return useQuery({
    queryKey: QK.me,
    queryFn: () => api.get<{ user: User }>(EP.ME).then((d) => d.user),
    enabled: tokenService.hasSession(),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

// POST /auth/login — stores tokens, then primes the /me cache from the response.
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api.post<AuthResult>(EP.AUTH_LOGIN, body),
    onSuccess: (result) => {
      tokenService.set(result.tokens);
      queryClient.setQueryData(QK.me, result.user);
    },
  });
}

// POST /auth/logout — revoke server-side, then clear local tokens + cache.
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refresh = tokenService.getRefresh();
      if (refresh) {
        // Best-effort server revoke; ignore failures (we clear locally regardless).
        await api.post(EP.AUTH_LOGOUT, { refresh_token: refresh }).catch(() => undefined);
      }
    },
    onSettled: () => {
      tokenService.clear();
      queryClient.clear();
    },
  });
}
