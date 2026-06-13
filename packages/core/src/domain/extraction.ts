import { z } from 'zod';

export const ExtractionKindSchema = z.enum(['photo', 'voice']);
export type ExtractionKind = z.infer<typeof ExtractionKindSchema>;

// A kept record of a photo/voice extraction. The uploaded image(s)/audio live
// in R2 (referenced by key); `inputUrls` are resolved view URLs the user/admin
// can use to see what was uploaded. Links to the AI audit entry for the call.
export const ExtractionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  kind: ExtractionKindSchema,
  inputUrls: z.array(z.string()), // resolved R2 view URLs
  transcript: z.string().optional(), // voice only
  extractedIngredients: z.array(z.string()),
  aiAuditId: z.string().optional(),
  createdAt: z.string(),
});
export type Extraction = z.infer<typeof ExtractionSchema>;
