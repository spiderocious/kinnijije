import { type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// Popovers carry the pane treatment — they're little decisions. The hovercard is
// the same surface used for an ingredient definition (the dotted-underline term).
// Spec: 28-tooltips.html (.pop / .defn).
export interface AppPopoverProps {
  readonly header?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly className?: string;
}

export function AppPopover({ header, children, footer, className }: AppPopoverProps) {
  return (
    <div
      className={cn(
        'max-w-[290px] overflow-hidden rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] shadow-paint',
        className,
      )}
    >
      {header !== undefined ? (
        <div className="flex items-baseline gap-2 border-b border-[var(--hair)] px-3.5 py-[11px]">
          {header}
        </div>
      ) : null}
      <div className="px-3.5 py-3 text-[12.5px] leading-relaxed text-[var(--ink-2)]">{children}</div>
      {footer !== undefined ? (
        <div className="flex gap-2 border-t border-[var(--hair)] px-3.5 py-2.5">{footer}</div>
      ) : null}
    </div>
  );
}

// The term that opens a definition — dotted yellow underline, help cursor.
export interface AppDefinedTermProps {
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly className?: string;
}

export function AppDefinedTerm({ children, onClick, className }: AppDefinedTermProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'cursor-help border-0 bg-transparent p-0 font-semibold [border-bottom:2px_dotted_var(--danfo-deep)]',
        className,
      )}
    >
      {children}
    </button>
  );
}
