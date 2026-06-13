import OpenAI, { toFile } from 'openai';

import { env } from '../env.js';
import type {
  AiProvider,
  AiResult,
  GeneratedRecipe,
  GenerateRecipeInput,
  ResolvedPrompt,
} from './types.js';

// Rough per-call cost estimates (USD) used only for the admin spend dashboard.
// Not billing-grade; deliberately conservative.
const COST = { vision: 0.01, whisper: 0.006, parse: 0.002, generate: 0.03 };

function jsonArrayOfStrings(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === 'string');
  return [];
}

export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async extractFromImages(images: Buffer[], prompt: ResolvedPrompt): Promise<AiResult<string[]>> {
    const started = Date.now();
    const base = {
      kind: 'vision' as const,
      provider: this.name,
      model: env.OPENAI_VISION_MODEL,
      promptKey: prompt.key,
      promptVersion: prompt.version,
    };
    try {
      const content = [
        { type: 'text' as const, text: prompt.template },
        ...images.map((img) => ({
          type: 'image_url' as const,
          image_url: { url: `data:image/jpeg;base64,${img.toString('base64')}` },
        })),
      ];
      const res = await this.client.chat.completions.create({
        model: env.OPENAI_VISION_MODEL,
        messages: [{ role: 'user', content }],
        response_format: { type: 'json_object' },
      });
      const raw = res.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as { ingredients?: unknown };
      const data = jsonArrayOfStrings(parsed.ingredients);
      return {
        ok: true,
        data,
        meta: { ...base, input: { imageCount: images.length }, rawOutput: raw, latencyMs: Date.now() - started, costEstimateUsd: COST.vision * images.length },
      };
    } catch (err) {
      return {
        ok: false,
        errorMessage: err instanceof Error ? err.message : 'vision failed',
        meta: { ...base, input: { imageCount: images.length }, rawOutput: null, latencyMs: Date.now() - started, costEstimateUsd: 0 },
      };
    }
  }

  async transcribe(audio: Buffer): Promise<AiResult<string>> {
    const started = Date.now();
    const base = { kind: 'whisper' as const, provider: this.name, model: env.OPENAI_WHISPER_MODEL };
    try {
      const file = await toFile(audio, 'audio.webm', { type: 'audio/webm' });
      const res = await this.client.audio.transcriptions.create({
        file,
        model: env.OPENAI_WHISPER_MODEL,
      });
      return {
        ok: true,
        data: res.text,
        meta: { ...base, input: { bytes: audio.length }, rawOutput: res.text, latencyMs: Date.now() - started, costEstimateUsd: COST.whisper },
      };
    } catch (err) {
      return {
        ok: false,
        errorMessage: err instanceof Error ? err.message : 'transcription failed',
        meta: { ...base, input: { bytes: audio.length }, rawOutput: null, latencyMs: Date.now() - started, costEstimateUsd: 0 },
      };
    }
  }

  async parseIngredients(text: string, prompt: ResolvedPrompt): Promise<AiResult<string[]>> {
    const started = Date.now();
    const base = { kind: 'parse' as const, provider: this.name, model: env.OPENAI_PARSE_MODEL, promptKey: prompt.key, promptVersion: prompt.version };
    try {
      const res = await this.client.chat.completions.create({
        model: env.OPENAI_PARSE_MODEL,
        messages: [
          { role: 'system', content: prompt.template },
          { role: 'user', content: text },
        ],
        response_format: { type: 'json_object' },
      });
      const raw = res.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(raw) as { ingredients?: unknown };
      const data = jsonArrayOfStrings(parsed.ingredients);
      return {
        ok: true,
        data,
        meta: { ...base, input: { text }, rawOutput: raw, latencyMs: Date.now() - started, costEstimateUsd: COST.parse },
      };
    } catch (err) {
      return {
        ok: false,
        errorMessage: err instanceof Error ? err.message : 'parse failed',
        meta: { ...base, input: { text }, rawOutput: null, latencyMs: Date.now() - started, costEstimateUsd: 0 },
      };
    }
  }

  async generateRecipe(
    input: GenerateRecipeInput,
    prompt: ResolvedPrompt,
  ): Promise<AiResult<GeneratedRecipe>> {
    const started = Date.now();
    const base = { kind: 'generate' as const, provider: this.name, model: env.OPENAI_GENERATE_MODEL, promptKey: prompt.key, promptVersion: prompt.version };
    try {
      const userMsg = JSON.stringify(input);
      const res = await this.client.chat.completions.create({
        model: env.OPENAI_GENERATE_MODEL,
        messages: [
          { role: 'system', content: prompt.template },
          { role: 'user', content: userMsg },
        ],
        response_format: { type: 'json_object' },
      });
      const raw = res.choices[0]?.message?.content ?? '{}';
      const data = JSON.parse(raw) as GeneratedRecipe;
      return {
        ok: true,
        data,
        meta: { ...base, input, rawOutput: raw, latencyMs: Date.now() - started, costEstimateUsd: COST.generate },
      };
    } catch (err) {
      return {
        ok: false,
        errorMessage: err instanceof Error ? err.message : 'generation failed',
        meta: { ...base, input, rawOutput: null, latencyMs: Date.now() - started, costEstimateUsd: 0 },
      };
    }
  }
}
