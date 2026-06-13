import type { Request } from 'express';

import { ValidationError } from '@lib/errors.js';

// Express types route params as possibly-undefined under strict settings. A
// matched `:id` route param is always present at runtime, but TS needs a
// narrowing. These helpers narrow once, throwing a clean validation error if a
// param is somehow missing.

export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new ValidationError('Missing path parameter', { [name]: ['required'] });
  }
  return value;
}

// Read an optional string query param (ignoring array/duplicate forms).
export function queryString(req: Request, name: string): string | undefined {
  const value = req.query[name];
  return typeof value === 'string' ? value : undefined;
}
