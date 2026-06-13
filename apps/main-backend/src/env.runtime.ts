import { env } from './env.js';
import { logger } from '@lib/logger.js';

// Runtime (boot-time) checks that don't belong in the zod schema — so dev/test
// can still boot, but we fail loudly at server start when a production-only
// requirement is missing. (rules.md §8)
export function bootstrapEnvChecks(): void {
  if (env.NODE_ENV === 'production') {
    if (env.AI_PROVIDER === 'openai' && !env.OPENAI_API_KEY) {
      throw new Error('production: AI_PROVIDER=openai requires OPENAI_API_KEY');
    }
    if (env.MONGODB_URI.includes('127.0.0.1') || env.MONGODB_URI.includes('localhost')) {
      logger.warn('MONGODB_URI points at localhost in production');
    }
  }
}
