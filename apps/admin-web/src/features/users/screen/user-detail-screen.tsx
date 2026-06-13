import { Link, useParams } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import type { User } from '@kinnijije/core';
import { AppAvatar, AppButton, AppPill, AppStatTile, AppText, DrawerService } from '@kinnijije/ui';
import { IconBack } from '@icons';

import { errorMessage } from '@shared/helpers/error-message.ts';
import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useUpdateUser, useUserDetail, type UserDetail } from '../api/use-users.ts';

export function UserDetailScreen() {
  const params = useParams();
  const id = params.id ?? '';
  const detail = useUserDetail(id);

  return (
    <>
      <Link
        to={ROUTES.ADMIN_USERS}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-[var(--ink-2)] hover:text-[var(--ink)]"
      >
        <IconBack size={15} aria-hidden="true" /> Users
      </Link>
      <QueryState query={detail}>{(data) => <Detail id={id} data={data} />}</QueryState>
    </>
  );
}

function Detail({ id, data }: { id: string; data: UserDetail }) {
  const update = useUpdateUser(id);
  const { user } = data;

  const onToggleStatus = () => {
    const next: User['status'] = user.status === 'active' ? 'suspended' : 'active';
    const apply = () =>
      update.mutate(
        { status: next },
        {
          onSuccess: () =>
            DrawerService.toast(next === 'suspended' ? 'User suspended' : 'User reactivated', {
              tone: 'success',
            }),
          onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
        },
      );

    if (next === 'suspended') {
      DrawerService.confirm('Suspend this user?', {
        description: 'They won’t be able to sign in until reactivated.',
        confirmLabel: 'Suspend',
        destructive: true,
        onConfirm: apply,
      });
    } else {
      apply();
    }
  };

  const onToggleRole = () => {
    const next: User['role'] = user.role === 'admin' ? 'user' : 'admin';
    DrawerService.confirm(next === 'admin' ? 'Make this user an admin?' : 'Remove admin access?', {
      description:
        next === 'admin'
          ? 'They’ll get full access to the admin console.'
          : 'They’ll lose access to the admin console.',
      confirmLabel: next === 'admin' ? 'Make admin' : 'Remove admin',
      destructive: next !== 'admin',
      onConfirm: () =>
        update.mutate(
          { role: next },
          {
            onSuccess: () => DrawerService.toast('Role updated', { tone: 'success' }),
            onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
          },
        ),
    });
  };

  return (
    <>
      <PageHeader title={user.name} subtitle={user.email} />

      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-4 rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-4 shadow-paint sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <AppAvatar name={user.name} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <AppPill tone={user.status === 'active' ? 'easy' : 'warn'} small>
                  {user.status}
                </AppPill>
                <AppPill tone={user.role === 'admin' ? 'verified' : 'medium'} small>
                  {user.role}
                </AppPill>
              </div>
              <AppText variant="body-sm" className="mt-1.5 text-[var(--ink-3)]">
                Prefers: {user.prefs.cuisines.join(', ') || '—'} · {user.prefs.difficultyFloor}
              </AppText>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AppButton
              variant="secondary"
              size="sm"
              onClick={onToggleStatus}
              loading={update.isPending}
            >
              {user.status === 'active' ? 'Suspend' : 'Reactivate'}
            </AppButton>
            <AppButton variant="secondary" size="sm" onClick={onToggleRole} loading={update.isPending}>
              {user.role === 'admin' ? 'Remove admin' : 'Make admin'}
            </AppButton>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <AppStatTile value={data.favourites.length} label="Recent favourites" />
          <AppStatTile value={data.extractions.length} label="Recent extractions" />
        </div>
      </div>
    </>
  );
}
