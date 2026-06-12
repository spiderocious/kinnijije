import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// Ingredient chip — a removable pill. Tone carries meaning: `have` (leaf green)
// = already in your kitchen, `need` = still to get, `add` = dashed call-to-add.
// Spec: 11/14/20 · _foundation.css :307-329.
export type AppChipTone = 'default' | 'have' | 'need' | 'add';

export interface AppChipProps {
  readonly children: ReactNode;
  readonly tone?: AppChipTone;
  /** Show the × remove affordance. */
  readonly onRemove?: () => void;
  readonly onClick?: () => void;
  readonly className?: string;
  /** Dashed/uncertain look, e.g. an AI guess ("Half a yam?"). */
  readonly uncertain?: boolean;
}

const TONE: Record<AppChipTone, string> = {
  default: 'bg-[var(--danfo-tint)] border-[var(--danfo-edge)] text-[var(--ink)]',
  have: 'bg-[var(--have-bg)] border-[var(--have-edge)] text-[var(--ink)]',
  need: 'bg-[var(--paper-deep)] border-[var(--hair-2)] text-[var(--ink-3)]',
  add: 'bg-transparent border-dashed border-[var(--ink-4)] text-[var(--ink-3)] cursor-pointer hover:border-[var(--ink)] hover:text-[var(--ink)]',
};

export function AppChip({
  children,
  tone = 'default',
  onRemove,
  onClick,
  className,
  uncertain = false,
}: AppChipProps) {
  const clickable = onClick !== undefined || tone === 'add';
  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border-[1.5px]',
        'py-1.5 pl-3 pr-[9px] text-[12.5px] font-semibold',
        tone === 'add' ? 'px-3' : '',
        TONE[tone],
        uncertain ? 'border-dashed opacity-75' : '',
        clickable ? 'cursor-pointer' : '',
        className,
      )}
    >
      {children}
      {onRemove !== undefined ? (
        <button
          type="button"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="grid h-[15px] w-[15px] shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-[var(--ink)] text-[10px] font-bold leading-none text-[var(--paper)]"
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
