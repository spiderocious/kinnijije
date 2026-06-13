import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

// Holds the ingredients the user is assembling this session — shared across the
// kitchen-input methods (type/voice/photo) and read by the suggestions screen.
// Deliberately NOT persisted: the product's personality is "tell me what's there
// right now", so each session starts fresh (PRD — no inventory tracking).
interface KitchenSessionValue {
  readonly ingredients: string[];
  add: (items: string[]) => void;
  remove: (item: string) => void;
  clear: () => void;
}

const KitchenSessionContext = createContext<KitchenSessionValue | null>(null);

export function KitchenSessionProvider({ children }: { children: ReactNode }) {
  const [ingredients, setIngredients] = useState<string[]>([]);

  const add = useCallback((items: string[]) => {
    setIngredients((prev) => {
      const seen = new Set(prev.map((i) => i.toLowerCase()));
      const additions = items
        .map((i) => i.trim())
        .filter((i) => i.length > 0 && !seen.has(i.toLowerCase()));
      return [...prev, ...additions];
    });
  }, []);

  const remove = useCallback((item: string) => {
    setIngredients((prev) => prev.filter((i) => i !== item));
  }, []);

  const clear = useCallback(() => setIngredients([]), []);

  const value = useMemo<KitchenSessionValue>(
    () => ({ ingredients, add, remove, clear }),
    [ingredients, add, remove, clear],
  );

  return <KitchenSessionContext.Provider value={value}>{children}</KitchenSessionContext.Provider>;
}

export function useKitchenSession(): KitchenSessionValue {
  const ctx = useContext(KitchenSessionContext);
  if (!ctx) throw new Error('useKitchenSession must be used within KitchenSessionProvider');
  return ctx;
}
