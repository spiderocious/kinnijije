import { beforeEach, describe, expect, it } from 'vitest';

import { SuggestionCardSchema } from '@kinnijije/core';

import { agent, authHeader, bootstrap, createAdmin, registerUser, seedRecipe } from '../helpers.js';

describe('suggestions + recipes + favourites + feedback', () => {
  beforeEach(async () => {
    await bootstrap();
  });

  it('returns exactly 3 suggestion cards conforming to the schema', async () => {
    const admin = await createAdmin();
    await seedRecipe(admin.tokens.access_token, {
      name: 'Jollof Rice',
      ingredients: [{ name: 'rice' }, { name: 'tomatoes' }, { name: 'pepper' }, { name: 'onion' }],
    });
    const user = await registerUser();

    const res = await agent()
      .post('/api/v1/suggestions')
      .set(...authHeader(user.tokens.access_token))
      .send({ ingredients: ['rice', 'tomatoes', 'pepper', 'onion', 'chicken'] })
      .expect(200);

    const cards = res.body.data.suggestions;
    expect(cards).toHaveLength(3);
    // Every card matches the wire contract.
    for (const card of cards) {
      expect(() => SuggestionCardSchema.parse(card)).not.toThrow();
    }
    // The seeded jollof should be among them as a strong match.
    const jollof = cards.find((c: { name: string }) => c.name === 'Jollof Rice');
    expect(jollof).toBeDefined();
    expect(jollof.source).toBe('seed');
    expect(jollof.match.have).toBeGreaterThanOrEqual(3);
  });

  it('re-suggest excludes the given recipe ids', async () => {
    const admin = await createAdmin();
    const jollofId = await seedRecipe(admin.tokens.access_token, { name: 'Jollof Rice' });
    const user = await registerUser();

    const res = await agent()
      .post('/api/v1/suggestions')
      .set(...authHeader(user.tokens.access_token))
      .send({ ingredients: ['rice', 'tomatoes', 'pepper'], excludeRecipeIds: [jollofId] })
      .expect(200);

    const ids = res.body.data.suggestions.map((c: { recipeId: string }) => c.recipeId);
    expect(ids).not.toContain(jollofId);
  });

  it('respects the cuisine preference hard filter', async () => {
    const admin = await createAdmin();
    await seedRecipe(admin.tokens.access_token, { name: 'Jollof Rice', cuisines: ['Nigerian'] });
    const user = await registerUser();
    // User only wants Asian → the Nigerian jollof must not be a seed suggestion.
    await agent()
      .patch('/api/v1/me/prefs')
      .set(...authHeader(user.tokens.access_token))
      .send({ cuisines: ['Asian'] })
      .expect(200);

    const res = await agent()
      .post('/api/v1/suggestions')
      .set(...authHeader(user.tokens.access_token))
      .send({ ingredients: ['rice', 'tomatoes', 'pepper'] })
      .expect(200);

    const seedCards = res.body.data.suggestions.filter((c: { source: string }) => c.source === 'seed');
    expect(seedCards.find((c: { name: string }) => c.name === 'Jollof Rice')).toBeUndefined();
  });

  it('opens a recipe, saves it, lists favourites, then unsaves', async () => {
    const admin = await createAdmin();
    const recipeId = await seedRecipe(admin.tokens.access_token);
    const user = await registerUser();
    const h = authHeader(user.tokens.access_token);

    const recipe = await agent().get(`/api/v1/recipes/${recipeId}`).set(...h).expect(200);
    expect(recipe.body.data.recipe.id).toBe(recipeId);

    await agent().post('/api/v1/favourites').set(...h).send({ recipeId }).expect(201);
    // Duplicate save → conflict.
    await agent().post('/api/v1/favourites').set(...h).send({ recipeId }).expect(409);

    const list = await agent().get('/api/v1/favourites').set(...h).expect(200);
    expect(list.body.data.items).toHaveLength(1);
    expect(list.body.data.hasMore).toBe(false);
    expect(list.body.data.nextCursor).toBeNull();
    expect(list.body.data.items[0].recipe.id).toBe(recipeId);

    await agent().delete(`/api/v1/favourites/${recipeId}`).set(...h).expect(204);
    const after = await agent().get('/api/v1/favourites').set(...h).expect(200);
    expect(after.body.data.items).toHaveLength(0);
  });

  it('flags a step on a recipe', async () => {
    const admin = await createAdmin();
    const recipeId = await seedRecipe(admin.tokens.access_token);
    const user = await registerUser();

    const res = await agent()
      .post('/api/v1/feedback')
      .set(...authHeader(user.tokens.access_token))
      .send({ recipeId, target: { kind: 'step', index: 0 }, note: 'Stir until oil floats' })
      .expect(201);
    expect(res.body.data.feedback.status).toBe('open');
  });
});
