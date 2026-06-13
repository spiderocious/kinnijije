import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import type { MeasurementSystem, User } from '@kinnijije/core';
import {
  AppButton,
  AppSegmented,
  AppSwitch,
  AppText,
  DrawerService,
} from '@kinnijije/ui';

import { errorMessage } from '@shared/helpers/error-message.ts';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useMe } from '@features/auth/api/use-auth.ts';
import { useAuthContext } from '@features/auth/providers/auth-provider.tsx';
import { useUpdatePrefs } from '@features/onboarding/api/use-prefs.ts';

import { useDeleteAccount } from '../api/use-account.ts';

// Settings — prefs, measurement, notifications (inert v1), account deletion,
// about/privacy, sign out. Composition root; the user comes from /me.
export function SettingsScreen() {
  const me = useMe();
  return (
    <div className="flex flex-col gap-5">
      <AppText variant="dish-md">Settings</AppText>
      <QueryState query={me}>{(user) => <Loaded user={user} />}</QueryState>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border-2 border-[var(--hair-2)] bg-[var(--sheet)] p-4">
      <AppText variant="overline" className="text-[var(--ink-3)]">
        {title}
      </AppText>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Loaded({ user }: { user: User }) {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const updatePrefs = useUpdatePrefs();
  const deleteAccount = useDeleteAccount();

  const setMeasurement = (measurement: MeasurementSystem) => {
    updatePrefs.mutate(
      { measurement },
      {
        onSuccess: () => DrawerService.toast('Saved', { tone: 'success' }),
        onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
      },
    );
  };

  const onDelete = () => {
    DrawerService.critical('Delete your account?', {
      description: 'This permanently removes your account, favourites and history. This cannot be undone.',
      confirmLabel: 'Delete account',
      confirmPhrase: 'DELETE',
      confirmPrompt: 'Type DELETE to confirm',
      onConfirm: () => {
        deleteAccount.mutate(undefined, {
          onSuccess: () => navigate(ROUTES.HOME, { replace: true }),
          onError: (err) => DrawerService.toast(errorMessage(err), { tone: 'warn' }),
        });
      },
    });
  };

  return (
    <>
      <Section title="Account">
        <AppText variant="body-sm" className="text-[var(--ink-2)]">
          {user.name} · {user.email}
        </AppText>
      </Section>

      <Section title="Measurements">
        <AppSegmented<MeasurementSystem>
          options={[
            { value: 'metric', label: 'Metric (g · ml)' },
            { value: 'imperial', label: 'Imperial (oz · cups)' },
          ]}
          value={user.prefs.measurement}
          onChange={setMeasurement}
          aria-label="Measurement system"
        />
      </Section>

      <Section title="Preferences">
        <AppText variant="body-sm" className="text-[var(--ink-2)]">
          Cooking: {user.prefs.cuisines.join(', ') || '—'} · {user.prefs.difficultyFloor}
        </AppText>
        <AppButton
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.ONBOARDING)}
          className="mt-2"
        >
          Revisit preferences
        </AppButton>
      </Section>

      <Section title="Notifications">
        <div className="flex items-center justify-between">
          <AppText variant="body-sm" className="text-[var(--ink-2)]">
            Cooking reminders (coming soon)
          </AppText>
          <AppSwitch checked={false} disabled aria-label="Notifications (coming soon)" />
        </div>
      </Section>

      <Section title="About">
        <div className="flex flex-col gap-1.5">
          <a href="/about" className="text-[13px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">
            About KinniJije
          </a>
          <a href="/privacy" className="text-[13px] font-semibold text-[var(--ink-2)] hover:text-[var(--ink)]">
            Privacy
          </a>
        </div>
      </Section>

      <div className="flex flex-col gap-3">
        <AppButton variant="secondary" size="lg" onClick={logout} className="w-full">
          Sign out
        </AppButton>
        <AppButton
          variant="crit"
          size="md"
          onClick={onDelete}
          loading={deleteAccount.isPending}
          className="w-full"
        >
          Delete account
        </AppButton>
      </div>
    </>
  );
}
