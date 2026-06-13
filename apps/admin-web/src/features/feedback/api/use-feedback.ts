import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { Feedback, FeedbackStatus } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';
import type { CursorPage } from '@shared/api/types.ts';

export interface FeedbackFilters {
  status?: FeedbackStatus | undefined;
  cursor?: string | undefined;
}

function queryString(filters: FeedbackFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.cursor) params.set('cursor', filters.cursor);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useFeedback(filters: FeedbackFilters) {
  return useQuery({
    queryKey: QK.feedback({
      ...(filters.status !== undefined ? { status: filters.status } : {}),
      ...(filters.cursor !== undefined ? { cursor: filters.cursor } : {}),
    }),
    queryFn: () => api.getEnvelope<CursorPage<Feedback>>(`${EP.ADMIN_FEEDBACK}${queryString(filters)}`),
    staleTime: 15_000,
  });
}

export function useReviewFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) =>
      api.patch<{ feedback: Feedback }>(EP.ADMIN_FEEDBACK_ITEM(id), { status }).then((d) => d.feedback),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] });
    },
  });
}
