import { z } from 'zod';

// ---- Users ---------------------------------------------------------------

export const UpdateUserBody = z.object({
  status: z.enum(['active', 'suspended']).optional(),
  role: z.enum(['user', 'admin']).optional(),
});
export type UpdateUserBody = z.infer<typeof UpdateUserBody>;

// ---- Recipes -------------------------------------------------------------

const IngredientInput = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  approximate: z.boolean().optional(),
});

const StepInput = z.object({
  heading: z.string().min(1),
  description: z.string().min(1),
  estMinutes: z.number().int().positive().optional(),
});

export const CreateRecipeBody = z.object({
  name: z.string().min(1),
  source: z.enum(['seed', 'ai']).default('seed'),
  status: z.enum(['draft', 'published']).default('draft'),
  cuisines: z.array(z.string().min(1)).default([]),
  difficulty: z.enum(['easy', 'medium', 'involved']),
  cookTimeMinutes: z.number().int().positive(),
  serves: z.number().int().positive().default(4),
  ingredients: z.array(IngredientInput).default([]),
  steps: z.array(StepInput).default([]),
});
export type CreateRecipeBody = z.infer<typeof CreateRecipeBody>;

export const UpdateRecipeBody = CreateRecipeBody.partial();
export type UpdateRecipeBody = z.infer<typeof UpdateRecipeBody>;

export const SetHeroBody = z.object({
  key: z.string().min(1),
  kind: z.enum(['photo', 'generated']).default('photo'),
});
export type SetHeroBody = z.infer<typeof SetHeroBody>;

export const GenerateRecipeBody = z.object({
  ingredients: z.array(z.string().min(1)).min(1),
  cuisines: z.array(z.string().min(1)).default(['Nigerian', 'West African']),
  difficultyFloor: z.enum(['easy', 'medium', 'anything']).default('anything'),
});
export type GenerateRecipeBody = z.infer<typeof GenerateRecipeBody>;

// ---- Prompts -------------------------------------------------------------

export const UpsertPromptBody = z.object({
  template: z.string().min(1),
  notes: z.string().optional(),
});
export type UpsertPromptBody = z.infer<typeof UpsertPromptBody>;

// ---- Feature flags -------------------------------------------------------

export const SetFlagBody = z.object({
  enabled: z.boolean(),
});
export type SetFlagBody = z.infer<typeof SetFlagBody>;

// ---- Feedback ------------------------------------------------------------

export const UpdateFeedbackBody = z.object({
  status: z.enum(['open', 'reviewed']),
});
export type UpdateFeedbackBody = z.infer<typeof UpdateFeedbackBody>;
