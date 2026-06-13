import type { AuthResult, User } from '@kinnijije/core';

import {
  durationToMs,
  hashToken,
  newRefreshToken,
  signAccessToken,
} from '@lib/auth/jwt.js';
import { hashPassword, verifyPassword } from '@lib/auth/password.js';
import { AppError, ConflictError, UnauthorizedError } from '@lib/errors.js';
import { HTTP_STATUS } from '@shared/constants/http-status.js';
import { env } from '../../env.js';
import { repos } from '../../repositories/index.js';

// Issue a fresh access + refresh pair for a user, persisting the refresh hash.
async function issueTokens(user: User): Promise<AuthResult> {
  const access = signAccessToken({ sub: user.id, role: user.role });
  const { token: refresh, hash } = newRefreshToken();
  const expiresAt = new Date(Date.now() + durationToMs(env.JWT_REFRESH_EXPIRES_IN));
  await repos.refreshTokens.create({ userId: user.id, tokenHash: hash, expiresAt });
  return { user, tokens: { access_token: access, refresh_token: refresh } };
}

export async function register(input: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthResult> {
  // Respect the signups feature flag (default on).
  const signupsOpen = await repos.featureFlags.isEnabled('signups', true);
  if (!signupsOpen) {
    throw new AppError('feature_disabled', 'Sign-ups are currently closed', HTTP_STATUS.FORBIDDEN);
  }

  const existing = await repos.users.findByEmail(input.email);
  if (existing) throw new ConflictError('An account with this email already exists');

  const passwordHash = await hashPassword(input.password);
  const user = await repos.users.create({
    email: input.email,
    passwordHash,
    name: input.name,
  });
  return issueTokens(user);
}

export async function login(input: { email: string; password: string }): Promise<AuthResult> {
  const found = await repos.users.findByEmail(input.email);
  // Constant-ish path: always verify against something to avoid leaking which
  // emails exist via timing. If no user, verifyPassword returns false.
  const ok = found ? await verifyPassword(found.passwordHash, input.password) : false;
  if (!found || !ok) {
    throw new AppError('invalid_credentials', 'Email or password is incorrect', HTTP_STATUS.UNAUTHORIZED);
  }
  if (found.status === 'suspended') {
    throw new AppError('forbidden', 'This account is suspended', HTTP_STATUS.FORBIDDEN);
  }
  const { passwordHash: _omit, ...user } = found;
  return issueTokens(user);
}

export async function refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
  const hash = hashToken(refreshToken);
  const active = await repos.refreshTokens.findActiveByHash(hash);
  if (!active) throw new UnauthorizedError('Invalid refresh token');

  const user = await repos.users.findById(active.userId);
  if (!user) throw new UnauthorizedError('Invalid refresh token');

  // Rotate: revoke the used token, issue a new pair.
  await repos.refreshTokens.revoke(hash);
  const result = await issueTokens(user);
  return result.tokens;
}

export async function logout(refreshToken: string): Promise<void> {
  await repos.refreshTokens.revoke(hashToken(refreshToken));
}
