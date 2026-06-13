import { z } from 'zod';

export const CreateFeedbackBody = z.object({
  recipeId: z.string().min(1),
  target: z.object({
    kind: z.enum(['step', 'ingredient']),
    index: z.number().int().nonnegative(),
  }),
  note: z.string().max(1000).optional(),
});
export type CreateFeedbackBody = z.infer<typeof CreateFeedbackBody>;
