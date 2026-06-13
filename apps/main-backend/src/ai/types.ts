import type { AiCallKind } from '@kinnijije/core';

// The shape an AI provider returns for a recipe generation. Kept loose on the
// provider side (raw model output); the generate service validates + shapes it
// into a real Recipe before persisting.
export interface GeneratedRecipe {
  name: string;
  cuisines: string[];
  difficulty: 'easy' | 'medium' | 'involved';
  cookTimeMinutes: number; // raw model estimate — the service pads +30% on display
  serves: number;
  ingredients: { name: string; quantity?: string }[];
  steps: { heading: string; description: string; estMinutes?: number }[];
}

export interface GenerateRecipeInput {
  ingredients: string[]; // canonical keys the user has
  cuisines: string[]; // user preference biases
  difficultyFloor: 'easy' | 'medium' | 'anything';
}

// Every provider call returns the result plus an audit record describing what
// went IN and what came OUT — the substrate for the admin AI audit trail. The
// provider fills provider/model/raw/latency/cost; the caller adds userId etc.
export interface AiCallMeta {
  kind: AiCallKind;
  provider: string;
  model: string;
  input: unknown;
  rawOutput: unknown;
  latencyMs: number;
  costEstimateUsd: number;
  promptKey?: string;
  promptVersion?: number;
}

export interface AiResult<T> {
  ok: boolean;
  data?: T;
  errorMessage?: string;
  meta: AiCallMeta;
}

// A resolved prompt template (admin-editable) handed to the provider so the
// audit can record which prompt version produced the output.
export interface ResolvedPrompt {
  key: 'vision' | 'parse' | 'generate';
  version: number;
  template: string;
}

export interface AiProvider {
  readonly name: string;
  extractFromImages(images: Buffer[], prompt: ResolvedPrompt): Promise<AiResult<string[]>>;
  transcribe(audio: Buffer): Promise<AiResult<string>>;
  parseIngredients(text: string, prompt: ResolvedPrompt): Promise<AiResult<string[]>>;
  generateRecipe(
    input: GenerateRecipeInput,
    prompt: ResolvedPrompt,
  ): Promise<AiResult<GeneratedRecipe>>;
}
