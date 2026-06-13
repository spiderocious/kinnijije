import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { Favourite } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import type { CursorPage } from '@shared/api/types.ts';

// Cursor-paginated favourites. useInfiniteQuery handles the "load more" cursor
// chaining; pages flatten into one list in the screen.
export function useFavourites() {
  return useInfiniteQuery({
    queryKey: ['favourites'],
    queryFn: ({ pageParam }) =>
      api.getEnvelope<CursorPage<Favourite>>(
        pageParam ? `${EP.FAVOURITES}?cursor=${encodeURIComponent(pageParam)}` : EP.FAVOURITES,
      ),
    initialPageParam: '' as string,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  });
}

export function useUnsave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) => api.delete(EP.FAVOURITE(recipeId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });
}
