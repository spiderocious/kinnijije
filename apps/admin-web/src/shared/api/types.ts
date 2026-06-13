// Wire types shared across admin features. Domain types come from
// @kinnijije/core; these describe admin-specific response envelopes.

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface AdminMetrics {
  users: number;
  recipes: { published: number; draft: number };
  ai: { calls: number; costUsd: number };
}
