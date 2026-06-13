import { beforeEach, describe, expect, it } from 'vitest';

import { agent, authHeader, bootstrap, registerUser } from '../helpers.js';

describe('auth + account', () => {
  beforeEach(async () => {
    await bootstrap();
  });

  it('registers a user and returns tokens + public user (no passwordHash)', async () => {
    const res = await agent()
      .post('/api/v1/auth/register')
      .send({ email: 'ade@test.test', name: 'Ade', password: 'Password123!' })
      .expect(201);

    expect(res.body.data.user.email).toBe('ade@test.test');
    expect(res.body.data.user.role).toBe('user');
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data.tokens.access_token).toBeTruthy();
    expect(res.body.data.tokens.refresh_token).toBeTruthy();
    // Default prefs applied.
    expect(res.body.data.user.prefs.cuisines).toContain('Nigerian');
  });

  it('rejects a duplicate email with 409 conflict', async () => {
    await registerUser({ email: 'dup@test.test' });
    const res = await agent()
      .post('/api/v1/auth/register')
      .send({ email: 'dup@test.test', name: 'X', password: 'Password123!' })
      .expect(409);
    expect(res.body.error.code).toBe('conflict');
  });

  it('logs in with correct credentials and rejects wrong ones', async () => {
    await registerUser({ email: 'log@test.test', password: 'Password123!' });

    await agent()
      .post('/api/v1/auth/login')
      .send({ email: 'log@test.test', password: 'Password123!' })
      .expect(200);

    const bad = await agent()
      .post('/api/v1/auth/login')
      .send({ email: 'log@test.test', password: 'wrongpass1' })
      .expect(401);
    expect(bad.body.error.code).toBe('invalid_credentials');
  });

  it('validates the register body (400 with field_errors)', async () => {
    const res = await agent()
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', name: '', password: 'short' })
      .expect(400);
    expect(res.body.error.code).toBe('validation_error');
    expect(res.body.error.field_errors).toBeDefined();
  });

  it('GET /me requires auth and returns the current user', async () => {
    await agent().get('/api/v1/me').expect(401);

    const { tokens } = await registerUser();
    const me = await agent().get('/api/v1/me').set(...authHeader(tokens.access_token)).expect(200);
    expect(me.body.data.user.id).toBeTruthy();
  });

  it('PATCH /me/prefs updates onboarding preferences', async () => {
    const { tokens } = await registerUser();
    const res = await agent()
      .patch('/api/v1/me/prefs')
      .set(...authHeader(tokens.access_token))
      .send({ cuisines: ['Asian'], difficultyFloor: 'easy', measurement: 'imperial' })
      .expect(200);
    expect(res.body.data.user.prefs.cuisines).toEqual(['Asian']);
    expect(res.body.data.user.prefs.difficultyFloor).toBe('easy');
  });

  it('refresh rotates tokens; the old refresh token stops working', async () => {
    const { tokens } = await registerUser();
    const first = await agent()
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: tokens.refresh_token })
      .expect(200);
    expect(first.body.data.access_token).toBeTruthy();

    // Old token was rotated (revoked) → reuse fails.
    await agent()
      .post('/api/v1/auth/refresh')
      .send({ refresh_token: tokens.refresh_token })
      .expect(401);
  });

  it('DELETE /me removes the account', async () => {
    const { tokens } = await registerUser();
    await agent().delete('/api/v1/me').set(...authHeader(tokens.access_token)).expect(204);
    await agent().get('/api/v1/me').set(...authHeader(tokens.access_token)).expect(404);
  });
});
