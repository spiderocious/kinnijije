import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import type { RecipeSource, RecipeStatus } from '@kinnijije/core';
import { AppButton, AppEmptyState, AppSegmented } from '@kinnijije/ui';

import { useCursorList } from '@shared/hooks/use-cursor-list.ts';
import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { CursorPager } from '@shared/ui/cursor-pager.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useRecipes } from '../api/use-recipes.ts';
import { RecipeRow } from './parts/recipe-row.tsx';

type StatusFilter = 'all' | RecipeStatus;
type SourceFilter = 'all' | RecipeSource;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
] as const;

const SOURCE_OPTIONS = [
  { value: 'all', label: 'Any source' },
  { value: 'seed', label: 'Seed' },
  { value: 'ai', label: 'AI' },
] as const;

// Recipes list — the content the admin manages. Filters by status/source,
// cursor-paginated. "New recipe" is the primary action (the seeding entry point).
export function RecipesScreen() {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [source, setSource] = useState<SourceFilter>('all');
  const pager = useCursorList();

  const recipes = useRecipes({
    status: status === 'all' ? undefined : status,
    source: source === 'all' ? undefined : source,
    cursor: pager.cursor,
  });

  const onStatusChange = (value: StatusFilter) => {
    setStatus(value);
    pager.reset();
  };
  const onSourceChange = (value: SourceFilter) => {
    setSource(value);
    pager.reset();
  };

  return (
    <>
      <PageHeader
        title="Recipes"
        subtitle="Seed, edit and publish the meal base"
        action={
          <Link to={ROUTES.ADMIN_RECIPE_NEW}>
            <AppButton variant="primary" size="sm">
              New recipe
            </AppButton>
          </Link>
        }
      />

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <AppSegmented<StatusFilter>
          options={STATUS_OPTIONS}
          value={status}
          onChange={onStatusChange}
          aria-label="Filter by status"
        />
        <AppSegmented<SourceFilter>
          options={SOURCE_OPTIONS}
          value={source}
          onChange={onSourceChange}
          aria-label="Filter by source"
        />
      </div>

      <QueryState query={recipes}>
        {(page) => (
          <Show
            when={page.items.length > 0}
            fallback={
              <AppEmptyState
                glyph="🍲"
                title="No recipes here yet"
                description="Create your first recipe to seed the meal base."
                action={
                  <Link to={ROUTES.ADMIN_RECIPE_NEW}>
                    <AppButton variant="primary" size="sm">
                      New recipe
                    </AppButton>
                  </Link>
                }
              />
            }
          >
            <div className="flex flex-col gap-3">
              <Repeat each={page.items}>{(recipe) => <RecipeRow key={recipe.id} recipe={recipe} />}</Repeat>
            </div>
            <CursorPager
              hasMore={page.hasMore}
              canGoBack={pager.canGoBack}
              onNext={() => pager.next(page.nextCursor)}
              onBack={pager.back}
              busy={recipes.isFetching}
            />
          </Show>
        )}
      </QueryState>
    </>
  );
}
