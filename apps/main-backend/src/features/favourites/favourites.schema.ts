import { z } from 'zod';

export const CreateFavouriteBody = z.object({
  recipeId: z.string().min(1),
});
export type CreateFavouriteBody = z.infer<typeof CreateFavouriteBody>;
