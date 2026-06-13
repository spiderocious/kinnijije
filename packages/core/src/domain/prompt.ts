import { z } from 'zod';

// The three editable AI prompt templates. Admin edits create a new version and
// set it active, so the Nigerian-first system prompt is tunable without a deploy.
export const PromptKeySchema = z.enum(['vision', 'parse', 'generate']);
export type PromptKey = z.infer<typeof PromptKeySchema>;

export const PromptSchema = z.object({
  id: z.string(),
  key: PromptKeySchema,
  version: z.number().int().positive(),
  template: z.string(),
  notes: z.string().optional(),
  active: z.boolean(),
  createdAt: z.string(),
});
export type Prompt = z.infer<typeof PromptSchema>;
