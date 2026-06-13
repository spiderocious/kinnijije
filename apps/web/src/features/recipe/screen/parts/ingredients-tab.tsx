import { Show } from 'meemaw';

import { canonicaliseList } from '@kinnijije/core';
import type { Recipe } from '@kinnijije/core';
import { AppHaveNeed, AppText } from '@kinnijije/ui';

// Splits a recipe's ingredients into "you have" (green) vs "you need" (grey)
// using the session ingredients, canonicalised so "tomatoes" matches "tomato".
export function IngredientsTab({
  recipe,
  sessionIngredients,
}: {
  recipe: Recipe;
  sessionIngredients: string[];
}) {
  const haveKeys = new Set(canonicaliseList(sessionIngredients));
  const have: string[] = [];
  const need: string[] = [];
  for (const ing of recipe.ingredients) {
    const label = ing.quantity ? `${ing.name} · ${ing.quantity}` : ing.name;
    if (haveKeys.has(ing.canonicalKey)) have.push(label);
    else need.push(label);
  }

  return (
    <div className="flex flex-col gap-3">
      <AppHaveNeed have={have} need={need} />
      <Show when={recipe.ingredients.some((i) => i.approximate)}>
        <AppText variant="caption" className="text-[var(--warn)]">
          ≈ Quantities are approximate for AI recipes.
        </AppText>
      </Show>
    </div>
  );
}
