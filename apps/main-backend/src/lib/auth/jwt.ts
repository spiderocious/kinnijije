import { createHash, randomBytes } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { env } from '../../env.js';

// Access tokens are short-lived JWTs the frontend stores in sessionStorage and
// sends as a Bearer header. Refresh tokens are opaque random strings; we store
// only their SHA-256 hash, so a DB leak can't be replayed.

export interface AccessClaims {
  sub: string; // userId
  role: 'user' | 'admin';
}

export function signAccessToken(claims: AccessClaims): string {
  return jwt.sign(claims, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessClaims | null {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (typeof decoded === 'string') return null;
    const sub = decoded['sub'];
    const role = decoded['role'];
    if (typeof sub !== 'string' || (role !== 'user' && role !== 'admin')) return null;
    return { sub, role };
  } catch {
    return null;
  }
}

// Opaque refresh token + its hash for storage.
export function newRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Parse a duration like "30d" / "15m" / "12h" / "3600s" into milliseconds, for
// computing the refresh token's expiry date.
export function durationToMs(input: string): number {
  const match = /^(\d+)([smhd])$/.exec(input.trim());
  if (!match) return 30 * 24 * 60 * 60 * 1000; // default 30d
  const value = Number(match[1]);
  const unit = match[2];
  const factor = unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000;
  return value * factor;
}
