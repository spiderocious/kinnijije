import { z } from 'zod';

export const FeedbackTargetKindSchema = z.enum(['step', 'ingredient']);
export type FeedbackTargetKind = z.infer<typeof FeedbackTargetKindSchema>;

export const FeedbackTargetSchema = z.object({
  kind: FeedbackTargetKindSchema,
  index: z.number().int().nonnegative(),
});
export type FeedbackTarget = z.infer<typeof FeedbackTargetSchema>;

export const FeedbackStatusSchema = z.enum(['open', 'reviewed']);
export type FeedbackStatus = z.infer<typeof FeedbackStatusSchema>;

// A "This isn't quite right" flag on a recipe step or ingredient. Collected for
// seed-recipe correction and surfaced in the admin feedback queue.
export const FeedbackSchema = z.object({
  id: z.string(),
  recipeId: z.string(),
  userId: z.string(),
  target: FeedbackTargetSchema,
  note: z.string().optional(),
  status: FeedbackStatusSchema,
  createdAt: z.string(),
});
export type Feedback = z.infer<typeof FeedbackSchema>;
