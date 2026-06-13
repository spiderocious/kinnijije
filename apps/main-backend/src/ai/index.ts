import type { PromptKey } from '@kinnijije/core';

import { env } from '../env.js';
import { repos } from '../repositories/index.js';
import { MockOpenAI } from './mock.provider.js';
import { OpenAiProvider } from './openai.provider.js';
import { DEFAULT_PROMPTS } from './prompts.js';
import type {
  AiProvider,
  AiResult,
  GeneratedRecipe,
  GenerateRecipeInput,
  ResolvedPrompt,
} from './types.js';

// Provider selected once at module load by AI_PROVIDER. `openai` (default) uses
// the real API; `mock` uses MockOpenAI (tests + credential-free runs).
const provider: AiProvider = env.AI_PROVIDER === 'mock' ? new MockOpenAI() : new OpenAiProvider();

export function getAiProvider(): AiProvider {
  return provider;
}

// Resolve the active admin-edited prompt for a key, falling back to the built-in
// default (version 0) when the DB has none yet.
async function resolvePrompt(key: PromptKey): Promise<ResolvedPrompt> {
  const active = await repos.prompts.getActive(key);
  if (active) return { key, version: active.version, template: active.template };
  return { key, version: 0, template: DEFAULT_PROMPTS[key] };
}

// Persist an AI call to the audit trail. Provider-agnostic: records what went in
// and what came out, with provider/model/cost as plain data. Returns the audit
// id so callers (e.g. extractions) can link to it.
async function recordAudit<T>(result: AiResult<T>, userId?: string): Promise<string> {
  const { meta } = result;
  const { id } = await repos.aiAudit.create({
    kind: meta.kind,
    provider: meta.provider,
    model: meta.model,
    input: meta.input,
    rawOutput: meta.rawOutput,
    status: result.ok ? 'ok' : 'error',
    latencyMs: meta.latencyMs,
    costEstimateUsd: meta.costEstimateUsd,
    ...(userId !== undefined ? { userId } : {}),
    ...(meta.promptKey !== undefined ? { promptKey: meta.promptKey } : {}),
    ...(meta.promptVersion !== undefined ? { promptVersion: meta.promptVersion } : {}),
    ...(result.data !== undefined ? { parsedOutput: result.data } : {}),
    ...(result.errorMessage !== undefined ? { errorMessage: result.errorMessage } : {}),
  });
  return id;
}

export interface AuditedResult<T> {
  ok: boolean;
  data?: T;
  errorMessage?: string;
  auditId: string;
}

// Public AI surface used by features. Each call resolves the active prompt,
// invokes the provider, writes the audit entry, and returns the data + auditId.

export async function aiExtractFromImages(
  images: Buffer[],
  userId?: string,
): Promise<AuditedResult<string[]>> {
  const prompt = await resolvePrompt('vision');
  const result = await provider.extractFromImages(images, prompt);
  const auditId = await recordAudit(result, userId);
  return toAudited(result, auditId);
}

export async function aiTranscribe(audio: Buffer, userId?: string): Promise<AuditedResult<string>> {
  const result = await provider.transcribe(audio);
  const auditId = await recordAudit(result, userId);
  return toAudited(result, auditId);
}

export async function aiParseIngredients(
  text: string,
  userId?: string,
): Promise<AuditedResult<string[]>> {
  const prompt = await resolvePrompt('parse');
  const result = await provider.parseIngredients(text, prompt);
  const auditId = await recordAudit(result, userId);
  return toAudited(result, auditId);
}

export async function aiGenerateRecipe(
  input: GenerateRecipeInput,
  userId?: string,
): Promise<AuditedResult<GeneratedRecipe>> {
  const prompt = await resolvePrompt('generate');
  const result = await provider.generateRecipe(input, prompt);
  const auditId = await recordAudit(result, userId);
  return toAudited(result, auditId);
}

function toAudited<T>(result: AiResult<T>, auditId: string): AuditedResult<T> {
  return {
    ok: result.ok,
    auditId,
    ...(result.data !== undefined ? { data: result.data } : {}),
    ...(result.errorMessage !== undefined ? { errorMessage: result.errorMessage } : {}),
  };
}

export type { AiProvider, GeneratedRecipe, GenerateRecipeInput } from './types.js';
export { DEFAULT_PROMPTS } from './prompts.js';
