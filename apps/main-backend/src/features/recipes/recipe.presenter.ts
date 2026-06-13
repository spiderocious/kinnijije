import type { Recipe } from '@kinnijije/core';

// AI cook times are systematically underestimated — pad by 30% on display (PRD
// build note). Seed recipes are human-tested, so they pass through unchanged.
const AI_TIME_PAD = 1.3;

export function presentRecipe(recipe: Recipe): Recipe {
  if (recipe.source !== 'ai') return recipe;
  return {
    ...recipe,
    cookTimeMinutes: Math.round(recipe.cookTimeMinutes * AI_TIME_PAD),
    steps: recipe.steps.map((s) =>
      s.estMinutes !== undefined
        ? { ...s, estMinutes: Math.round(s.estMinutes * AI_TIME_PAD) }
        : s,
    ),
  };
}
