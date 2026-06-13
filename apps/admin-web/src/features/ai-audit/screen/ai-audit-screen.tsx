import { useState } from 'react';
import { Repeat, Show } from 'meemaw';

import type { AiCallKind, AiCallStatus } from '@kinnijije/core';
import { AppEmptyState, AppSegmented } from '@kinnijije/ui';

import { useCursorList } from '@shared/hooks/use-cursor-list.ts';
import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { CursorPager } from '@shared/ui/cursor-pager.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useAiAudit } from '../api/use-ai-audit.ts';
import { AuditRow } from './parts/audit-row.tsx';

type KindFilter = 'all' | AiCallKind;
type StatusFilter = 'all' | AiCallStatus;

const KIND_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'vision', label: 'Vision' },
  { value: 'whisper', label: 'Whisper' },
  { value: 'parse', label: 'Parse' },
  { value: 'generate', label: 'Generate' },
] as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: 'ok', label: 'OK' },
  { value: 'error', label: 'Errors' },
] as const;

// The AI audit trail — every call in/out, provider-agnostic. Filter by kind and
// status; tap a row for the full input/prompt/output detail.
export function AiAuditScreen() {
  const [kind, setKind] = useState<KindFilter>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const pager = useCursorList();

  const audit = useAiAudit({
    kind: kind === 'all' ? undefined : kind,
    status: status === 'all' ? undefined : status,
    cursor: pager.cursor,
  });

  const onKind = (value: KindFilter) => {
    setKind(value);
    pager.reset();
  };
  const onStatus = (value: StatusFilter) => {
    setStatus(value);
    pager.reset();
  };

  return (
    <>
      <PageHeader title="AI audit" subtitle="Every call into the AI — what went in, what came out" />

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <AppSegmented<KindFilter> options={KIND_OPTIONS} value={kind} onChange={onKind} aria-label="Filter by kind" />
        <AppSegmented<StatusFilter>
          options={STATUS_OPTIONS}
          value={status}
          onChange={onStatus}
          aria-label="Filter by status"
        />
      </div>

      <QueryState query={audit}>
        {(page) => (
          <Show
            when={page.items.length > 0}
            fallback={
              <AppEmptyState
                glyph="🤖"
                title="No AI calls yet"
                description="Calls appear here as users extract ingredients and recipes are generated."
              />
            }
          >
            <div className="flex flex-col gap-3">
              <Repeat each={page.items}>{(entry) => <AuditRow key={entry.id} entry={entry} />}</Repeat>
            </div>
            <CursorPager
              hasMore={page.hasMore}
              canGoBack={pager.canGoBack}
              onNext={() => pager.next(page.nextCursor)}
              onBack={pager.back}
              busy={audit.isFetching}
            />
          </Show>
        )}
      </QueryState>
    </>
  );
}
