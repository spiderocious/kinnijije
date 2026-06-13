import { useQuery } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';
import type { AdminMetrics } from '@shared/api/types.ts';

export function useMetrics() {
  return useQuery({
    queryKey: QK.metrics,
    queryFn: () => api.get<AdminMetrics>(EP.ADMIN_METRICS),
    staleTime: 60 * 1000,
  });
}
