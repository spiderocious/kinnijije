import { type ReactNode } from 'react';
import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';
import { AppText } from '../../primitives/app-text/index.ts';

// Plate cards — the quiet, information-holding species (hairline, no shadow).
// Panes act, plates hold. Spec: 27-cards.html.

// ── Ingredient card: ✓ rows you have, + rows you need, mono quantities ──
export interface IngredientRow {
  readonly name: string;
  readonly qty: string;
  readonly have: boolean;
}

export interface AppIngredientCardProps {
  readonly serves: number;
  readonly rows: readonly IngredientRow[];
  readonly className?: string;
}

export function AppIngredientCard({ serves, rows, className }: AppIngredientCardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border border-[var(--hair-2)] bg-[var(--sheet)]',
        className,
      )}
    >
      <div className="flex items-baseline justify-between border-b-2 border-[var(--ink)] px-4 py-3">
        <AppText variant="dish-md">Ingredients</AppText>
        <span className="font-mono text-[10.5px] text-[var(--ink-3)]">SERVES {serves}</span>
      </div>
      <div className="px-4 py-3">
        <Repeat each={[...rows]}>
          {(r: IngredientRow, i: number) => (
            <div
              key={r.name}
              className={cn(
                'flex justify-between gap-2.5 py-[7px] text-[13px]',
                i > 0 ? 'border-t border-dashed border-[var(--hair-2)]' : '',
                r.have ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]',
              )}
            >
              <span>
                <span
                  className={cn(
                    'mr-1 font-extrabold',
                    r.have ? 'text-[var(--have)]' : 'text-[var(--ink-4)]',
                  )}
                >
                  {r.have ? '✓' : '+'}
                </span>
                {r.name}
              </span>
              <span className="font-mono text-[11.5px] text-[var(--ink-3)]">{r.qty}</span>
            </div>
          )}
        </Repeat>
      </div>
    </div>
  );
}

// ── Stat tile: quiet plate, shouting mono number ──
export interface AppStatTileProps {
  readonly value: ReactNode;
  readonly label: string;
  readonly className?: string;
}

export function AppStatTile({ value, label, className }: AppStatTileProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-[18px] py-4',
        className,
      )}
    >
      <div className="font-mono text-[34px] font-bold leading-none tabular-nums tracking-[-0.01em]">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink-3)]">
        {label}
      </div>
    </div>
  );
}

// ── Recent-session card: chips + "use these again" ──
export interface AppRecentCardProps {
  readonly title: string;
  readonly ingredients: readonly string[];
  readonly action?: ReactNode;
  readonly className?: string;
}

export function AppRecentCard({ title, ingredients, action, className }: AppRecentCardProps) {
  return (
    <div
      className={cn(
        'rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-[18px] py-4',
        className,
      )}
    >
      <AppText variant="overline">{title}</AppText>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Repeat each={[...ingredients]}>
          {(it: string) => (
            <span
              key={it}
              className="inline-flex items-center rounded-full border-[1.5px] border-[var(--danfo-edge)] bg-[var(--danfo-tint)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--ink)]"
            >
              {it}
            </span>
          )}
        </Repeat>
      </div>
      {action !== undefined ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
