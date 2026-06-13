import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError, UnauthorizedError } from '@lib/errors.js';
import { verifyAccessToken } from '@lib/auth/jwt.js';
import { requestContext } from '@lib/http/requestContext.js';

export interface AuthIdentity {
  userId: string;
  role: 'user' | 'admin';
}

// We attach the authenticated identity to the request without module
// augmentation (which is brittle under NodeNext). A WeakMap keyed by the request
// object keeps it strongly typed and HTTP-layer-local — never passed into a
// service (services receive plain userId strings).
const identities = new WeakMap<Request, AuthIdentity>();

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing bearer token');
  }
  const claims = verifyAccessToken(header.slice('Bearer '.length));
  if (!claims) {
    throw new UnauthorizedError('Invalid or expired token');
  }
  identities.set(req, { userId: claims.sub, role: claims.role });
  requestContext.set('userId', claims.sub);
  requestContext.set('role', claims.role);
  next();
}

// Must come AFTER requireAuth in the chain.
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const identity = identities.get(req);
  if (!identity) throw new UnauthorizedError();
  if (identity.role !== 'admin') throw new ForbiddenError('Admin access required');
  next();
}

export function getAuth(req: Request): AuthIdentity {
  const identity = identities.get(req);
  if (!identity) throw new UnauthorizedError();
  return identity;
}

// Helper for controllers: get the authed userId or throw.
export function authUserId(req: Request): string {
  return getAuth(req).userId;
}
