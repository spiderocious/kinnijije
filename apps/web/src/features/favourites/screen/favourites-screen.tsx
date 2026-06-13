import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import type { Favourite } from '@kinnijije/core';
import { AppButton, AppEmptyState, AppFavouritesList, AppText } from '@kinnijije/ui';
import type { FavouriteItem } from '@kinnijije/ui';

import { dishFamilyFor, realPhotoSrc } from '@shared/helpers/dish-family.ts';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useFavourites, useUnsave } from '../api/use-favourites.ts';

function toItem(fav: Favourite): FavouriteItem {
  const r = fav.recipe;
  const photo = realPhotoSrc(r.heroImageUrl, r.heroImageKind);
  const base = {
    id: r.id,
    name: r.name,
    family: dishFamilyFor(r.name),
    provenance: r.source === 'seed' ? ('verified' as const) : ('ai' as const),
    time: r.source === 'ai' ? `≈ ${r.cookTimeMinutes}M` : `${r.cookTimeMinutes}M`,
  };
  return photo !== undefined ? { ...base, photoSrc: photo } : base;
}

export function FavouritesScreen() {
  const navigate = useNavigate();
  const query = useFavourites();
  const unsave = useUnsave();

  const items = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.items).map(toItem),
    [query.data],
  );

  return (
    <div className="flex flex-col gap-4">
      <AppText variant="dish-md">Your favourites</AppText>

      <QueryState query={query}>
        {() => (
          <Show
            when={items.length > 0}
            fallback={
              <AppEmptyState
                glyph="♡"
                title="No favourites yet"
                description="Save a recipe you love and it’ll wait for you here."
                action={
                  <AppButton variant="primary" size="sm" onClick={() => navigate(ROUTES.KITCHEN)}>
                    Find a meal
                  </AppButton>
                }
              />
            }
          >
            <AppFavouritesList
              items={items}
              swipeable
              onCookAgain={(id) => navigate(ROUTES.COOK(id))}
              onUnsave={(id) => unsave.mutate(id)}
            />
            <Show when={query.hasNextPage}>
              <AppButton
                variant="secondary"
                size="md"
                loading={query.isFetchingNextPage}
                onClick={() => void query.fetchNextPage()}
                className="w-full"
              >
                Load more
              </AppButton>
            </Show>
          </Show>
        )}
      </QueryState>
    </div>
  );
}
