import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Show } from 'meemaw';

import { ROUTES } from '@kinnijije/core';
import { AppButton, AppField, AppInput } from '@kinnijije/ui';
import { IconMail, IconUser, IconWarn } from '@icons';

import { errorMessage } from '@shared/helpers/error-message.ts';
import { tokenService } from '@shared/services/token-service.ts';

import { useRegister } from '../api/use-auth.ts';
import { AuthShell } from './parts/auth-shell.tsx';

// Sign up. On success → onboarding (the 3-step preference setup).
export function RegisterScreen() {
  const navigate = useNavigate();
  const register = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (tokenService.hasSession()) return <Navigate to={ROUTES.KITCHEN} replace />;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    register.mutate(
      { name: name.trim(), email: email.trim(), password },
      { onSuccess: () => navigate(ROUTES.ONBOARDING, { replace: true }) },
    );
  };

  const disabled =
    register.isPending || name.trim().length === 0 || email.length === 0 || password.length < 8;

  return (
    <AuthShell title="Create your account">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <AppField label="Your name" htmlFor="name">
          <AppInput
            id="name"
            autoComplete="name"
            required
            value={name}
            leading={<IconUser size={16} aria-hidden="true" />}
            placeholder="Ada"
            onChange={(e) => setName(e.target.value)}
          />
        </AppField>
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
        <AppField label="Password" htmlFor="password" hint="At least 8 characters">
          <AppInput
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />
        </AppField>

        <Show when={register.isError}>
          <p role="alert" className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--warn)]">
            <IconWarn size={14} aria-hidden="true" />
            {errorMessage(register.error, 'Could not create account')}
          </p>
        </Show>

        <AppButton type="submit" variant="primary" size="lg" loading={register.isPending} disabled={disabled} className="w-full">
          Create account
        </AppButton>

        <p className="text-center text-[13px] text-[var(--ink-3)]">
          Have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-bold text-[var(--ink)] underline decoration-[var(--danfo)] decoration-2 underline-offset-2">
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
