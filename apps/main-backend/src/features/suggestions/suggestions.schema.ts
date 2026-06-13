import { z } from 'zod';

export const SuggestBody = z.object({
  ingredients: z.array(z.string().min(1)).min(1),
  excludeRecipeIds: z.array(z.string()).optional(),
});
export type SuggestBody = z.infer<typeof SuggestBody>;
