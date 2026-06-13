import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Repeat, Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import type { SuggestionCard } from '@kinnijije/core';
import { AppButton, AppErrorState, AppSkeleton, AppText } from '@kinnijije/ui';
import { IconBack, IconReSuggest } from '@icons';

import { errorMessage } from '@shared/helpers/error-message.ts';

import { useKitchenSession } from '@features/kitchen/providers/kitchen-session-provider.tsx';

import { useSuggest } from '../api/use-suggestions.ts';
import { SuggestionCardItem } from './parts/suggestion-card.tsx';

// Three meal suggestions for the current kitchen session. Runs on mount;
// re-suggest excludes the cards already shown. Empty session → back to kitchen.
export function SuggestionsScreen() {
  const { ingredients } = useKitchenSession();
  const suggest = useSuggest();
  const [cards, setCards] = useState<SuggestionCard[]>([]);
  const seenIds = useRef<Set<string>>(new Set());
  const ran = useRef(false);

  const run = (exclude: string[]) => {
    suggest.mutate(
      { ingredients, ...(exclude.length > 0 ? { excludeRecipeIds: exclude } : {}) },
      {
        onSuccess: (result) => {
          result.forEach((c) => seenIds.current.add(c.recipeId));
          setCards(result);
        },
      },
    );
  };

  // Initial run once.
  useEffect(() => {
    if (ran.current || ingredients.length === 0) return;
    ran.current = true;
    run([...seenIds.current]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (ingredients.length === 0) {
    return <Navigate to={ROUTES.KITCHEN} replace />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <Link
          to={ROUTES.KITCHEN}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <IconBack size={15} aria-hidden="true" /> Kitchen
        </Link>
        <AppButton
          variant="ghost"
          size="sm"
          leadingIcon={<IconReSuggest size={15} />}
          loading={suggest.isPending}
          onClick={() => run([...seenIds.current])}
        >
          Something else
        </AppButton>
      </div>

      <AppText variant="dish-md">Tonight, you could make…</AppText>

      <Show when={suggest.isPending && cards.length === 0}>
        <div role="status" aria-live="polite" className="flex flex-col gap-4">
          <span className="sr-only">Finding meals…</span>
          <AppSkeleton className="h-64" />
          <AppSkeleton className="h-64" />
        </div>
      </Show>

      <Show when={suggest.isError && cards.length === 0}>
        <AppErrorState
          title="Couldn’t find meals"
          description={errorMessage(suggest.error)}
          action={
            <AppButton variant="secondary" onClick={() => run([...seenIds.current])}>
              Try again
            </AppButton>
          }
        />
      </Show>

      <Show when={cards.length > 0}>
        <div className="flex flex-col gap-4">
          <Repeat each={cards}>{(card) => <SuggestionCardItem key={card.recipeId} card={card} />}</Repeat>
        </div>
      </Show>
    </div>
  );
}
