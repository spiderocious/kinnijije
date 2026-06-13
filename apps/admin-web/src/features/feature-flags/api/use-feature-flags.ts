import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { FeatureFlag } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';

export function useFeatureFlags() {
  return useQuery({
    queryKey: QK.featureFlags,
    queryFn: () => api.get<{ flags: FeatureFlag[] }>(EP.ADMIN_FEATURE_FLAGS).then((d) => d.flags),
    staleTime: 30_000,
  });
}

export function useToggleFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      api.patch<{ flag: FeatureFlag }>(EP.ADMIN_FEATURE_FLAG(key), { enabled }).then((d) => d.flag),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QK.featureFlags });
    },
  });
}
