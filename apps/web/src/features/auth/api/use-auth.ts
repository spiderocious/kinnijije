import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { AuthResult, User } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';
import { tokenService } from '@shared/services/token-service.ts';

// GET /me — current user. Enabled only with a session token so the auth screens
// don't fire a doomed request.
export function useMe() {
  return useQuery({
    queryKey: QK.me,
    queryFn: () => api.get<{ user: User }>(EP.ME).then((d) => d.user),
    enabled: tokenService.hasSession(),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { email: string; name: string; password: string }) =>
      api.post<AuthResult>(EP.AUTH_REGISTER, body),
    onSuccess: (result) => {
      tokenService.set(result.tokens);
      queryClient.setQueryData(QK.me, result.user);
    },
  });
}

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

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refresh = tokenService.getRefresh();
      if (refresh) {
        await api.post(EP.AUTH_LOGOUT, { refresh_token: refresh }).catch(() => undefined);
      }
    },
    onSettled: () => {
      tokenService.clear();
      queryClient.clear();
    },
  });
}
