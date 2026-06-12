import { type ReactNode } from 'react';
import { Repeat } from 'meemaw';

import { cn } from '../../utils/cn.ts';

// The settings drawer behind the avatar — signboard header with the stripe,
// plain rows, the one crimson row last and unadorned. Deleting gets its ceremony
// in the modal, not the menu. Spec: 29-navigation.html (.drawer).
export interface SettingsRow {
  readonly id: string;
  readonly icon?: ReactNode;
  readonly label: string;
  readonly critical?: boolean;
}

export interface AppSettingsDrawerProps {
  readonly name: string;
  readonly email: string;
  readonly rows: readonly SettingsRow[];
  readonly onSelect?: (id: string) => void;
  readonly className?: string;
}

export function AppSettingsDrawer({
  name,
  email,
  rows,
  onSelect,
  className,
}: AppSettingsDrawerProps) {
  return (
    <div
      className={cn(
        'w-[300px] overflow-hidden rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] shadow-paint',
        className,
      )}
    >
      <div className="relative overflow-hidden bg-[var(--ink)] p-4">
        <div className="text-[14px] font-extrabold text-[var(--paper)]">{name}</div>
        <div className="mt-px text-[11px] text-[rgba(248,239,223,0.6)]">{email}</div>
        <span className="absolute inset-x-0 bottom-0 h-[5px] bg-[image:var(--stripe)]" />
      </div>
      <div className="divide-y divide-[var(--hair)]">
        <Repeat each={[...rows]}>
          {(r: SettingsRow) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect?.(r.id)}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 px-4 py-[13px] text-left text-[13.5px] font-semibold hover:bg-[var(--danfo-tint)]',
                r.critical === true ? 'text-[var(--crit)]' : 'text-[var(--ink)]',
              )}
            >
              {r.icon !== undefined ? (
                <span className="w-[18px] text-center text-[var(--ink-3)]">{r.icon}</span>
              ) : null}
              {r.label}
            </button>
          )}
        </Repeat>
      </div>
    </div>
  );
}
