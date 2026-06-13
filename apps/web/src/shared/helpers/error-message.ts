import type { ApiError } from '@kinnijije/api';

// Pull a user-facing message from an unknown thrown value, preferring the
// backend's message (never a hardcoded string).
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as ApiError).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return fallback;
}

export function errorCode(err: unknown): string | null {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as ApiError).code;
    if (typeof code === 'string') return code;
  }
  return null;
}
