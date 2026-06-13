import { z } from 'zod';

import { DifficultySchema } from './user.js';
import { RecipeSourceSchema } from './recipe.js';

export const SuggestionMatchSchema = z.object({
  have: z.number().int().nonnegative(), // count of recipe ingredients the user has
  total: z.number().int().nonnegative(), // total recipe ingredients
  needCount: z.number().int().nonnegative(), // total - have
});
export type SuggestionMatch = z.infer<typeof SuggestionMatchSchema>;

// One of the three cards returned by POST /suggestions. A compact projection of
// a recipe plus the per-session match calculation.
export const SuggestionCardSchema = z.object({
  recipeId: z.string(),
  name: z.string(),
  source: RecipeSourceSchema,
  heroImageUrl: z.string(),
  difficulty: DifficultySchema,
  cookTimeMinutes: z.number().int().positive(),
  match: SuggestionMatchSchema,
  haveIngredients: z.array(z.string()), // canonical names the user supplied that this recipe uses
  needIngredients: z.array(z.string()), // recipe ingredients the user is missing
});
export type SuggestionCard = z.infer<typeof SuggestionCardSchema>;
