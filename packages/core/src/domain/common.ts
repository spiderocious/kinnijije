import { z } from 'zod';

// Cursor-paginated list envelope (backend never offset-paginates). `nextCursor`
// is null on the last page; `hasMore` mirrors `nextCursor !== null` but is
// surfaced explicitly so the frontend never has to infer it.
export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const TokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});
export type Tokens = z.infer<typeof TokensSchema>;

// AuthResult's `user` is typed where it is consumed (it embeds the User shape);
// kept loose here to avoid a circular schema import. See domain/user.ts.
export interface AuthResult {
  user: import('./user.js').User;
  tokens: Tokens;
}
