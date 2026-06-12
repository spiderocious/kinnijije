import { useState, type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// Multi-select tile (the onboarding cuisine picker). Selected tiles earn the
// pane treatment — ink border, danfo tint, small paint shadow. The tick fills
// danfo with ink. Spec: 12-selection.html (.ctile).
export interface AppCheckboxTileProps {
  readonly children: ReactNode;
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onChange?: (checked: boolean) => void;
  readonly className?: string;
}

export function AppCheckboxTile({
  children,
  checked,
  defaultChecked = false,
  onChange,
  className,
}: AppCheckboxTileProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;

  const toggle = () => {
    const next = !on;
    if (checked === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={on}
      onClick={toggle}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-card border-[1.5px] bg-[var(--sheet)] px-3.5 py-3 text-left font-sans text-[13.5px] font-bold',
        on
          ? 'border-2 border-[var(--ink)] bg-[var(--danfo-tint)] shadow-paint-sm'
          : 'border-[var(--hair-2)] hover:border-[var(--ink-4)]',
        className,
      )}
    >
      <span
        className={cn(
          'grid h-5 w-5 shrink-0 place-items-center rounded-ctrl border-2 text-[12px] font-extrabold',
          on
            ? 'border-[var(--ink)] bg-[var(--danfo)] text-[var(--ink)]'
            : 'border-[var(--ink-4)] text-transparent',
        )}
      >
        ✓
      </span>
      {children}
    </button>
  );
}
