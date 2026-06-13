import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { Favourite, Feedback, Recipe } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';

export function useRecipe(id: string) {
  return useQuery({
    queryKey: QK.recipe(id),
    queryFn: () => api.get<{ recipe: Recipe }>(EP.RECIPE(id)).then((d) => d.recipe),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveFavourite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) =>
      api.post<{ favourite: Favourite }>(EP.FAVOURITES, { recipeId }).then((d) => d.favourite),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });
}

export function useUnsaveFavourite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) => api.delete(EP.FAVOURITE(recipeId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });
}

export function useFlagStep() {
  return useMutation({
    mutationFn: (body: {
      recipeId: string;
      target: { kind: 'step' | 'ingredient'; index: number };
      note?: string;
    }) => api.post<{ feedback: Feedback }>(EP.FEEDBACK, body).then((d) => d.feedback),
  });
}
