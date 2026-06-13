import { Link } from 'react-router-dom';

import { ROUTES, formatRelative } from '@kinnijije/core';
import type { AiAudit } from '@kinnijije/core';
import { AppPill, AppText } from '@kinnijije/ui';

// One AI call in the trail. Kind + provider/model + status + cost + when.
export function AuditRow({ entry }: { entry: AiAudit }) {
  return (
    <Link
      to={ROUTES.ADMIN_AI_AUDIT_ITEM(entry.id)}
      className="flex items-center gap-3 rounded-card border-2 border-[var(--hair-2)] bg-[var(--sheet)] p-3 transition-colors hover:border-[var(--ink)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(237,174,5,0.55)] sm:p-4"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <AppPill tone="ai" small>
            {entry.kind}
          </AppPill>
          <AppPill tone={entry.status === 'ok' ? 'easy' : 'warn'} small>
            {entry.status}
          </AppPill>
          <span className="font-mono text-[11px] text-[var(--ink-3)]">
            {entry.provider}/{entry.model}
          </span>
        </div>
        <AppText variant="body-sm" className="mt-1 text-[var(--ink-3)]">
          {formatRelative(entry.createdAt)} · {entry.latencyMs}ms · ${entry.costEstimateUsd.toFixed(3)}
        </AppText>
      </div>
    </Link>
  );
}
