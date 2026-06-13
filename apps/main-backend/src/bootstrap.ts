import { FEATURE_FLAG_KEYS, type PromptKey } from '@kinnijije/core';

import { DEFAULT_PROMPTS } from './ai/index.js';
import { logger } from '@lib/logger.js';
import { repos } from './repositories/index.js';

// Idempotent startup seeding: ensure the v1 feature flags exist (default on) and
// that each AI prompt key has an active version. Safe to run on every boot.

const FLAG_DESCRIPTIONS: Record<string, string> = {
  'input.photo': 'Allow photo-based ingredient extraction (OpenAI Vision)',
  'input.voice': 'Allow voice-based ingredient extraction (Whisper + parse)',
  'ai.generation': 'Allow AI recipe generation to fill suggestions',
  signups: 'Allow new account sign-ups',
};

export async function seedDefaults(): Promise<void> {
  for (const key of FEATURE_FLAG_KEYS) {
    await repos.featureFlags.upsert({
      key,
      enabled: true,
      description: FLAG_DESCRIPTIONS[key] ?? key,
    });
  }

  const promptKeys: PromptKey[] = ['vision', 'parse', 'generate'];
  for (const key of promptKeys) {
    const active = await repos.prompts.getActive(key);
    if (!active) {
      await repos.prompts.createVersion({ key, template: DEFAULT_PROMPTS[key], notes: 'seeded default' });
    }
  }

  logger.info('Defaults seeded (feature flags + prompts)');
}
