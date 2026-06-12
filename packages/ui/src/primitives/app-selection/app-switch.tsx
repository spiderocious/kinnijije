import { useState } from 'react';

import { cn } from '../../utils/cn.ts';

// Switch — an ink-bordered pill that fills danfo when on. The knob keeps its
// ink ring in both states. Spec: 12-selection.html (.switch).
export interface AppSwitchProps {
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onChange?: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly 'aria-label'?: string;
  readonly className?: string;
}

export function AppSwitch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
  className,
}: AppSwitchProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;

  const toggle = () => {
    if (disabled) return;
    const next = !on;
    if (checked === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        'relative h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full border-2 border-[var(--ink)] transition-colors',
        on ? 'bg-[var(--danfo)]' : 'bg-[var(--paper-deep)]',
        disabled ? 'cursor-not-allowed opacity-45' : '',
        className,
      )}
    >
      <span
        className="absolute top-px h-5 w-5 rounded-full border-2 border-[var(--ink)] bg-[var(--sheet)] transition-[left] duration-[120ms] ease-signboard"
        style={{ left: on ? 21 : 1 }}
      />
    </button>
  );
}
