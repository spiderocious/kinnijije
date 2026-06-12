import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// The trust + effort taxonomy. Eight tones, each keeps its single meaning
// everywhere. Verified is the green family's second/final job; AI is ink
// outline, no fill — visibly different from Verified at any size.
// Spec: 26-avatars-pills.html · _foundation.css :331-352.
export type AppPillTone =
  | 'verified'
  | 'ai'
  | 'easy'
  | 'medium'
  | 'involved'
  | 'warn'
  | 'crit';

export interface AppPillProps {
  readonly children: ReactNode;
  readonly tone: AppPillTone;
  /** Compact 18px height for inline-in-a-row use. */
  readonly small?: boolean;
  readonly leading?: ReactNode;
  readonly className?: string;
}

const TONE: Record<AppPillTone, string> = {
  verified: 'text-[#2E5C2B] border-[var(--have-edge)] bg-[var(--have-bg)]',
  ai: 'text-[var(--ink-2)] border-[var(--ink-3)] bg-transparent',
  easy: 'text-[var(--ink-2)] border-[var(--hair-2)] bg-transparent',
  medium: 'text-[var(--ink)] border-[var(--ink-3)] bg-transparent',
  involved: 'text-[var(--paper)] border-[var(--ink)] bg-[var(--ink)]',
  warn: 'text-[var(--warn)] border-[var(--warn-edge)] bg-[var(--warn-bg)]',
  crit: 'text-[var(--crit)] border-[var(--crit-edge)] bg-[var(--crit-bg)]',
};

export function AppPill({ children, tone, small = false, leading, className }: AppPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px]',
        'font-sans font-extrabold uppercase tracking-[0.08em]',
        small ? 'h-[18px] px-2 text-[9px]' : 'h-[22px] px-[9px] text-[10.5px]',
        TONE[tone],
        className,
      )}
    >
      {leading !== undefined ? <span className="inline-flex">{leading}</span> : null}
      {children}
    </span>
  );
}
