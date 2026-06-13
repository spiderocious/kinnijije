import { useCallback, useState } from 'react';

// Manages a cursor stack for a cursor-paginated list. `cursor` feeds the query;
// next() pushes the page's nextCursor, back() pops. Resetting (e.g. on a filter
// change) clears the stack. Keeps pagination logic out of every list screen.
export function useCursorList() {
  const [stack, setStack] = useState<string[]>([]);

  const cursor = stack[stack.length - 1];

  const next = useCallback((nextCursor: string | null) => {
    if (nextCursor) setStack((s) => [...s, nextCursor]);
  }, []);

  const back = useCallback(() => {
    setStack((s) => s.slice(0, -1));
  }, []);

  const reset = useCallback(() => setStack([]), []);

  return {
    cursor,
    canGoBack: stack.length > 0,
    next,
    back,
    reset,
  };
}
