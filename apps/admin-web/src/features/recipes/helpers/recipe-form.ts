import type { Recipe } from '@kinnijije/core';

import type { RecipePayload } from '../api/use-recipes.ts';

// The editable form shape. Quantities/estMinutes are strings while editing
// (free text inputs) and coerced on submit. Kept separate from the API payload
// so the form can hold partial/in-progress values without fighting the wire type.
export interface RecipeFormState {
  name: string;
  cuisines: string; // comma-separated in the form
  difficulty: 'easy' | 'medium' | 'involved';
  cookTimeMinutes: string;
  serves: string;
  ingredients: { name: string; quantity: string }[];
  steps: { heading: string; description: string; estMinutes: string }[];
}

export const EMPTY_FORM: RecipeFormState = {
  name: '',
  cuisines: 'Nigerian',
  difficulty: 'medium',
  cookTimeMinutes: '30',
  serves: '4',
  ingredients: [{ name: '', quantity: '' }],
  steps: [{ heading: '', description: '', estMinutes: '' }],
};

export function recipeToForm(recipe: Recipe): RecipeFormState {
  return {
    name: recipe.name,
    cuisines: recipe.cuisines.join(', '),
    difficulty: recipe.difficulty,
    cookTimeMinutes: String(recipe.cookTimeMinutes),
    serves: String(recipe.serves),
    ingredients:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((i) => ({ name: i.name, quantity: i.quantity ?? '' }))
        : [{ name: '', quantity: '' }],
    steps:
      recipe.steps.length > 0
        ? recipe.steps.map((s) => ({
            heading: s.heading,
            description: s.description,
            estMinutes: s.estMinutes !== undefined ? String(s.estMinutes) : '',
          }))
        : [{ heading: '', description: '', estMinutes: '' }],
  };
}

export interface FormErrors {
  name?: string;
  cookTimeMinutes?: string;
  serves?: string;
  ingredients?: string;
  steps?: string;
}

export function validateForm(form: RecipeFormState): FormErrors {
  const errors: FormErrors = {};
  if (form.name.trim().length === 0) errors.name = 'A name is required';
  if (!Number.isFinite(Number(form.cookTimeMinutes)) || Number(form.cookTimeMinutes) <= 0)
    errors.cookTimeMinutes = 'Enter a positive number of minutes';
  if (!Number.isFinite(Number(form.serves)) || Number(form.serves) <= 0)
    errors.serves = 'Enter a positive number';
  if (form.ingredients.every((i) => i.name.trim().length === 0))
    errors.ingredients = 'Add at least one ingredient';
  if (form.steps.every((s) => s.heading.trim().length === 0 || s.description.trim().length === 0))
    errors.steps = 'Add at least one complete step';
  return errors;
}

// Coerce the form into the API payload. `status` is decided by the caller
// (save-as-draft vs the existing status). Source defaults to 'seed' for new
// human-authored recipes.
export function formToPayload(
  form: RecipeFormState,
  opts: { status: RecipePayload['status']; source: RecipePayload['source'] },
): RecipePayload {
  return {
    name: form.name.trim(),
    source: opts.source,
    status: opts.status,
    cuisines: form.cuisines
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0),
    difficulty: form.difficulty,
    cookTimeMinutes: Number(form.cookTimeMinutes),
    serves: Number(form.serves),
    ingredients: form.ingredients
      .filter((i) => i.name.trim().length > 0)
      .map((i) => ({
        name: i.name.trim(),
        ...(i.quantity.trim().length > 0 ? { quantity: i.quantity.trim() } : {}),
      })),
    steps: form.steps
      .filter((s) => s.heading.trim().length > 0 && s.description.trim().length > 0)
      .map((s) => ({
        heading: s.heading.trim(),
        description: s.description.trim(),
        ...(s.estMinutes.trim().length > 0 && Number.isFinite(Number(s.estMinutes))
          ? { estMinutes: Number(s.estMinutes) }
          : {}),
      })),
  };
}
