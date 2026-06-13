import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import { AppShell, AppTabBar, AppAvatar } from '@kinnijije/ui';
import { IconSave, IconSettings, IconPot } from '@icons';

import { useAuthContext } from '@features/auth/providers/auth-provider.tsx';

// The authenticated PWA shell: wordmark top bar + bottom tab bar with the centre
// "kitchen" puck (the door to the one loop). Reuses the design-system AppShell /
// AppTabBar — the phone product needs almost no navigation.
const TABS = {
  favourites: ROUTES.FAVOURITES,
  kitchen: ROUTES.KITCHEN,
  settings: ROUTES.SETTINGS,
} as const;

function activeTab(pathname: string): string {
  if (pathname.startsWith(ROUTES.FAVOURITES)) return 'favourites';
  if (pathname.startsWith(ROUTES.SETTINGS)) return 'settings';
  return 'kitchen';
}

export function ConsumerShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuthContext();

  return (
    <AppShell
      className="min-h-dvh"
      right={user ? <AppAvatar name={user.name} size="sm" /> : undefined}
      bottom={
        <AppTabBar
          active={activeTab(pathname)}
          left={{ id: 'favourites', label: 'Saved', icon: <IconSave size={20} aria-hidden="true" /> }}
          center={{ id: 'kitchen', label: 'Kitchen', icon: <IconPot size={22} aria-hidden="true" /> }}
          right={{ id: 'settings', label: 'Settings', icon: <IconSettings size={20} aria-hidden="true" /> }}
          onChange={(id) => navigate(TABS[id as keyof typeof TABS] ?? ROUTES.KITCHEN)}
        />
      }
    >
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </AppShell>
  );
}
