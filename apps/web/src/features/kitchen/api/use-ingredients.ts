import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';
import type { PhotoExtractionResult, VoiceExtractionResult } from '@shared/api/types.ts';

// Autosuggest from the Nigerian-weighted dictionary (Type method). Disabled for
// empty queries so we don't spam the endpoint.
export function useIngredientSuggest(query: string) {
  return useQuery({
    queryKey: QK.ingredientSuggest(query),
    queryFn: () =>
      api
        .get<{ items: string[] }>(`${EP.INGREDIENTS_SUGGEST}?q=${encodeURIComponent(query)}`)
        .then((d) => d.items),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

// "Or pick from recent" chips.
export function useRecentIngredients() {
  return useQuery({
    queryKey: QK.recentIngredients,
    queryFn: () => api.get<{ items: string[] }>(EP.INGREDIENTS_RECENT).then((d) => d.items),
    staleTime: 60 * 1000,
  });
}

// Photo extraction: send R2 keys (frontend uploaded first) → vision → ingredients.
export function useExtractPhoto() {
  return useMutation({
    mutationFn: (keys: string[]) =>
      api.post<PhotoExtractionResult>(EP.INGREDIENTS_EXTRACT_PHOTO, { keys }),
  });
}

// Voice extraction: send the R2 key for the uploaded audio → whisper + parse.
export function useExtractVoice() {
  return useMutation({
    mutationFn: (key: string) => api.post<VoiceExtractionResult>(EP.INGREDIENTS_EXTRACT_VOICE, { key }),
  });
}
