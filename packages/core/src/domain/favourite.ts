import { z } from 'zod';

import { RecipeSchema } from './recipe.js';

// A saved favourite. `recipe` is the frozen snapshot taken at save time — AI
// recipes are otherwise not guaranteed permanent, so we embed the full recipe
// the user actually saved.
export const FavouriteSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  recipe: RecipeSchema,
  createdAt: z.string(),
});
export type Favourite = z.infer<typeof FavouriteSchema>;
