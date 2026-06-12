import { useState, type ReactNode } from 'react';
import { Show } from 'meemaw';

import { cn } from '../../utils/cn.ts';

// Tooltips are ink chips — solid signboard black, one line, never interactive.
// On touch they appear on long-press only (here: tap toggles). Spec: 28 (.tip).
export interface AppTooltipProps {
  readonly label: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function AppTooltip({ label, children, className }: AppTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <Show when={open}>
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-ctrl bg-[var(--ink)] px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--paper)]"
        >
          {label}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-[var(--ink)]" />
        </span>
      </Show>
    </span>
  );
}
