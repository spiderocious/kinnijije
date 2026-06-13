import { describe, expect, it } from 'vitest';

import {
  canonicaliseIngredient,
  canonicaliseList,
  suggestIngredients,
} from '@kinnijije/core';

describe('canonicaliseIngredient', () => {
  it('collapses plural and spelling variants to one key', () => {
    expect(canonicaliseIngredient('tomatoes')).toBe('tomato');
    expect(canonicaliseIngredient('Fresh Tomatoes')).toBe('tomato');
    expect(canonicaliseIngredient('tin tomato')).toBe('tomato');
  });

  it('maps Nigerian aliases to their staple key', () => {
    expect(canonicaliseIngredient('titus')).toBe('fish');
    expect(canonicaliseIngredient('ata rodo')).toBe('pepper');
    expect(canonicaliseIngredient('scotch bonnet')).toBe('pepper');
    expect(canonicaliseIngredient('dodo')).toBe('plantain');
    expect(canonicaliseIngredient('iru')).toBe('locust beans');
  });

  it('finds the key inside a multi-word phrase', () => {
    expect(canonicaliseIngredient('scotch bonnet pepper')).toBe('pepper');
    expect(canonicaliseIngredient('some leftover white rice')).toBe('rice');
  });

  it('falls back to the normalised phrase for unknown ingredients', () => {
    expect(canonicaliseIngredient('dragonfruit')).toBe('dragonfruit');
  });

  it('returns empty string for noise-only input', () => {
    expect(canonicaliseIngredient('   ')).toBe('');
    expect(canonicaliseIngredient('!!!')).toBe('');
  });
});

describe('canonicaliseList', () => {
  it('dedupes after canonicalisation', () => {
    expect(canonicaliseList(['tomatoes', 'tomato', 'fresh tomato', 'rice'])).toEqual([
      'tomato',
      'rice',
    ]);
  });
});

describe('suggestIngredients', () => {
  it('prefix matches rank ahead of contains matches', () => {
    const out = suggestIngredients('pep');
    expect(out).toContain('pepper');
  });

  it('returns the dictionary when query is empty', () => {
    expect(suggestIngredients('').length).toBeGreaterThan(0);
  });
});
