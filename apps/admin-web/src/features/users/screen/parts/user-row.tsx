import { Link } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import type { User } from '@kinnijije/core';
import { AppAvatar, AppPill, AppText } from '@kinnijije/ui';

// One user in the admin list. Avatar + name/email + role/status pills. Tap to
// open the detail screen.
export function UserRow({ user }: { user: User }) {
  return (
    <Link
      to={ROUTES.ADMIN_USER(user.id)}
      className="flex items-center gap-3 rounded-card border-2 border-[var(--hair-2)] bg-[var(--sheet)] p-3 transition-colors hover:border-[var(--ink)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(237,174,5,0.55)] sm:p-4"
    >
      <AppAvatar name={user.name} size="md" />
      <div className="min-w-0 flex-1">
        <AppText variant="heading-3" className="truncate">
          {user.name}
        </AppText>
        <AppText variant="body-sm" className="truncate text-[var(--ink-3)]">
          {user.email}
        </AppText>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <AppPill tone={user.status === 'active' ? 'easy' : 'warn'} small>
          {user.status}
        </AppPill>
        {user.role === 'admin' ? (
          <AppPill tone="verified" small>
            admin
          </AppPill>
        ) : null}
      </div>
    </Link>
  );
}
