import { INGREDIENT_ALIASES } from './dictionary.js';

// Build a reverse lookup (alias → canonical key) once at module load. Aliases
// are stored lowercase; we normalise the input the same way before lookup.
const ALIAS_TO_KEY: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const [key, aliases] of Object.entries(INGREDIENT_ALIASES)) {
    map.set(key, key);
    for (const alias of aliases) map.set(alias.toLowerCase().trim(), key);
  }
  return map;
})();

// Lowercase, strip punctuation/extra whitespace, and drop a few noise words so
// "Fresh Tomatoes!" and "some tomato" both reduce to "tomato" for lookup.
const NOISE_WORDS = new Set([
  'some', 'fresh', 'a', 'an', 'the', 'of', 'few', 'little', 'bit', 'leftover',
  'half', 'small', 'big', 'large', 'frozen', 'dried', 'raw', 'cooked',
]);

function normaliseText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !NOISE_WORDS.has(w))
    .join(' ')
    .trim();
}

function singularise(word: string): string {
  if (word.endsWith('ies') && word.length > 3) return `${word.slice(0, -3)}y`;
  if (word.endsWith('oes') && word.length > 3) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

/**
 * Normalise a free-text ingredient to its canonical key. Tries, in order:
 *   1. the full normalised phrase,
 *   2. the singularised phrase,
 *   3. each token (so "scotch bonnet pepper" still finds `pepper`).
 * Falls back to the normalised phrase itself (so unknown but real ingredients
 * still participate in matching by their own name).
 */
export function canonicaliseIngredient(raw: string): string {
  const normalised = normaliseText(raw);
  if (normalised.length === 0) return '';

  const direct = ALIAS_TO_KEY.get(normalised);
  if (direct) return direct;

  const singular = normalised.split(' ').map(singularise).join(' ');
  const singularHit = ALIAS_TO_KEY.get(singular);
  if (singularHit) return singularHit;

  for (const token of singular.split(' ')) {
    const tokenHit = ALIAS_TO_KEY.get(token);
    if (tokenHit) return tokenHit;
  }

  return singular;
}

/** Canonicalise a list, de-duplicating and dropping empties. */
export function canonicaliseList(raws: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of raws) {
    const key = canonicaliseIngredient(raw);
    if (key.length > 0 && !seen.has(key)) {
      seen.add(key);
      out.push(key);
    }
  }
  return out;
}

/** All known canonical keys — used to power Type-method autosuggest. */
export function allCanonicalKeys(): string[] {
  return Object.keys(INGREDIENT_ALIASES);
}

/**
 * Autosuggest: given a partial query, return canonical keys whose key or any
 * alias starts with / contains the query. Ranked: prefix matches first.
 */
export function suggestIngredients(query: string, limit = 10): string[] {
  const q = normaliseText(query);
  if (q.length === 0) return allCanonicalKeys().slice(0, limit);

  const prefix: string[] = [];
  const contains: string[] = [];
  for (const [key, aliases] of Object.entries(INGREDIENT_ALIASES)) {
    const hay = [key, ...aliases];
    if (hay.some((h) => h.startsWith(q))) prefix.push(key);
    else if (hay.some((h) => h.includes(q))) contains.push(key);
  }
  return [...prefix, ...contains].slice(0, limit);
}
