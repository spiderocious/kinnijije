import { canonicaliseList, type Recipe, type SuggestionCard, type User } from '@kinnijije/core';

import { aiGenerateRecipe } from '../../ai/index.js';
import { repos } from '../../repositories/index.js';
import { presentRecipe } from '../recipes/recipe.presenter.js';
import { slugify } from '../admin/recipe-shape.js';

const MIN_OVERLAP_RATIO = 0.6; // a recipe is a "strong match" at ≥60% key overlap
const CANDIDATE_LIMIT = 30;

interface ScoredRecipe {
  recipe: Recipe;
  haveKeys: string[];
  overlapRatio: number;
}

// How many of the recipe's canonical ingredient keys the user supplied.
function score(recipe: Recipe, userKeys: Set<string>): ScoredRecipe {
  const recipeKeys = recipe.ingredients.map((i) => i.canonicalKey);
  const distinct = new Set(recipeKeys);
  const have = [...distinct].filter((k) => userKeys.has(k));
  const overlapRatio = distinct.size === 0 ? 0 : have.length / distinct.size;
  return { recipe, haveKeys: have, overlapRatio };
}

function toCard(scored: ScoredRecipe, userKeys: Set<string>): SuggestionCard {
  const recipe = presentRecipe(scored.recipe);
  const distinctKeys = [...new Set(recipe.ingredients.map((i) => i.canonicalKey))];
  const have = recipe.ingredients
    .filter((i) => userKeys.has(i.canonicalKey))
    .map((i) => i.name);
  const need = recipe.ingredients
    .filter((i) => !userKeys.has(i.canonicalKey))
    .map((i) => i.name);
  return {
    recipeId: recipe.id,
    name: recipe.name,
    source: recipe.source,
    heroImageUrl: recipe.heroImageUrl,
    difficulty: recipe.difficulty,
    cookTimeMinutes: recipe.cookTimeMinutes,
    match: { have: have.length, total: distinctKeys.length, needCount: need.length },
    haveIngredients: have,
    needIngredients: need,
  };
}

// Apply the user's cuisine bias as a hard filter (a user who picked only
// Asian + Mediterranean never gets egusi). Empty prefs = no filter.
function matchesCuisine(recipe: Recipe, prefs: User['prefs']): boolean {
  if (prefs.cuisines.length === 0) return true;
  const wanted = new Set(prefs.cuisines.map((c) => c.toLowerCase()));
  return recipe.cuisines.some((c) => wanted.has(c.toLowerCase()));
}

function meetsDifficultyFloor(recipe: Recipe, floor: User['prefs']['difficultyFloor']): boolean {
  if (floor === 'anything') return true;
  const order = { easy: 0, medium: 1, involved: 2 } as const;
  const floorRank = floor === 'easy' ? 0 : 1;
  return order[recipe.difficulty] <= floorRank + 1; // allow up to one step above the floor
}

export async function suggest(input: {
  userId: string;
  ingredients: string[];
  excludeRecipeIds?: string[];
}): Promise<SuggestionCard[]> {
  const userKeysList = canonicaliseList(input.ingredients);
  const userKeys = new Set(userKeysList);
  const exclude = new Set(input.excludeRecipeIds ?? []);

  const user = await repos.users.findById(input.userId);
  const prefs = user?.prefs ?? { cuisines: [], difficultyFloor: 'anything' as const, measurement: 'metric' as const };

  // Record the session ingredients for "pick from recent".
  if (userKeysList.length > 0) {
    await repos.users.pushRecentIngredients(input.userId, userKeysList);
  }

  // 1. Candidate published seed recipes that share any key.
  const candidates = await repos.recipes.findPublishedMatching(userKeysList, CANDIDATE_LIMIT);

  // 2. Score, filter by prefs, sort by overlap.
  const scored = candidates
    .filter((r) => !exclude.has(r.id))
    .filter((r) => matchesCuisine(r, prefs))
    .filter((r) => meetsDifficultyFloor(r, prefs.difficultyFloor))
    .map((r) => score(r, userKeys))
    .sort((a, b) => b.overlapRatio - a.overlapRatio);

  const strong = scored.filter((s) => s.overlapRatio >= MIN_OVERLAP_RATIO);
  const cards: SuggestionCard[] = [];

  // 3. Take up to 2 strong seed matches (or whatever seed matches exist).
  const seedTake = strong.length >= 2 ? strong.slice(0, 2) : scored.slice(0, 2);
  for (const s of seedTake) cards.push(toCard(s, userKeys));

  // 4. Fill the remainder (to 3) with AI generation, if the flag is on.
  const aiEnabled = await repos.featureFlags.isEnabled('ai.generation', true);
  while (cards.length < 3 && aiEnabled) {
    const generated = await generateAndPersist(input.userId, userKeysList, prefs);
    if (!generated) break;
    cards.push(toCard(score(generated, userKeys), userKeys));
  }

  return cards.slice(0, 3);
}

// Generate an AI recipe, persist it (source 'ai', published so it can be opened
// + favourited), and return it. Returns null on AI failure (we just show fewer
// cards rather than erroring the whole request).
async function generateAndPersist(
  userId: string,
  ingredients: string[],
  prefs: User['prefs'],
): Promise<Recipe | null> {
  const result = await aiGenerateRecipe(
    { ingredients, cuisines: prefs.cuisines, difficultyFloor: prefs.difficultyFloor },
    userId,
  );
  if (!result.ok || !result.data) return null;

  const g = result.data;
  const ingredientDocs = g.ingredients.map((i) => ({
    name: i.name,
    approximate: true,
    canonicalKey: canonicaliseList([i.name])[0] ?? i.name.toLowerCase(),
    ...(i.quantity !== undefined ? { quantity: i.quantity } : {}),
  }));
  const steps = g.steps.map((s, index) => ({
    index,
    heading: s.heading,
    description: s.description,
    ...(s.estMinutes !== undefined ? { estMinutes: s.estMinutes } : {}),
  }));

  return repos.recipes.create({
    slug: `${slugify(g.name)}-${Date.now().toString(36)}`,
    source: 'ai',
    status: 'published',
    name: g.name,
    cuisines: g.cuisines,
    difficulty: g.difficulty,
    cookTimeMinutes: g.cookTimeMinutes, // raw; presenter pads +30% on read
    serves: g.serves,
    ingredients: ingredientDocs,
    steps,
    searchKeys: ingredientDocs.map((i) => i.canonicalKey),
    createdBy: userId,
    sourceAuditId: result.auditId,
  });
}
