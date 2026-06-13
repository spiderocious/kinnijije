// Centralised React Query keys so cache invalidation across features is explicit.
export const QK = {
  me: ['me'] as const,
  recentIngredients: ['ingredients', 'recent'] as const,
  ingredientSuggest: (q: string) => ['ingredients', 'suggest', q] as const,
  recipe: (id: string) => ['recipe', id] as const,
  favourites: (cursor?: string) => ['favourites', cursor ?? ''] as const,
} as const;
