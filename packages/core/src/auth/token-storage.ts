// Simple synchronous token storage abstraction. Defaults to sessionStorage in
// the browser (per the KinniJije auth decision — tokens live in sessionStorage,
// not localStorage or cookies; see docs/build-plan.md §1.2), no-op on the
// server (so SSR pages won't crash). Apps can inject their own implementation
// by passing one to configureApiClient.

export const TOKEN_KEYS = {
  ACCESS: 'kinnijije.access_token',
  REFRESH: 'kinnijije.refresh_token',
} as const;

export type TokenKey = (typeof TOKEN_KEYS)[keyof typeof TOKEN_KEYS];

export interface TokenStorage {
  get(key: TokenKey): string | null;
  set(key: TokenKey, value: string): void;
  remove(key: TokenKey): void;
}

const noopStorage: TokenStorage = {
  get: () => null,
  set: () => undefined,
  remove: () => undefined,
};

// Minimal structural type for the Web Storage API we use, so this module needs
// no DOM lib (core is consumed by NodeNext backends too). We read it off
// globalThis at runtime and fall back to a no-op on the server.
interface WebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const getSessionStorage = (): WebStorageLike | null => {
  const g = globalThis as { sessionStorage?: WebStorageLike };
  return g.sessionStorage ?? null;
};

export const createTokenStorage = (): TokenStorage => {
  const store = getSessionStorage();
  if (!store) return noopStorage;
  return {
    get: (key) => store.getItem(key),
    set: (key, value) => store.setItem(key, value),
    remove: (key) => store.removeItem(key),
  };
};
