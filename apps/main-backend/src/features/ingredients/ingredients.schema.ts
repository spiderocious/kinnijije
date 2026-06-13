import { z } from 'zod';

export const ExtractPhotoBody = z.object({
  keys: z.array(z.string().min(1)).min(1).max(5),
});
export type ExtractPhotoBody = z.infer<typeof ExtractPhotoBody>;

export const ExtractVoiceBody = z.object({
  key: z.string().min(1),
});
export type ExtractVoiceBody = z.infer<typeof ExtractVoiceBody>;
