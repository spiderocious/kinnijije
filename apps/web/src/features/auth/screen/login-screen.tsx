import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import { AppButton, AppField, AppInput } from '@kinnijije/ui';
import { IconMail, IconWarn } from '@icons';

import { errorMessage } from '@shared/helpers/error-message.ts';
import { tokenService } from '@shared/services/token-service.ts';

import { useLogin } from '../api/use-auth.ts';
import { AuthShell } from './parts/auth-shell.tsx';

// Log in. On success → the kitchen (home).
export function LoginScreen() {
  const navigate = useNavigate();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (tokenService.hasSession()) return <Navigate to={ROUTES.KITCHEN} replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email: email.trim(), password },
      { onSuccess: () => navigate(ROUTES.KITCHEN, { replace: true }) },
    );
  };

  const disabled = login.isPending || email.length === 0 || password.length === 0;

  return (
    <AuthShell title="Welcome back">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <AppField label="Email" htmlFor="email">
          <AppInput
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            leading={<IconMail size={16} aria-hidden="true" />}
            placeholder="you@example.com"
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
          <p role="alert" className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--warn)]">
            <IconWarn size={14} aria-hidden="true" />
            {errorMessage(login.error, 'Could not sign in')}
          </p>
        </Show>

        <AppButton type="submit" variant="primary" size="lg" loading={login.isPending} disabled={disabled} className="w-full">
          Log in
        </AppButton>

        <p className="text-center text-[13px] text-[var(--ink-3)]">
          New here?{' '}
          <Link to={ROUTES.REGISTER} className="font-bold text-[var(--ink)] underline decoration-[var(--danfo)] decoration-2 underline-offset-2">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
