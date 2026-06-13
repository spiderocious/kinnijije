import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import { AppButton, AppField, AppInput, AppText } from '@kinnijije/ui';
import { IconMail, IconWarn } from '@icons';

import { errorMessage } from '@shared/helpers/error-message.ts';
import { tokenService } from '@shared/services/token-service.ts';

import { useLogin } from '../api/use-auth.ts';

// Admin sign-in. Same /auth/login as the consumer app; the AdminGuard enforces
// the role afterwards. Inline error carries the backend message (never a
// hardcoded string). Mobile-first: a single centred card that scales up.
export function LoginScreen() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Already signed in → skip the form.
  if (tokenService.hasSession()) {
    return <Navigate to={ROUTES.ADMIN_HOME} replace />;
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email: email.trim(), password },
      { onSuccess: () => navigate(ROUTES.ADMIN_HOME, { replace: true }) },
    );
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--paper)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="font-display text-[30px] tracking-display">
            Kinni<span className="text-[var(--danfo-deep)]">Jije</span>
          </span>
          <AppText variant="overline" className="mt-1 block text-[var(--ink-3)]">
            Admin console
          </AppText>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-5 shadow-paint sm:p-6"
        >
          <div className="flex flex-col gap-4">
            <AppField label="Email" htmlFor="email">
              <AppInput
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                leading={<IconMail size={16} aria-hidden="true" />}
                placeholder="you@kinnijije.app"
                onChange={(e) => setEmail(e.target.value)}
              />
            </AppField>

            <AppField label="Password" htmlFor="password">
              <AppInput
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </AppField>

            <Show when={login.isError}>
              <p
                role="alert"
                className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--warn)]"
              >
                <IconWarn size={14} aria-hidden="true" />
                {errorMessage(login.error, 'Could not sign in')}
              </p>
            </Show>

            <AppButton
              type="submit"
              variant="primary"
              size="lg"
              loading={login.isPending}
              disabled={login.isPending || email.length === 0 || password.length === 0}
              className="w-full"
            >
              Sign in
            </AppButton>
          </div>
        </form>
      </div>
    </main>
  );
}
