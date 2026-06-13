import { useMutation } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { SuggestionCard } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';

// POST /suggestions — returns exactly 3 cards. A mutation (not a query) because
// it has side effects (records recent ingredients, may generate an AI recipe)
// and we trigger it explicitly with the session ingredients.
export function useSuggest() {
  return useMutation({
    mutationFn: (body: { ingredients: string[]; excludeRecipeIds?: string[] }) =>
      api
        .post<{ suggestions: SuggestionCard[] }>(EP.SUGGESTIONS, body)
        .then((d) => d.suggestions),
  });
}
