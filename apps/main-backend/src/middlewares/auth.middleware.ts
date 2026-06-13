import type { NextFunction, Request, Response } from 'express';

import { ForbiddenError, UnauthorizedError } from '@lib/errors.js';
import { verifyAccessToken } from '@lib/auth/jwt.js';
import { requestContext } from '@lib/http/requestContext.js';

// Extend Express's Request with the authenticated identity. Set by requireAuth,
// read by controllers. HTTP-layer concern only — never passed into a service
// (services receive plain userId strings).
declare module 'express-serve-static-core' {
  interface Request {
    auth?: { userId: string; role: 'user' | 'admin' };
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing bearer token');
  }
  const claims = verifyAccessToken(header.slice('Bearer '.length));
  if (!claims) {
    throw new UnauthorizedError('Invalid or expired token');
  }
  req.auth = { userId: claims.sub, role: claims.role };
  requestContext.set('userId', claims.sub);
  requestContext.set('role', claims.role);
  next();
}

// Must come AFTER requireAuth in the chain.
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) throw new UnauthorizedError();
  if (req.auth.role !== 'admin') throw new ForbiddenError('Admin access required');
  next();
}

// Helper for controllers: get the authed userId or throw.
export function authUserId(req: Request): string {
  if (!req.auth) throw new UnauthorizedError();
  return req.auth.userId;
}
