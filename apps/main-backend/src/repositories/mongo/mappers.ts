import type {
  User,
  Recipe,
  Favourite,
  Feedback,
  Extraction,
  AiAudit,
  Prompt,
  FeatureFlag,
} from '@kinnijije/core';

import { env } from '../../env.js';

// Doc → wire-shape mappers. Mongoose lean() docs are untyped-ish, so we narrow
// through a small `Doc` helper rather than `any`. Each mapper produces the exact
// core wire type the frontend consumes.

type Lean = Record<string, unknown>;

const idStr = (v: unknown): string => String(v);
const iso = (v: unknown): string => (v instanceof Date ? v.toISOString() : String(v ?? ''));
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' ? v : fallback);
const bool = (v: unknown, fallback = false): boolean => (typeof v === 'boolean' ? v : fallback);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

export function mapUser(doc: Lean): User {
  const prefs = (doc['prefs'] ?? {}) as Lean;
  return {
    id: idStr(doc['_id']),
    email: str(doc['email']),
    name: str(doc['name']),
    role: str(doc['role'], 'user') as User['role'],
    status: str(doc['status'], 'active') as User['status'],
    prefs: {
      cuisines: arr(prefs['cuisines']).map((c) => str(c)),
      difficultyFloor: str(prefs['difficultyFloor'], 'anything') as User['prefs']['difficultyFloor'],
      measurement: str(prefs['measurement'], 'metric') as User['prefs']['measurement'],
    },
    createdAt: iso(doc['createdAt']),
  };
}

// Recipe hero is stored as an R2 key; the caller supplies a resolver (the
// FileService view-URL fn) or we fall back to the placeholder.
export function mapRecipe(doc: Lean, resolveHeroUrl: (key: string) => string): Recipe {
  const key = doc['heroImageKey'];
  const heroImageUrl =
    typeof key === 'string' && key.length > 0 ? resolveHeroUrl(key) : env.RECIPE_PLACEHOLDER_IMAGE;
  return {
    id: idStr(doc['_id']),
    slug: str(doc['slug']),
    source: str(doc['source'], 'seed') as Recipe['source'],
    status: str(doc['status'], 'draft') as Recipe['status'],
    name: str(doc['name']),
    cuisines: arr(doc['cuisines']).map((c) => str(c)),
    difficulty: str(doc['difficulty'], 'medium') as Recipe['difficulty'],
    cookTimeMinutes: num(doc['cookTimeMinutes'], 30),
    serves: num(doc['serves'], 4),
    heroImageUrl,
    heroImageKind: str(doc['heroImageKind'], 'placeholder') as Recipe['heroImageKind'],
    ingredients: arr(doc['ingredients']).map((i) => {
      const ing = i as Lean;
      const base = {
        name: str(ing['name']),
        approximate: bool(ing['approximate']),
        canonicalKey: str(ing['canonicalKey']),
      };
      const q = ing['quantity'];
      return typeof q === 'string' ? { ...base, quantity: q } : base;
    }),
    steps: arr(doc['steps']).map((s) => {
      const step = s as Lean;
      const base = {
        index: num(step['index']),
        heading: str(step['heading']),
        description: str(step['description']),
      };
      const e = step['estMinutes'];
      return typeof e === 'number' ? { ...base, estMinutes: e } : base;
    }),
    createdAt: iso(doc['createdAt']),
    updatedAt: iso(doc['updatedAt']),
  };
}

export function mapFavourite(doc: Lean): Favourite {
  // The snapshot is an already-presented Recipe (wire shape with `id` and a
  // resolved `heroImageUrl`), not a raw Mongo doc — pass it straight through.
  const snapshot = (doc['savedSnapshot'] ?? {}) as Recipe;
  return {
    id: idStr(doc['_id']),
    recipeId: idStr(doc['recipeId']),
    recipe: snapshot,
    createdAt: iso(doc['createdAt']),
  };
}

export function mapFeedback(doc: Lean): Feedback {
  const target = (doc['target'] ?? {}) as Lean;
  const base = {
    id: idStr(doc['_id']),
    recipeId: idStr(doc['recipeId']),
    userId: idStr(doc['userId']),
    target: {
      kind: str(target['kind'], 'step') as Feedback['target']['kind'],
      index: num(target['index']),
    },
    status: str(doc['status'], 'open') as Feedback['status'],
    createdAt: iso(doc['createdAt']),
  };
  const note = doc['note'];
  return typeof note === 'string' ? { ...base, note } : base;
}

export function mapExtraction(doc: Lean, resolveUrl: (key: string) => string): Extraction {
  const base = {
    id: idStr(doc['_id']),
    userId: idStr(doc['userId']),
    kind: str(doc['kind'], 'photo') as Extraction['kind'],
    inputUrls: arr(doc['inputKeys']).map((k) => resolveUrl(str(k))),
    extractedIngredients: arr(doc['extractedIngredients']).map((i) => str(i)),
    createdAt: iso(doc['createdAt']),
  };
  const transcript = doc['transcript'];
  const aiAuditId = doc['aiAuditId'];
  return {
    ...base,
    ...(typeof transcript === 'string' ? { transcript } : {}),
    ...(aiAuditId ? { aiAuditId: idStr(aiAuditId) } : {}),
  };
}

export function mapAiAudit(doc: Lean): AiAudit {
  const base = {
    id: idStr(doc['_id']),
    kind: str(doc['kind'], 'parse') as AiAudit['kind'],
    provider: str(doc['provider']),
    model: str(doc['model']),
    input: doc['input'],
    rawOutput: doc['rawOutput'],
    status: str(doc['status'], 'ok') as AiAudit['status'],
    latencyMs: num(doc['latencyMs']),
    costEstimateUsd: num(doc['costEstimateUsd']),
    createdAt: iso(doc['createdAt']),
  };
  const userId = doc['userId'];
  const promptKey = doc['promptKey'];
  const promptVersion = doc['promptVersion'];
  const parsedOutput = doc['parsedOutput'];
  const errorMessage = doc['errorMessage'];
  return {
    ...base,
    ...(userId ? { userId: idStr(userId) } : {}),
    ...(typeof promptKey === 'string' ? { promptKey } : {}),
    ...(typeof promptVersion === 'number' ? { promptVersion } : {}),
    ...(parsedOutput !== undefined && parsedOutput !== null ? { parsedOutput } : {}),
    ...(typeof errorMessage === 'string' ? { errorMessage } : {}),
  };
}

export function mapPrompt(doc: Lean): Prompt {
  const base = {
    id: idStr(doc['_id']),
    key: str(doc['key'], 'parse') as Prompt['key'],
    version: num(doc['version'], 1),
    template: str(doc['template']),
    active: bool(doc['active']),
    createdAt: iso(doc['createdAt']),
  };
  const notes = doc['notes'];
  return typeof notes === 'string' ? { ...base, notes } : base;
}

export function mapFeatureFlag(doc: Lean): FeatureFlag {
  return {
    key: str(doc['key']),
    enabled: bool(doc['enabled'], true),
    description: str(doc['description']),
    updatedAt: iso(doc['updatedAt'] ?? doc['createdAt']),
  };
}
