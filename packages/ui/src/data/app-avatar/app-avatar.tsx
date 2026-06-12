import { cn } from '../../utils/cn.ts';

// Single-account avatar — initials on danfo tint. Deliberately underplayed;
// this product is about the kitchen, not the profile. Spec: 26 · _foundation :448-459.
export type AppAvatarSize = 'sm' | 'md' | 'lg';

export interface AppAvatarProps {
  /** Full name; initials are derived. */
  readonly name: string;
  readonly size?: AppAvatarSize;
  readonly className?: string;
}

const SIZE: Record<AppAvatarSize, string> = {
  sm: 'h-6 w-6 text-[9px]',
  md: 'h-[34px] w-[34px] text-[12px]',
  lg: 'h-[52px] w-[52px] text-[18px]',
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function AppAvatar({ name, size = 'md', className }: AppAvatarProps) {
  return (
    <span
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full',
        'border-[1.5px] border-[var(--danfo-edge)] bg-[var(--danfo-tint)] font-sans font-extrabold text-[var(--ink)]',
        SIZE[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
