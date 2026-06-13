import { Types } from 'mongoose';

// Cursor pagination on the monotonic _id. The cursor is just the last seen _id,
// base64-encoded so it's opaque to clients. Never offset pagination.

export function encodeCursor(id: string): string {
  return Buffer.from(id, 'utf8').toString('base64url');
}

export function decodeCursor(cursor: string): Types.ObjectId | null {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf8');
    if (!Types.ObjectId.isValid(raw)) return null;
    return new Types.ObjectId(raw);
  } catch {
    return null;
  }
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function clampLimit(limit?: number): number {
  if (!limit || limit < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(limit, MAX_PAGE_SIZE);
}

// Given the rows fetched with (limit + 1), split into the page + the cursor.
export function buildPage<T>(
  rows: T[],
  limit: number,
  idOf: (row: T) => string,
): { items: T[]; nextCursor: string | null; hasMore: boolean } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(idOf(last)) : null;
  return { items, nextCursor, hasMore };
}
