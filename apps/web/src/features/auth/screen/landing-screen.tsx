import { Link, Navigate } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import { AppButton, AppText } from '@kinnijije/ui';

import { tokenService } from '@shared/services/token-service.ts';

// The public landing page: one-sentence value prop + "Get started". Already
// signed in → straight to the kitchen.
export function LandingScreen() {
  if (tokenService.hasSession()) {
    return <Navigate to={ROUTES.KITCHEN} replace />;
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--paper)] px-5 py-10">
      <div className="w-full max-w-md text-center">
        <span className="font-display text-[44px] leading-none tracking-display sm:text-[56px]">
          Kinni<span className="text-[var(--danfo-deep)]">Jije</span>
        </span>

        <AppText variant="dish-md" className="mt-6">
          Tell it what’s in your kitchen.
        </AppText>
        <AppText variant="body" className="mx-auto mt-3 max-w-sm text-[var(--ink-2)]">
          It tells you what to cook tonight — Nigerian and West African food first,
          using mostly what you already have.
        </AppText>

        <div className="mt-8 flex flex-col gap-3">
          <Link to={ROUTES.REGISTER}>
            <AppButton variant="primary" size="lg" className="w-full">
              Get started
            </AppButton>
          </Link>
          <Link to={ROUTES.LOGIN}>
            <AppButton variant="ghost" size="md" className="w-full">
              I already have an account
            </AppButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
