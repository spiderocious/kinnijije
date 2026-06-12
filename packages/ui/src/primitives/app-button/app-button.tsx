import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// The buka-signboard button. Four weights, three sizes. Primary is danfo yellow
// with ink text and the paint-shadow — it physically presses DOWN onto the
// shadow (the one piece of physicality in the system). One primary per screen.
// Spec: 10-buttons.html · _foundation.css :220-284.
export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'crit' | 'crit-solid';
export type AppButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: AppButtonVariant;
  readonly size?: AppButtonSize;
  readonly loading?: boolean;
  readonly leadingIcon?: ReactNode;
  readonly trailingIcon?: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-extrabold ' +
  'border-2 transition-[transform,box-shadow,background-color] duration-[120ms] ease-signboard ' +
  'cursor-pointer select-none focus-visible:outline-none ' +
  'focus-visible:shadow-[0_0_0_3px_rgba(237,174,5,0.55)] ' +
  'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0';

const SIZE: Record<AppButtonSize, string> = {
  sm: 'h-8 px-3 text-[12.5px] rounded-ctrl border-[1.5px]',
  md: 'h-10 px-[18px] text-[13.5px] rounded-ctrl',
  lg: 'h-12 px-6 text-[15px] rounded-ctrl',
};

// Variant colour + the press behaviour. Primary/crit-solid carry the paint
// shadow and collapse onto it on :active.
const VARIANT: Record<AppButtonVariant, string> = {
  primary:
    'bg-[var(--danfo)] text-[var(--ink)] border-[var(--ink)] shadow-paint ' +
    'hover:bg-[var(--danfo-deep)] ' +
    'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none active:bg-[var(--danfo-press)]',
  secondary:
    'bg-[var(--sheet)] text-[var(--ink)] border-[var(--ink)] ' +
    'hover:bg-[var(--paper-deep)] active:bg-[var(--hair)]',
  ghost:
    'border-transparent bg-transparent text-[var(--ink)] font-bold px-2 ' +
    'underline decoration-[var(--danfo)] decoration-[2.5px] underline-offset-[3px] ' +
    'hover:decoration-[var(--ink)]',
  crit:
    'bg-transparent text-[var(--crit)] border-[var(--crit)] font-bold ' +
    'hover:bg-[var(--crit-bg)]',
  'crit-solid':
    'bg-[var(--crit)] text-[#FBF2EE] border-[var(--crit)] ' +
    'hover:brightness-110 active:brightness-95',
};

// sm primary keeps a smaller paint-shadow.
const SM_PRIMARY_SHADOW = 'shadow-paint-sm active:translate-x-[3px] active:translate-y-[3px] active:shadow-none';

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  {
    variant = 'primary',
    size = 'md',
    className,
    loading,
    leadingIcon,
    trailingIcon,
    children,
    disabled,
    ...rest
  },
  ref,
) {
  const isPress = variant === 'primary' || variant === 'crit-solid';
  return (
    <button
      ref={ref}
      disabled={disabled === true || loading === true}
      className={cn(
        BASE,
        SIZE[size],
        VARIANT[variant],
        size === 'sm' && variant === 'primary' ? SM_PRIMARY_SHADOW : '',
        // ghost ignores fixed height padding niceties at sm
        variant === 'ghost' ? 'shadow-none' : '',
        !isPress ? 'shadow-none' : '',
        className,
      )}
      {...rest}
    >
      {leadingIcon !== undefined ? (
        <span className="-ml-0.5 inline-flex">{leadingIcon}</span>
      ) : null}
      <span>{loading === true ? 'Loading…' : children}</span>
      {trailingIcon !== undefined ? (
        <span className="-mr-0.5 inline-flex">{trailingIcon}</span>
      ) : null}
    </button>
  );
});
