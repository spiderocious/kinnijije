import type { Express } from 'express';
import supertest from 'supertest';

import { buildApp } from '../src/app.js';
import { seedDefaults } from '../src/bootstrap.js';
import { hashPassword } from '../src/lib/auth/password.js';
import { repos } from '../src/repositories/index.js';
import { UserModel } from '../src/db/models/user.model.js';

export function app(): Express {
  return buildApp();
}

export function agent() {
  return supertest(buildApp());
}

// Register a fresh user and return their tokens + id.
export async function registerUser(
  overrides: Partial<{ email: string; name: string; password: string }> = {},
): Promise<{ id: string; email: string; tokens: { access_token: string; refresh_token: string } }> {
  const email = overrides.email ?? `user_${Math.floor(Math.random() * 1e9).toString(36)}@test.test`;
  const res = await agent()
    .post('/api/v1/auth/register')
    .send({ email, name: overrides.name ?? 'Test User', password: overrides.password ?? 'Password123!' })
    .expect(201);
  return { id: res.body.data.user.id, email, tokens: res.body.data.tokens };
}

// Create an admin directly (role can't be set via the public register route).
export async function createAdmin(): Promise<{
  id: string;
  tokens: { access_token: string; refresh_token: string };
}> {
  const email = `admin_${Math.floor(Math.random() * 1e9).toString(36)}@test.test`;
  await UserModel.create({
    email,
    name: 'Admin',
    role: 'admin',
    passwordHash: await hashPassword('Password123!'),
  });
  const res = await agent()
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password123!' })
    .expect(200);
  return { id: res.body.data.user.id, tokens: res.body.data.tokens };
}

export function authHeader(token: string): [string, string] {
  return ['Authorization', `Bearer ${token}`];
}

// Seed the default flags + prompts (some routes depend on them).
export async function bootstrap(): Promise<void> {
  await seedDefaults();
}

// A minimal published seed recipe for suggestion/recipe/favourite tests.
export async function seedRecipe(
  adminToken: string,
  overrides: Partial<{ name: string; ingredients: { name: string }[]; cuisines: string[] }> = {},
): Promise<string> {
  const create = await agent()
    .post('/api/v1/admin/recipes')
    .set(...authHeader(adminToken))
    .send({
      name: overrides.name ?? 'Jollof Rice',
      source: 'seed',
      status: 'draft',
      cuisines: overrides.cuisines ?? ['Nigerian'],
      difficulty: 'medium',
      cookTimeMinutes: 45,
      serves: 4,
      ingredients: overrides.ingredients ?? [
        { name: 'rice' },
        { name: 'tomatoes' },
        { name: 'pepper' },
        { name: 'onion' },
      ],
      steps: [{ heading: 'Cook', description: 'Cook everything together.', estMinutes: 45 }],
    })
    .expect(201);
  const id = create.body.data.recipe.id;
  await agent()
    .post(`/api/v1/admin/recipes/${id}/publish`)
    .set(...authHeader(adminToken))
    .expect(200);
  return id;
}

export { repos };
