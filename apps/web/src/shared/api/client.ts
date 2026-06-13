import { apiClient, parseApiError } from '@kinnijije/api';
import type { ApiError, ApiResponse } from '@kinnijije/api';

import type { Options } from 'ky';

// Thin typed wrapper over the shared ky client. Unwraps the `{ data }` envelope
// and rethrows backend errors as a typed ApiError (code + message), so feature
// hooks deal in domain types and never touch ky or the envelope directly.

async function unwrap<T>(promise: Promise<Response>): Promise<T> {
  try {
    const res = await promise;
    const body = (await res.json()) as ApiResponse<T>;
    return body.data;
  } catch (err) {
    throw await toApiError(err);
  }
}

async function unwrapEnvelope<T>(promise: Promise<Response>): Promise<T> {
  try {
    const res = await promise;
    return (await res.json()) as T;
  } catch (err) {
    throw await toApiError(err);
  }
}

async function toApiError(err: unknown): Promise<ApiError> {
  if (err && typeof err === 'object' && 'response' in err) {
    const response = (err as { response?: Response }).response;
    if (response) {
      const raw = await response.json().catch(() => ({}));
      return parseApiError(raw);
    }
  }
  return { code: 'network', message: 'Network error — is the server reachable?' };
}

export const api = {
  get: <T>(path: string, options?: Options): Promise<T> => unwrap<T>(apiClient.get(path, options)),
  getEnvelope: <T>(path: string, options?: Options): Promise<T> =>
    unwrapEnvelope<T>(apiClient.get(path, options)),
  post: <T>(path: string, json?: unknown): Promise<T> =>
    unwrap<T>(apiClient.post(path, json !== undefined ? { json } : undefined)),
  patch: <T>(path: string, json?: unknown): Promise<T> =>
    unwrap<T>(apiClient.patch(path, json !== undefined ? { json } : undefined)),
  delete: (path: string): Promise<void> =>
    apiClient
      .delete(path)
      .then(() => undefined)
      .catch(async (err) => {
        throw await toApiError(err);
      }),
};

export type { ApiError };
