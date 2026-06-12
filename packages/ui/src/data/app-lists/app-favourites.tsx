import { useRef, useState, type ReactNode } from 'react';
import { Repeat, Show } from 'meemaw';

import { cn } from '../../utils/cn.ts';
import { AppText } from '../../primitives/app-text/index.ts';
import { AppPill } from '../app-pill/index.ts';
import { AppPhotoPlaceholder, type DishFamily } from '../app-photo/index.ts';

// The favourites list — the most-visited list in the product. Photo thumb,
// Verified/AI badge inline, mono time, "Cook again" → cook mode. Rows can be
// swiped left to reveal a single quiet unsave action (reversible; undo follows).
// Spec: 20-lists.html.
export interface FavouriteItem {
  readonly id: string;
  readonly name: string;
  readonly family: DishFamily;
  readonly photoSrc?: string;
  readonly provenance: 'verified' | 'ai';
  readonly time: string; // mono, e.g. "45M" or "≈ 30M"
  readonly note?: string; // "cooked 3 times" / "saved Tue"
}

export interface AppListRowProps {
  readonly item: FavouriteItem;
  readonly onCookAgain?: (id: string) => void;
  readonly onUnsave?: (id: string) => void;
  readonly swipeable?: boolean;
}

export function AppListRow({ item, onCookAgain, onUnsave, swipeable = false }: AppListRowProps) {
  const [offset, setOffset] = useState(0); // px, negative when revealing
  const startX = useRef<number | null>(null);
  const REVEAL = 96;

  const onDown = (e: React.PointerEvent) => {
    if (!swipeable) return;
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    setOffset(Math.max(-REVEAL, Math.min(0, dx + (offset < -REVEAL / 2 ? -REVEAL : 0))));
  };
  const onUp = () => {
    if (startX.current === null) return;
    setOffset((o) => (o < -REVEAL / 2 ? -REVEAL : 0));
    startX.current = null;
  };

  return (
    <div className="relative overflow-hidden">
      <Show when={swipeable}>
        <button
          type="button"
          onClick={() => onUnsave?.(item.id)}
          className="absolute inset-y-0 right-0 grid w-24 place-items-center border-l-2 border-[var(--ink)] bg-[var(--paper-deep)] text-[10px] font-extrabold uppercase tracking-[0.06em] text-[var(--ink-2)]"
        >
          Unsave
        </button>
      </Show>
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="relative grid grid-cols-[48px_1fr_auto] items-center gap-3 bg-[var(--sheet)] px-4 py-3 transition-transform"
        style={{ transform: `translateX(${offset}px)`, touchAction: swipeable ? 'pan-y' : undefined }}
      >
        <AppPhotoPlaceholder
          family={item.family}
          src={item.photoSrc}
          className="h-12 w-12 rounded-ctrl border-[1.5px] border-[var(--hair-2)]"
        />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold leading-tight">{item.name}</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-[var(--ink-3)]">
            <AppPill tone={item.provenance === 'verified' ? 'verified' : 'ai'} small>
              {item.provenance === 'verified' ? '✓ Verified' : 'AI'}
            </AppPill>
            {item.note !== undefined ? <span>{item.note}</span> : null}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[12px] text-[var(--ink-2)]">{item.time}</div>
          <button
            type="button"
            onClick={() => onCookAgain?.(item.id)}
            className="mt-0.5 cursor-pointer text-[11px] font-bold text-[var(--ink)] underline decoration-[var(--danfo)] decoration-2 underline-offset-2"
          >
            Cook again
          </button>
        </div>
      </div>
    </div>
  );
}

export interface AppFavouritesListProps {
  readonly title?: string;
  readonly items: readonly FavouriteItem[];
  readonly onCookAgain?: (id: string) => void;
  readonly onUnsave?: (id: string) => void;
  readonly swipeable?: boolean;
  readonly headerRight?: ReactNode;
  readonly className?: string;
}

export function AppFavouritesList({
  title = 'Your favourites',
  items,
  onCookAgain,
  onUnsave,
  swipeable = false,
  headerRight,
  className,
}: AppFavouritesListProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] shadow-paint',
        className,
      )}
    >
      <div className="flex items-baseline gap-2.5 border-b-2 border-[var(--ink)] px-4 py-3.5">
        <AppText variant="dish-md">{title}</AppText>
        <span className="ml-auto font-mono text-[11px] text-[var(--ink-3)]">
          {headerRight ?? `${items.length} SAVED`}
        </span>
      </div>
      <div className="divide-y divide-[var(--hair)]">
        <Repeat each={[...items]}>
          {(it: FavouriteItem) => (
            <AppListRow
              key={it.id}
              item={it}
              onCookAgain={onCookAgain}
              onUnsave={onUnsave}
              swipeable={swipeable}
            />
          )}
        </Repeat>
      </div>
    </div>
  );
}
