import { useState } from 'react';
import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';
import { AppText } from '../../primitives/app-text/index.ts';

// The "you need" list as a tickable market run. Quantities in Nigerian measures,
// mono. Done items strike through but stay visible. Spec: 20-lists.html (.market).
export interface MarketItem {
  readonly id: string;
  readonly name: string;
  readonly qty: string;
  readonly got?: boolean;
}

export interface AppMarketListProps {
  readonly forDish?: string;
  readonly items: readonly MarketItem[];
  readonly onToggle?: (id: string) => void;
  readonly className?: string;
}

export function AppMarketList({ forDish, items, onToggle, className }: AppMarketListProps) {
  const [local, setLocal] = useState<Record<string, boolean>>(
    Object.fromEntries(items.map((i) => [i.id, i.got ?? false])),
  );
  const isGot = (it: MarketItem) => local[it.id] ?? false;
  const toggle = (id: string) => {
    setLocal((p) => ({ ...p, [id]: !(p[id] ?? false) }));
    onToggle?.(id);
  };

  return (
    <div
      className={cn(
        'rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-[18px] py-4',
        className,
      )}
    >
      <AppText variant="overline">You need from the market · {items.length}</AppText>
      {forDish !== undefined ? (
        <p className="mb-2 mt-1 text-[12px] text-[var(--ink-3)]">
          For {forDish} — tick them off as you shop.
        </p>
      ) : null}
      <Repeat each={[...items]}>
        {(it: MarketItem, i: number) => {
          const got = isGot(it);
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => toggle(it.id)}
              className={cn(
                'flex w-full items-center gap-[11px] py-[9px] text-left',
                i > 0 ? 'border-t border-dashed border-[var(--hair-2)]' : '',
              )}
            >
              <span
                className={cn(
                  'grid h-[19px] w-[19px] shrink-0 place-items-center rounded-ctrl border-2 text-[11px] font-extrabold',
                  got
                    ? 'border-[var(--ink)] bg-[var(--danfo)] text-[var(--ink)]'
                    : 'border-[var(--ink-4)] text-transparent',
                )}
              >
                ✓
              </span>
              <span
                className={cn(
                  'flex-1 text-[13.5px] font-semibold',
                  got ? 'text-[var(--ink-3)] line-through' : 'text-[var(--ink)]',
                )}
              >
                {it.name}
              </span>
              <span className="font-mono text-[11.5px] text-[var(--ink-3)]">{it.qty}</span>
            </button>
          );
        }}
      </Repeat>
    </div>
  );
}
