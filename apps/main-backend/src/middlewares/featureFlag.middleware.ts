import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@lib/errors.js';
import { HTTP_STATUS } from '@shared/constants/http-status.js';
import { repos } from '../repositories/index.js';

// Gate a route behind a feature flag. If the flag is off, respond 403
// feature_disabled. `fallback` is used when the flag row doesn't exist yet
// (default: enabled, so a missing flag never accidentally blocks a route).
export function requireFlag(key: string, fallback = true) {
  return async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const enabled = await repos.featureFlags.isEnabled(key, fallback);
    if (!enabled) {
      throw new AppError('feature_disabled', `Feature "${key}" is currently disabled`, HTTP_STATUS.FORBIDDEN);
    }
    next();
  };
}
