import type { DishFamily } from '@kinnijije/ui';

// The UI's placeholder art is keyed by a small set of dish "families". Real
// recipes carry a hero image; when they don't (placeholder), we derive a family
// from the name/keywords so the fallback art still feels right.
const KEYWORDS: ReadonlyArray<[DishFamily, readonly string[]]> = [
  ['jollof', ['jollof', 'fried rice', 'rice', 'coconut rice']],
  ['soup', ['soup', 'egusi', 'ogbono', 'efo', 'banga', 'afang', 'edikang', 'bitter leaf', 'okra']],
  ['beans', ['beans', 'moin', 'ewa', 'akara', 'asaro', 'pottage']],
  ['fried', ['fry', 'fried', 'plantain', 'dodo', 'gizdodo', 'puff', 'akara', 'chin']],
  ['stew', ['stew', 'sauce', 'pepper', 'buka', 'red stew', 'gizzard', 'liver']],
];

export function dishFamilyFor(name: string): DishFamily {
  const lower = name.toLowerCase();
  for (const [family, words] of KEYWORDS) {
    if (words.some((w) => lower.includes(w))) return family;
  }
  return 'stew';
}

// Whether a recipe hero URL is a real uploaded image (vs the placeholder), so we
// know to pass it to the card or fall back to family art.
export function realPhotoSrc(heroImageUrl: string, heroImageKind: string): string | undefined {
  return heroImageKind === 'placeholder' ? undefined : heroImageUrl;
}
