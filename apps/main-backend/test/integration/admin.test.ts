import { beforeEach, describe, expect, it } from 'vitest';

import { AiAuditSchema, RecipeSchema } from '@kinnijije/core';

import { agent, authHeader, bootstrap, createAdmin, registerUser } from '../helpers.js';

describe('admin', () => {
  beforeEach(async () => {
    await bootstrap();
  });

  it('blocks non-admins from admin routes (403) and unauthenticated (401)', async () => {
    await agent().get('/api/v1/admin/metrics').expect(401);
    const user = await registerUser();
    await agent()
      .get('/api/v1/admin/metrics')
      .set(...authHeader(user.tokens.access_token))
      .expect(403);
  });

  it('admin can seed a recipe, publish it, and it conforms to the schema', async () => {
    const admin = await createAdmin();
    const h = authHeader(admin.tokens.access_token);

    const created = await agent()
      .post('/api/v1/admin/recipes')
      .set(...h)
      .send({
        name: 'Egusi Soup',
        difficulty: 'medium',
        cookTimeMinutes: 50,
        cuisines: ['Nigerian'],
        ingredients: [{ name: 'egusi' }, { name: 'ugu' }, { name: 'palm oil' }],
        steps: [{ heading: 'Boil', description: 'Boil the meat.', estMinutes: 20 }],
      })
      .expect(201);

    const recipe = created.body.data.recipe;
    expect(() => RecipeSchema.parse(recipe)).not.toThrow();
    expect(recipe.status).toBe('draft');
    // search keys derived (egusi canonicalises to itself).
    expect(recipe.heroImageKind).toBe('placeholder');

    await agent().post(`/api/v1/admin/recipes/${recipe.id}/publish`).set(...h).expect(200);
    const list = await agent()
      .get('/api/v1/admin/recipes?status=published')
      .set(...h)
      .expect(200);
    expect(list.body.data.items.some((r: { id: string }) => r.id === recipe.id)).toBe(true);
  });

  it('admin generate-to-draft creates an AI recipe + an audit entry', async () => {
    const admin = await createAdmin();
    const h = authHeader(admin.tokens.access_token);

    const gen = await agent()
      .post('/api/v1/admin/recipes/generate')
      .set(...h)
      .send({ ingredients: ['rice', 'pepper'], cuisines: ['Nigerian'], difficultyFloor: 'anything' })
      .expect(201);
    expect(gen.body.data.recipe.source).toBe('ai');
    expect(gen.body.data.recipe.status).toBe('draft');

    // The AI call was audited (provider: mock under test).
    const audit = await agent().get('/api/v1/admin/ai-audit').set(...h).expect(200);
    expect(audit.body.data.items.length).toBeGreaterThanOrEqual(1);
    const entry = audit.body.data.items[0];
    expect(() => AiAuditSchema.parse(entry)).not.toThrow();
    expect(entry.provider).toBe('mock');
    expect(entry.kind).toBe('generate');
  });

  it('admin lists + toggles feature flags; toggling input.photo gates the route', async () => {
    const admin = await createAdmin();
    const h = authHeader(admin.tokens.access_token);

    const flags = await agent().get('/api/v1/admin/feature-flags').set(...h).expect(200);
    expect(flags.body.data.flags.find((f: { key: string }) => f.key === 'input.photo')).toBeDefined();

    // Turn photo input OFF.
    await agent()
      .patch('/api/v1/admin/feature-flags/input.photo')
      .set(...h)
      .send({ enabled: false })
      .expect(200);

    // A user's photo-extract call is now blocked (403 feature_disabled).
    const user = await registerUser();
    const res = await agent()
      .post('/api/v1/ingredients/extract/photo')
      .set(...authHeader(user.tokens.access_token))
      .send({ keys: ['some-key.jpg'] })
      .expect(403);
    expect(res.body.error.code).toBe('feature_disabled');
  });

  it('admin edits a prompt → new active version', async () => {
    const admin = await createAdmin();
    const h = authHeader(admin.tokens.access_token);

    const put = await agent()
      .put('/api/v1/admin/prompts/generate')
      .set(...h)
      .send({ template: 'New generate template', notes: 'tuned' })
      .expect(201);
    expect(put.body.data.prompt.active).toBe(true);
    expect(put.body.data.prompt.version).toBeGreaterThanOrEqual(2); // seeded v1 + this

    const versions = await agent().get('/api/v1/admin/prompts/generate').set(...h).expect(200);
    const active = versions.body.data.versions.filter((p: { active: boolean }) => p.active);
    expect(active).toHaveLength(1);
    expect(active[0].template).toBe('New generate template');
  });

  it('admin can suspend a user, which blocks their login', async () => {
    const admin = await createAdmin();
    const h = authHeader(admin.tokens.access_token);
    const user = await registerUser({ email: 'victim@test.test', password: 'Password123!' });

    await agent()
      .patch(`/api/v1/admin/users/${user.id}`)
      .set(...h)
      .send({ status: 'suspended' })
      .expect(200);

    const res = await agent()
      .post('/api/v1/auth/login')
      .send({ email: 'victim@test.test', password: 'Password123!' })
      .expect(403);
    expect(res.body.error.code).toBe('forbidden');
  });
});
