import { Suspense, lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import { AppSkeleton } from '@kinnijije/ui';

import { AuthGuard } from '@features/auth/guard/auth-guard.tsx';
import { ConsumerShell } from '@shared/ui/app-shell.tsx';
import { RouteErrorBoundary } from '@shared/ui/route-error-boundary.tsx';

// Lazy-load every route-level screen.
const LandingScreen = lazy(() =>
  import('@features/auth/screen/landing-screen.tsx').then((m) => ({ default: m.LandingScreen })),
);
const LoginScreen = lazy(() =>
  import('@features/auth/screen/login-screen.tsx').then((m) => ({ default: m.LoginScreen })),
);
const RegisterScreen = lazy(() =>
  import('@features/auth/screen/register-screen.tsx').then((m) => ({ default: m.RegisterScreen })),
);
const OnboardingScreen = lazy(() =>
  import('@features/onboarding/screen/onboarding-screen.tsx').then((m) => ({
    default: m.OnboardingScreen,
  })),
);
const KitchenScreen = lazy(() =>
  import('@features/kitchen/screen/kitchen-screen.tsx').then((m) => ({ default: m.KitchenScreen })),
);
const SuggestionsScreen = lazy(() =>
  import('@features/suggestions/screen/suggestions-screen.tsx').then((m) => ({
    default: m.SuggestionsScreen,
  })),
);
const RecipeScreen = lazy(() =>
  import('@features/recipe/screen/recipe-screen.tsx').then((m) => ({ default: m.RecipeScreen })),
);
const CookScreen = lazy(() =>
  import('@features/cook/screen/cook-screen.tsx').then((m) => ({ default: m.CookScreen })),
);
const FavouritesScreen = lazy(() =>
  import('@features/favourites/screen/favourites-screen.tsx').then((m) => ({
    default: m.FavouritesScreen,
  })),
);
const SettingsScreen = lazy(() =>
  import('@features/settings/screen/settings-screen.tsx').then((m) => ({ default: m.SettingsScreen })),
);
const PreviewScreen = lazy(() =>
  import('@features/preview/preview-screen.tsx').then((m) => ({ default: m.PreviewScreen })),
);

function Loading() {
  return (
    <div role="status" aria-live="polite" className="p-6">
      <span className="sr-only">Loading…</span>
      <AppSkeleton className="h-40" />
    </div>
  );
}

// Authed route inside the PWA shell (top bar + bottom tabs).
function Shelled({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <ConsumerShell>
        <RouteErrorBoundary>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </RouteErrorBoundary>
      </ConsumerShell>
    </AuthGuard>
  );
}

// Authed route WITHOUT the shell (full-screen flows: onboarding, cook mode).
function Bare({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <RouteErrorBoundary>
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </RouteErrorBoundary>
    </AuthGuard>
  );
}

// Public route (landing, auth).
function Public({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Public><LandingScreen /></Public>} />
      <Route path={ROUTES.LOGIN} element={<Public><LoginScreen /></Public>} />
      <Route path={ROUTES.REGISTER} element={<Public><RegisterScreen /></Public>} />
      <Route path={ROUTES.PREVIEW} element={<Public><PreviewScreen /></Public>} />

      <Route path={ROUTES.ONBOARDING} element={<Bare><OnboardingScreen /></Bare>} />
      <Route path={ROUTES.COOK(':id')} element={<Bare><CookScreen /></Bare>} />

      <Route path={ROUTES.KITCHEN} element={<Shelled><KitchenScreen /></Shelled>} />
      <Route path={ROUTES.SUGGESTIONS} element={<Shelled><SuggestionsScreen /></Shelled>} />
      <Route path={ROUTES.RECIPE(':id')} element={<Shelled><RecipeScreen /></Shelled>} />
      <Route path={ROUTES.FAVOURITES} element={<Shelled><FavouritesScreen /></Shelled>} />
      <Route path={ROUTES.SETTINGS} element={<Shelled><SettingsScreen /></Shelled>} />

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
