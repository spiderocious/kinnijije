import { useState } from 'react';
import { Repeat, Show } from 'meemaw';

import { formatRelative } from '@kinnijije/core';
import type { Feedback, FeedbackStatus } from '@kinnijije/core';
import { AppButton, AppEmptyState, AppPill, AppText, DrawerService } from '@kinnijije/ui';

import { errorMessage } from '@shared/helpers/error-message.ts';
import { useCursorList } from '@shared/hooks/use-cursor-list.ts';
import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { CursorPager } from '@shared/ui/cursor-pager.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useFeedback, useReviewFeedback } from '../api/use-feedback.ts';

type StatusFilter = 'all' | FeedbackStatus;

// Feedback review queue — "This isn't quite right" flags from cooks. Triage by
// status, mark reviewed once acted on. Drives seed-recipe correction.
export function FeedbackScreen() {
  const [status, setStatus] = useState<StatusFilter>('open');
  const pager = useCursorList();
  const review = useReviewFeedback();

  const feedback = useFeedback({
    status: status === 'all' ? undefined : status,
    cursor: pager.cursor,
  });

  const setFilter = (value: StatusFilter) => {
    setStatus(value);
    pager.reset();
  };

  const markReviewed = (item: Feedback) => {
    review.mutate(
      { id: item.id, status: 'reviewed' },
      {
        onSuccess: () => DrawerService.toast('Marked as reviewed', { tone: 'success' }),
        onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
      },
    );
  };

  return (
    <>
      <PageHeader title="Feedback" subtitle="Flags from cooks on recipe steps and ingredients" />

      <div className="mb-5 inline-flex rounded-ctrl border-2 border-[var(--hair-2)] p-0.5">
        {(['open', 'reviewed', 'all'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={
              'rounded-[7px] px-3 py-1.5 text-[12.5px] font-bold capitalize transition-colors ' +
              (status === s ? 'bg-[var(--danfo-tint)] text-[var(--ink)]' : 'text-[var(--ink-3)]')
            }
          >
            {s}
          </button>
        ))}
      </div>

      <QueryState query={feedback}>
        {(page) => (
          <Show
            when={page.items.length > 0}
            fallback={
              <AppEmptyState
                glyph="🚩"
                title="Nothing flagged"
                description="When cooks flag a step or ingredient, it shows up here."
              />
            }
          >
            <div className="flex flex-col gap-3">
              <Repeat each={page.items}>
                {(item) => (
                  <div
                    key={item.id}
                    className="rounded-card border-2 border-[var(--hair-2)] bg-[var(--sheet)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AppPill tone="warn" small>
                          {item.target.kind} #{item.target.index + 1}
                        </AppPill>
                        <AppPill tone={item.status === 'open' ? 'medium' : 'easy'} small>
                          {item.status}
                        </AppPill>
                      </div>
                      <span className="text-[11px] text-[var(--ink-3)]">
                        {formatRelative(item.createdAt)}
                      </span>
                    </div>
                    <Show when={item.note !== undefined}>
                      <AppText variant="body-sm" className="mt-2 text-[var(--ink-2)]">
                        “{item.note}”
                      </AppText>
                    </Show>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-[var(--ink-4)]">
                        recipe {item.recipeId}
                      </span>
                      <Show when={item.status === 'open'}>
                        <AppButton
                          variant="secondary"
                          size="sm"
                          loading={review.isPending}
                          onClick={() => markReviewed(item)}
                        >
                          Mark reviewed
                        </AppButton>
                      </Show>
                    </div>
                  </div>
                )}
              </Repeat>
            </div>
            <CursorPager
              hasMore={page.hasMore}
              canGoBack={pager.canGoBack}
              onNext={() => pager.next(page.nextCursor)}
              onBack={pager.back}
              busy={feedback.isFetching}
            />
          </Show>
        )}
      </QueryState>
    </>
  );
}
