import { TOKEN_KEYS, createTokenStorage } from '@kinnijije/core';
import type { Tokens } from '@kinnijije/core';

// Single point for token reads/writes. Backed by sessionStorage (the KinniJije
// auth decision — not localStorage, not React state). The @kinnijije/api client
// already reads these keys to attach the Bearer header and to drive 401-refresh,
// so login/logout just need to set/clear here.
const storage = createTokenStorage();

export const tokenService = {
  set(tokens: Tokens): void {
    storage.set(TOKEN_KEYS.ACCESS, tokens.access_token);
    storage.set(TOKEN_KEYS.REFRESH, tokens.refresh_token);
  },
  getAccess(): string | null {
    return storage.get(TOKEN_KEYS.ACCESS);
  },
  getRefresh(): string | null {
    return storage.get(TOKEN_KEYS.REFRESH);
  },
  hasSession(): boolean {
    return storage.get(TOKEN_KEYS.ACCESS) !== null;
  },
  clear(): void {
    storage.remove(TOKEN_KEYS.ACCESS);
    storage.remove(TOKEN_KEYS.REFRESH);
  },
};
