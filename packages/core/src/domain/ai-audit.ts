import { z } from 'zod';

export const AiCallKindSchema = z.enum(['vision', 'whisper', 'parse', 'generate']);
export type AiCallKind = z.infer<typeof AiCallKindSchema>;

// Provider is recorded as plain data — the audit trail is provider-agnostic
// ("what went into the AI / what came out"). Swapping providers changes this
// value, not the audit concept. `string` not a closed enum on purpose.
export const AiProviderNameSchema = z.string();
export type AiProviderName = z.infer<typeof AiProviderNameSchema>;

export const AiCallStatusSchema = z.enum(['ok', 'error']);
export type AiCallStatus = z.infer<typeof AiCallStatusSchema>;

// One AI call, for the admin trail: what went IN (input + prompt) and what came
// OUT (raw + parsed), plus provider/model/latency/cost recorded as data.
export const AiAuditSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  kind: AiCallKindSchema,
  promptKey: z.string().optional(),
  promptVersion: z.number().int().optional(),
  provider: AiProviderNameSchema,
  model: z.string(),
  input: z.unknown(), // redacted/safe summary of what went in
  rawOutput: z.unknown(),
  parsedOutput: z.unknown().optional(),
  status: AiCallStatusSchema,
  errorMessage: z.string().optional(),
  latencyMs: z.number().nonnegative(),
  costEstimateUsd: z.number().nonnegative(),
  createdAt: z.string(),
});
export type AiAudit = z.infer<typeof AiAuditSchema>;
