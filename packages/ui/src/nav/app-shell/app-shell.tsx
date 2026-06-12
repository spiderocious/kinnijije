import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// The PWA shell: a top bar with the wordmark and avatar slot, content, and the
// bottom tab bar. A phone product with one loop needs almost no navigation.
// Spec: 29-navigation.html (.topbar / .screen-body).
export interface AppShellProps {
  readonly right?: ReactNode; // usually the avatar
  readonly children: ReactNode;
  readonly bottom?: ReactNode; // usually <AppTabBar />
  readonly className?: string;
}

export function AppShell({ right, children, bottom, className }: AppShellProps) {
  return (
    <div className={cn('flex flex-col bg-[var(--paper)]', className)}>
      <div className="flex items-center gap-2.5 border-b-2 border-[var(--ink)] bg-[var(--paper)] px-3.5 py-3">
        <span className="font-display text-[20px] tracking-display">
          Kinni<span className="text-[var(--danfo-deep)]">Jije</span>
        </span>
        <span className="flex-1" />
        {right}
      </div>
      <div className="min-h-0 flex-1 p-4">{children}</div>
      {bottom}
    </div>
  );
}

// Bottom tabs — the centre tab is a raised yellow puck (the "what's in your
// kitchen?" door), always one thumb away. Same press physics as every primary.
export interface AppTab {
  readonly id: string;
  readonly label: string;
  readonly icon: ReactNode;
}

export interface AppTabBarProps {
  readonly left: AppTab;
  readonly right: AppTab;
  readonly center: AppTab;
  readonly active: string;
  readonly onChange?: (id: string) => void;
  readonly className?: string;
}

export function AppTabBar({ left, right, center, active, onChange, className }: AppTabBarProps) {
  const tab = (t: AppTab) => {
    const on = t.id === active;
    return (
      <button
        type="button"
        onClick={() => onChange?.(t.id)}
        className={cn(
          'cursor-pointer px-1 pb-3 pt-2.5 text-center text-[10px] font-extrabold uppercase tracking-[0.08em]',
          on ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]',
        )}
      >
        <span className="mx-auto mb-[3px] block w-fit">{t.icon}</span>
        {t.label}
      </button>
    );
  };

  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_1.3fr_1fr] border-t-2 border-[var(--ink)] bg-[var(--sheet)]',
        className,
      )}
    >
      {tab(left)}
      <button
        type="button"
        onClick={() => onChange?.(center.id)}
        className="relative cursor-pointer px-1 pb-3 pt-2.5 text-center text-[10px] font-extrabold uppercase tracking-[0.08em] text-[var(--ink)]"
      >
        <span className="mx-auto -mt-7 mb-[3px] grid h-[52px] w-[52px] place-items-center rounded-full border-2 border-[var(--ink)] bg-[var(--danfo)] text-[var(--ink)] shadow-paint-sm transition-[transform,box-shadow] duration-[120ms] ease-signboard active:translate-x-[3px] active:translate-y-[3px] active:shadow-none">
          {center.icon}
        </span>
        {center.label}
      </button>
      {tab(right)}
    </div>
  );
}
