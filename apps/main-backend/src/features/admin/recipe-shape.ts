import { canonicaliseIngredient } from '@kinnijije/core';

// Shared helpers for shaping recipe input into the persisted form: slug
// generation and search-key derivation. Used by admin create/edit and by AI
// generation.

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export interface RawIngredient {
  name: string;
  quantity?: string | undefined;
  approximate?: boolean | undefined;
}

export interface ShapedIngredient {
  name: string;
  quantity?: string;
  approximate: boolean;
  canonicalKey: string;
}

export function shapeIngredients(raw: RawIngredient[]): ShapedIngredient[] {
  return raw.map((i) => ({
    name: i.name,
    approximate: i.approximate ?? false,
    canonicalKey: canonicaliseIngredient(i.name) || i.name.toLowerCase(),
    ...(i.quantity !== undefined ? { quantity: i.quantity } : {}),
  }));
}

export function searchKeysFor(ingredients: ShapedIngredient[]): string[] {
  return [...new Set(ingredients.map((i) => i.canonicalKey))];
}
