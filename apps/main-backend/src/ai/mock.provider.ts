import { canonicaliseList } from '@kinnijije/core';

import type {
  AiProvider,
  AiResult,
  GeneratedRecipe,
  GenerateRecipeInput,
  ResolvedPrompt,
} from './types.js';

// MockOpenAI — deterministic, no network. Same interface as the real provider.
// Selected by AI_PROVIDER=mock (tests + credential-free local runs). Outputs are
// derived from the input so tests can assert real behaviour, not just fixtures.

const FIXED_INGREDIENTS = ['tomato', 'pepper', 'onion', 'rice', 'chicken'];

function meta(kind: 'vision' | 'whisper' | 'parse' | 'generate', input: unknown, raw: unknown) {
  return {
    kind,
    provider: 'mock',
    model: 'mock-1',
    input,
    rawOutput: raw,
    latencyMs: 1,
    costEstimateUsd: 0,
  };
}

export class MockOpenAI implements AiProvider {
  readonly name = 'mock';

  async extractFromImages(images: Buffer[], _prompt: ResolvedPrompt): Promise<AiResult<string[]>> {
    const data = FIXED_INGREDIENTS.slice(0, Math.max(3, Math.min(5, images.length + 3)));
    return { ok: true, data, meta: meta('vision', { imageCount: images.length }, data) };
  }

  async transcribe(audio: Buffer): Promise<AiResult<string>> {
    const transcript = 'I have tomatoes, pepper, onion, rice and some chicken';
    return { ok: true, data: transcript, meta: meta('whisper', { bytes: audio.length }, transcript) };
  }

  async parseIngredients(text: string, _prompt: ResolvedPrompt): Promise<AiResult<string[]>> {
    // Split on commas/"and", canonicalise — mirrors what the real parser does.
    const parts = text
      .split(/,|\band\b/gi)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const data = canonicaliseList(parts);
    return { ok: true, data, meta: meta('parse', { text }, data) };
  }

  async generateRecipe(
    input: GenerateRecipeInput,
    prompt: ResolvedPrompt,
  ): Promise<AiResult<GeneratedRecipe>> {
    const primaryCuisine = input.cuisines[0] ?? 'Nigerian';
    const data: GeneratedRecipe = {
      name: `${primaryCuisine} one-pot with ${input.ingredients[0] ?? 'rice'}`,
      cuisines: input.cuisines.length > 0 ? input.cuisines : ['Nigerian'],
      difficulty: input.difficultyFloor === 'anything' ? 'medium' : input.difficultyFloor,
      cookTimeMinutes: 35,
      serves: 4,
      ingredients: input.ingredients.map((name) => ({ name })),
      steps: [
        { heading: 'Prep', description: 'Wash and chop everything you have.', estMinutes: 8 },
        { heading: 'Build the base', description: 'Fry the aromatics until fragrant.', estMinutes: 10 },
        { heading: 'Simmer', description: 'Add the rest and cook through.', estMinutes: 17 },
      ],
    };
    return {
      ok: true,
      data,
      meta: { ...meta('generate', input, data), promptKey: prompt.key, promptVersion: prompt.version },
    };
  }
}
