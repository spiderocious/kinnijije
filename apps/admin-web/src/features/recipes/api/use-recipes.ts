import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { EP } from '@kinnijije/api';
import type { Recipe, RecipeSource, RecipeStatus } from '@kinnijije/core';

import { api } from '@shared/api/client.ts';
import { QK } from '@shared/api/query-keys.ts';
import type { CursorPage } from '@shared/api/types.ts';

export interface RecipeFilters {
  status?: RecipeStatus | undefined;
  source?: RecipeSource | undefined;
  cursor?: string | undefined;
}

function queryString(filters: RecipeFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.source) params.set('source', filters.source);
  if (filters.cursor) params.set('cursor', filters.cursor);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useRecipes(filters: RecipeFilters) {
  return useQuery({
    queryKey: QK.recipes({
      ...(filters.status !== undefined ? { status: filters.status } : {}),
      ...(filters.source !== undefined ? { source: filters.source } : {}),
      ...(filters.cursor !== undefined ? { cursor: filters.cursor } : {}),
    }),
    queryFn: () => api.getEnvelope<CursorPage<Recipe>>(`${EP.ADMIN_RECIPES}${queryString(filters)}`),
    staleTime: 30_000,
  });
}

export function useRecipe(id: string | undefined) {
  return useQuery({
    queryKey: QK.recipe(id ?? 'new'),
    queryFn: () => api.get<{ recipe: Recipe }>(EP.ADMIN_RECIPE(id ?? '')).then((d) => d.recipe),
    enabled: Boolean(id),
  });
}

// ── Payload shapes (match the backend admin.schema.ts) ──
export interface RecipeIngredientInput {
  name: string;
  quantity?: string;
  approximate?: boolean;
}
export interface RecipeStepInput {
  heading: string;
  description: string;
  estMinutes?: number;
}
export interface RecipePayload {
  name: string;
  source: RecipeSource;
  status: RecipeStatus;
  cuisines: string[];
  difficulty: 'easy' | 'medium' | 'involved';
  cookTimeMinutes: number;
  serves: number;
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
}

function invalidateRecipes(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['admin', 'recipes'] });
  void queryClient.invalidateQueries({ queryKey: QK.metrics });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecipePayload) =>
      api.post<{ recipe: Recipe }>(EP.ADMIN_RECIPES, payload).then((d) => d.recipe),
    onSuccess: () => invalidateRecipes(queryClient),
  });
}

export function useUpdateRecipe(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<RecipePayload>) =>
      api.patch<{ recipe: Recipe }>(EP.ADMIN_RECIPE(id), payload).then((d) => d.recipe),
    onSuccess: (recipe) => {
      queryClient.setQueryData(QK.recipe(id), recipe);
      invalidateRecipes(queryClient);
    },
  });
}

export function usePublishRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      api
        .post<{ recipe: Recipe }>(publish ? EP.ADMIN_RECIPE_PUBLISH(id) : EP.ADMIN_RECIPE_UNPUBLISH(id))
        .then((d) => d.recipe),
    onSuccess: (recipe) => {
      queryClient.setQueryData(QK.recipe(recipe.id), recipe);
      invalidateRecipes(queryClient);
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(EP.ADMIN_RECIPE(id)),
    onSuccess: () => invalidateRecipes(queryClient),
  });
}

export function useSetRecipeHero(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { key: string; kind: 'photo' | 'generated' }) =>
      api.post<{ recipe: Recipe }>(EP.ADMIN_RECIPE_HERO(id), body).then((d) => d.recipe),
    onSuccess: (recipe) => {
      queryClient.setQueryData(QK.recipe(id), recipe);
      invalidateRecipes(queryClient);
    },
  });
}

export interface GeneratePayload {
  ingredients: string[];
  cuisines: string[];
  difficultyFloor: 'easy' | 'medium' | 'anything';
}

export function useGenerateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GeneratePayload) =>
      api.post<{ recipe: Recipe }>(EP.ADMIN_RECIPES_GENERATE, payload).then((d) => d.recipe),
    onSuccess: () => invalidateRecipes(queryClient),
  });
}
