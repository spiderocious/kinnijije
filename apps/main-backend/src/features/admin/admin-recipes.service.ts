import type { Recipe } from '@kinnijije/core';

import { aiGenerateRecipe } from '../../ai/index.js';
import { AppError } from '@lib/errors.js';
import { HTTP_STATUS } from '@shared/constants/http-status.js';
import { repos } from '../../repositories/index.js';
import { searchKeysFor, shapeIngredients, slugify } from './recipe-shape.js';
import type { CreateRecipeBody, GenerateRecipeBody, UpdateRecipeBody } from './admin.schema.js';

export async function createRecipe(body: CreateRecipeBody, adminId: string): Promise<Recipe> {
  const ingredients = shapeIngredients(body.ingredients);
  const steps = body.steps.map((s, index) => ({
    index,
    heading: s.heading,
    description: s.description,
    ...(s.estMinutes !== undefined ? { estMinutes: s.estMinutes } : {}),
  }));
  return repos.recipes.create({
    slug: `${slugify(body.name)}-${Date.now().toString(36)}`,
    source: body.source,
    status: body.status,
    name: body.name,
    cuisines: body.cuisines,
    difficulty: body.difficulty,
    cookTimeMinutes: body.cookTimeMinutes,
    serves: body.serves,
    ingredients,
    steps,
    searchKeys: searchKeysFor(ingredients),
    createdBy: adminId,
  });
}

export async function updateRecipe(id: string, body: UpdateRecipeBody): Promise<Recipe> {
  const existing = await repos.recipes.findById(id);
  if (!existing) throw new AppError('not_found', 'Recipe not found', HTTP_STATUS.NOT_FOUND);

  const patch: Parameters<typeof repos.recipes.update>[1] = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.source !== undefined) patch.source = body.source;
  if (body.status !== undefined) patch.status = body.status;
  if (body.cuisines !== undefined) patch.cuisines = body.cuisines;
  if (body.difficulty !== undefined) patch.difficulty = body.difficulty;
  if (body.cookTimeMinutes !== undefined) patch.cookTimeMinutes = body.cookTimeMinutes;
  if (body.serves !== undefined) patch.serves = body.serves;
  if (body.ingredients !== undefined) {
    const ingredients = shapeIngredients(body.ingredients);
    patch.ingredients = ingredients;
    patch.searchKeys = searchKeysFor(ingredients);
  }
  if (body.steps !== undefined) {
    patch.steps = body.steps.map((s, index) => ({
      index,
      heading: s.heading,
      description: s.description,
      ...(s.estMinutes !== undefined ? { estMinutes: s.estMinutes } : {}),
    }));
  }

  const updated = await repos.recipes.update(id, patch);
  if (!updated) throw new AppError('not_found', 'Recipe not found', HTTP_STATUS.NOT_FOUND);
  return updated;
}

// Generate an AI recipe and save it as a DRAFT for the admin to review, edit and
// publish. Distinct from the consumer suggestion path (which auto-publishes).
export async function generateToDraft(body: GenerateRecipeBody, adminId: string): Promise<Recipe> {
  const result = await aiGenerateRecipe(
    { ingredients: body.ingredients, cuisines: body.cuisines, difficultyFloor: body.difficultyFloor },
    adminId,
  );
  if (!result.ok || !result.data) {
    throw new AppError('ai_unavailable', result.errorMessage ?? 'AI generation failed', HTTP_STATUS.BAD_GATEWAY);
  }
  const g = result.data;
  const ingredients = shapeIngredients(g.ingredients.map((i) => ({ ...i, approximate: true })));
  const steps = g.steps.map((s, index) => ({
    index,
    heading: s.heading,
    description: s.description,
    ...(s.estMinutes !== undefined ? { estMinutes: s.estMinutes } : {}),
  }));
  return repos.recipes.create({
    slug: `${slugify(g.name)}-${Date.now().toString(36)}`,
    source: 'ai',
    status: 'draft',
    name: g.name,
    cuisines: g.cuisines,
    difficulty: g.difficulty,
    cookTimeMinutes: g.cookTimeMinutes,
    serves: g.serves,
    ingredients,
    steps,
    searchKeys: searchKeysFor(ingredients),
    createdBy: adminId,
    sourceAuditId: result.auditId,
  });
}
