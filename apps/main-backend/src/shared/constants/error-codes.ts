export const ERROR_CODES = [
  'validation_error',
  'unauthorized',
  'forbidden',
  'not_found',
  'conflict',
  'rate_limited',
  'internal',
  // Domain-specific
  'invalid_credentials',
  'feature_disabled',
  'ai_unavailable',
  'extraction_failed',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];
