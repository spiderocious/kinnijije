import { useEffect, useState } from 'react';

// Returns a value that only updates after `delay` ms of stability. Used for
// search inputs so we don't fire a query on every keystroke.
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
