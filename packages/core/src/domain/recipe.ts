import { z } from 'zod';

import { DifficultySchema } from './user.js';

export const RecipeSourceSchema = z.enum(['seed', 'ai']);
export type RecipeSource = z.infer<typeof RecipeSourceSchema>;

export const RecipeStatusSchema = z.enum(['draft', 'published']);
export type RecipeStatus = z.infer<typeof RecipeStatusSchema>;

export const HeroImageKindSchema = z.enum(['photo', 'generated', 'placeholder']);
export type HeroImageKind = z.infer<typeof HeroImageKindSchema>;

export const RecipeIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(), // e.g. "2 cups", "1 derica"; absent for AI rough lists
  approximate: z.boolean(), // true for AI recipes → UI shows the "approximate" note
  canonicalKey: z.string().min(1), // normalised key used for matching (see ingredients/)
});
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

export const RecipeStepSchema = z.object({
  index: z.number().int().nonnegative(),
  heading: z.string().min(1), // e.g. "Fry the base"
  description: z.string().min(1), // 2–4 sentences
  estMinutes: z.number().int().positive().optional(),
});
export type RecipeStep = z.infer<typeof RecipeStepSchema>;

// The full recipe wire shape (what GET /recipes/:id returns). `heroImageUrl` is
// a resolved view URL (the backend resolves the stored R2 key on read); the raw
// key is never sent to the client.
export const RecipeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  source: RecipeSourceSchema,
  status: RecipeStatusSchema,
  name: z.string(),
  cuisines: z.array(z.string()),
  difficulty: DifficultySchema,
  cookTimeMinutes: z.number().int().positive(), // already +30% padded for AI on read
  serves: z.number().int().positive(),
  heroImageUrl: z.string(), // resolved URL or the placeholder
  heroImageKind: HeroImageKindSchema,
  ingredients: z.array(RecipeIngredientSchema),
  steps: z.array(RecipeStepSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Recipe = z.infer<typeof RecipeSchema>;
