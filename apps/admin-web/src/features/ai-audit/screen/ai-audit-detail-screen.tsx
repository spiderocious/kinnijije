import { Link, useParams } from 'react-router-dom';
import { Show } from 'meemaw';

import { ROUTES, formatRelative } from '@kinnijije/core';
import type { AiAudit } from '@kinnijije/core';
import { AppPill, AppText } from '@kinnijije/ui';
import { IconBack } from '@icons';

import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useAiAuditItem } from '../api/use-ai-audit.ts';
import { JsonBlock } from './parts/json-block.tsx';

export function AiAuditDetailScreen() {
  const params = useParams();
  const id = params.id ?? '';
  const entry = useAiAuditItem(id);

  return (
    <>
      <Link
        to={ROUTES.ADMIN_AI_AUDIT}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        <IconBack size={15} aria-hidden="true" /> AI audit
      </Link>
      <QueryState query={entry}>{(data) => <Detail entry={data} />}</QueryState>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border-2 border-[var(--hair-2)] bg-[var(--sheet)] px-3 py-2.5">
      <AppText variant="caption">{label}</AppText>
      <p className="mt-0.5 font-mono text-[13px] font-bold text-[var(--ink)]">{value}</p>
    </div>
  );
}

function Detail({ entry }: { entry: AiAudit }) {
  return (
    <>
      <PageHeader
        title={`${entry.kind} call`}
        subtitle={formatRelative(entry.createdAt)}
        action={
          <AppPill tone={entry.status === 'ok' ? 'easy' : 'warn'}>{entry.status}</AppPill>
        }
      />

      {/* Provider / model / cost recorded as plain data (provider-agnostic). */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaItem label="Provider" value={entry.provider} />
        <MetaItem label="Model" value={entry.model} />
        <MetaItem label="Latency" value={`${entry.latencyMs}ms`} />
        <MetaItem label="Est. cost" value={`$${entry.costEstimateUsd.toFixed(4)}`} />
      </div>

      <Show when={entry.promptKey !== undefined}>
        <div className="mb-5">
          <MetaItem
            label="Prompt"
            value={`${entry.promptKey ?? ''} v${entry.promptVersion ?? 0}`}
          />
        </div>
      </Show>

      <Show when={entry.errorMessage !== undefined}>
        <p role="alert" className="mb-5 rounded-card border-2 border-[var(--warn)] bg-[var(--warn-bg)] p-3 text-[13px] font-semibold text-[var(--warn)]">
          {entry.errorMessage}
        </p>
      </Show>

      <div className="flex flex-col gap-5">
        <div>
          <AppText variant="heading-3" className="mb-2">
            Went in
          </AppText>
          <JsonBlock label="Input" value={entry.input} />
        </div>
        <div>
          <AppText variant="heading-3" className="mb-2">
            Came out
          </AppText>
          <div className="flex flex-col gap-3">
            <JsonBlock label="Raw output" value={entry.rawOutput} />
            <Show when={entry.parsedOutput !== undefined}>
              <JsonBlock label="Parsed output" value={entry.parsedOutput} />
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}
