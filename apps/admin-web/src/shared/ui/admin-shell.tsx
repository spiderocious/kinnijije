import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Show, Repeat } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import { AppText, cn } from '@kinnijije/ui';
import {
  IconHome,
  IconPot,
  IconUser,
  IconAi,
  IconCutlery,
  IconSettings,
  IconFlag,
  IconClose,
  IconLogout,
} from '@icons';

import { useAuthContext } from '@features/auth/providers/auth-provider.tsx';

// The admin console shell. Desktop: a fixed left sidebar. Mobile: a hamburger
// that opens the same nav as a slide-over drawer. Reuses @kinnijije/ui tokens +
// @icons; the consumer AppShell (bottom tab bar) is wrong for a multi-section
// desktop console, so this is an admin-local composition.

interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: ReactNode;
}

const NAV: readonly NavItem[] = [
  { to: ROUTES.ADMIN_HOME, label: 'Dashboard', icon: <IconHome size={18} /> },
  { to: ROUTES.ADMIN_RECIPES, label: 'Recipes', icon: <IconPot size={18} /> },
  { to: ROUTES.ADMIN_USERS, label: 'Users', icon: <IconUser size={18} /> },
  { to: ROUTES.ADMIN_AI_AUDIT, label: 'AI audit', icon: <IconAi size={18} /> },
  { to: ROUTES.ADMIN_PROMPTS, label: 'Prompts', icon: <IconCutlery size={18} /> },
  { to: ROUTES.ADMIN_FEATURE_FLAGS, label: 'Feature flags', icon: <IconSettings size={18} /> },
  { to: ROUTES.ADMIN_FEEDBACK, label: 'Feedback', icon: <IconFlag size={18} /> },
];

function isActive(pathname: string, to: string): boolean {
  if (to === ROUTES.ADMIN_HOME) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-1">
      <Repeat each={[...NAV]}>
        {(item) => {
          const on = isActive(pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-ctrl border-2 px-3 py-2.5 text-[13.5px] font-bold transition-colors',
                'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(237,174,5,0.55)]',
                on
                  ? 'border-[var(--ink)] bg-[var(--danfo-tint)] text-[var(--ink)]'
                  : 'border-transparent text-[var(--ink-2)] hover:bg-[var(--paper-deep)]',
              )}
            >
              <span aria-hidden="true" className="shrink-0">
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        }}
      </Repeat>
    </nav>
  );
}

function Wordmark() {
  return (
    <Link to={ROUTES.ADMIN_HOME} className="font-display text-[22px] tracking-display">
      Kinni<span className="text-[var(--danfo-deep)]">Jije</span>
      <span className="ml-2 align-middle font-sans text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--ink-3)]">
        admin
      </span>
    </Link>
  );
}

function SignOut() {
  const { logout, user } = useAuthContext();
  return (
    <div className="mt-auto border-t-2 border-[var(--hair-2)] pt-3">
      <Show when={user !== null}>
        <p className="mb-2 truncate px-1 text-[11px] text-[var(--ink-3)]" title={user?.email}>
          {user?.email}
        </p>
      </Show>
      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-ctrl px-3 py-2.5 text-[13px] font-bold text-[var(--ink-2)] transition-colors hover:bg-[var(--paper-deep)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(237,174,5,0.55)]"
      >
        <IconLogout size={18} aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[var(--paper)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r-2 border-[var(--ink)] bg-[var(--sheet)] p-4 lg:flex">
        <div className="mb-6 px-1">
          <Wordmark />
        </div>
        <NavLinks />
        <SignOut />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-[var(--ink)] bg-[var(--sheet)] px-4 py-3 lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-ctrl border-2 border-[var(--ink)] bg-[var(--sheet)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(237,174,5,0.55)]"
        >
          <span aria-hidden="true" className="flex flex-col gap-[3px]">
            <span className="block h-[2px] w-4 bg-[var(--ink)]" />
            <span className="block h-[2px] w-4 bg-[var(--ink)]" />
            <span className="block h-[2px] w-4 bg-[var(--ink)]" />
          </span>
        </button>
        <Wordmark />
      </header>

      {/* Mobile slide-over */}
      <Show when={mobileOpen}>
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div
            className="absolute inset-0 bg-[rgba(34,26,18,0.45)]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[78%] max-w-xs flex-col border-r-2 border-[var(--ink)] bg-[var(--sheet)] p-4">
            <div className="mb-6 flex items-center justify-between">
              <Wordmark />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-ctrl border-2 border-[var(--ink)]"
              >
                <IconClose size={18} aria-hidden="true" />
              </button>
            </div>
            <NavLinks onNavigate={() => setMobileOpen(false)} />
            <SignOut />
          </div>
        </div>
      </Show>

      {/* Content */}
      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

// A page header used by every admin screen: title, optional subtitle, and an
// action slot (kept right on desktop, stacked on mobile).
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <AppText variant="heading-1">{title}</AppText>
        <Show when={subtitle !== undefined}>
          <AppText variant="body-sm" className="mt-1 text-[var(--ink-3)]">
            {subtitle}
          </AppText>
        </Show>
      </div>
      <Show when={action !== undefined}>
        <div className="shrink-0">{action}</div>
      </Show>
    </div>
  );
}
