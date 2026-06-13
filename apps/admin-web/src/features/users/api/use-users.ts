import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { Extraction, Favourite, User } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';
import type { CursorPage } from '@shared/api/types.ts';

export interface UserFilters {
  q?: string | undefined;
  cursor?: string | undefined;
}

function queryString(filters: UserFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.cursor) params.set('cursor', filters.cursor);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: QK.users({
      ...(filters.q !== undefined ? { q: filters.q } : {}),
      ...(filters.cursor !== undefined ? { cursor: filters.cursor } : {}),
    }),
    queryFn: () => api.getEnvelope<CursorPage<User>>(`${EP.ADMIN_USERS}${queryString(filters)}`),
    staleTime: 30_000,
  });
}

export interface UserDetail {
  user: User;
  favourites: Favourite[];
  extractions: Extraction[];
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: QK.user(id),
    queryFn: () => api.get<UserDetail>(EP.ADMIN_USER(id)),
    enabled: Boolean(id),
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { status?: 'active' | 'suspended'; role?: 'user' | 'admin' }) =>
      api.patch<{ user: User }>(EP.ADMIN_USER(id), body).then((d) => d.user),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.user(id) });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
