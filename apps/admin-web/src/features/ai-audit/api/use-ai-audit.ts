import { useQuery } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { AiAudit, AiCallKind, AiCallStatus } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';
import type { CursorPage } from '@shared/api/types.ts';

export interface AuditFilters {
  kind?: AiCallKind | undefined;
  status?: AiCallStatus | undefined;
  cursor?: string | undefined;
}

function queryString(filters: AuditFilters): string {
  const params = new URLSearchParams();
  if (filters.kind) params.set('kind', filters.kind);
  if (filters.status) params.set('status', filters.status);
  if (filters.cursor) params.set('cursor', filters.cursor);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useAiAudit(filters: AuditFilters) {
  return useQuery({
    queryKey: QK.aiAudit({
      ...(filters.kind !== undefined ? { kind: filters.kind } : {}),
      ...(filters.status !== undefined ? { status: filters.status } : {}),
      ...(filters.cursor !== undefined ? { cursor: filters.cursor } : {}),
    }),
    queryFn: () => api.getEnvelope<CursorPage<AiAudit>>(`${EP.ADMIN_AI_AUDIT}${queryString(filters)}`),
    staleTime: 15_000,
  });
}

export function useAiAuditItem(id: string) {
  return useQuery({
    queryKey: QK.aiAuditItem(id),
    queryFn: () => api.get<{ entry: AiAudit }>(EP.ADMIN_AI_AUDIT_ITEM(id)).then((d) => d.entry),
    enabled: Boolean(id),
  });
}
