import { z } from 'zod';

// Runtime on/off switches, admin-owned. The keys below are the v1 set; the
// schema allows any string so the admin can add more without a code change.
export const FEATURE_FLAG_KEYS = [
  'input.photo',
  'input.voice',
  'ai.generation',
  'signups',
] as const;

export const FeatureFlagKeySchema = z.string().min(1);
export type FeatureFlagKey = z.infer<typeof FeatureFlagKeySchema>;

export const FeatureFlagSchema = z.object({
  key: FeatureFlagKeySchema,
  enabled: z.boolean(),
  description: z.string(),
  updatedAt: z.string(),
});
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
