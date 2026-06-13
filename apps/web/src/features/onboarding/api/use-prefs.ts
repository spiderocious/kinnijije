import { useMutation, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { User, UserPrefs } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';

// PATCH /me/prefs — used by onboarding and settings.
export function useUpdatePrefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prefs: Partial<UserPrefs>) =>
      api.patch<{ user: User }>(EP.ME_PREFS, prefs).then((d) => d.user),
    onSuccess: (user) => {
      queryClient.setQueryData(QK.me, user);
    },
  });
}
