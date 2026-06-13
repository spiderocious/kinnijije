import { z } from 'zod';

export const UpdatePrefsBody = z.object({
  cuisines: z.array(z.string().min(1)).optional(),
  difficultyFloor: z.enum(['easy', 'medium', 'anything']).optional(),
  measurement: z.enum(['metric', 'imperial']).optional(),
});
export type UpdatePrefsBody = z.infer<typeof UpdatePrefsBody>;
