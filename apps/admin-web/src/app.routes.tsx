import { Suspense, lazy, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import { AppSkeleton } from '@kinnijije/ui';

import { AdminGuard } from '@features/auth/guard/admin-guard.tsx';
import { AdminShell } from '@shared/ui/admin-shell.tsx';
import { RouteErrorBoundary } from '@shared/ui/route-error-boundary.tsx';

// Every route-level screen is lazy-loaded (frontend guide §6).
const LoginScreen = lazy(() =>
  import('@features/auth/screen/login-screen.tsx').then((m) => ({ default: m.LoginScreen })),
);
const DashboardScreen = lazy(() =>
  import('@features/dashboard/screen/dashboard-screen.tsx').then((m) => ({
    default: m.DashboardScreen,
  })),
);
const RecipesScreen = lazy(() =>
  import('@features/recipes/screen/recipes-screen.tsx').then((m) => ({ default: m.RecipesScreen })),
);
const RecipeEditScreen = lazy(() =>
  import('@features/recipes/screen/recipe-edit-screen.tsx').then((m) => ({
    default: m.RecipeEditScreen,
  })),
);
const UsersScreen = lazy(() =>
  import('@features/users/screen/users-screen.tsx').then((m) => ({ default: m.UsersScreen })),
);
const UserDetailScreen = lazy(() =>
  import('@features/users/screen/user-detail-screen.tsx').then((m) => ({
    default: m.UserDetailScreen,
  })),
);
const AiAuditScreen = lazy(() =>
  import('@features/ai-audit/screen/ai-audit-screen.tsx').then((m) => ({ default: m.AiAuditScreen })),
);
const AiAuditDetailScreen = lazy(() =>
  import('@features/ai-audit/screen/ai-audit-detail-screen.tsx').then((m) => ({
    default: m.AiAuditDetailScreen,
  })),
);
const PromptsScreen = lazy(() =>
  import('@features/prompts/screen/prompts-screen.tsx').then((m) => ({ default: m.PromptsScreen })),
);
const FeatureFlagsScreen = lazy(() =>
  import('@features/feature-flags/screen/feature-flags-screen.tsx').then((m) => ({
    default: m.FeatureFlagsScreen,
  })),
);
const FeedbackScreen = lazy(() =>
  import('@features/feedback/screen/feedback-screen.tsx').then((m) => ({ default: m.FeedbackScreen })),
);

function Loading() {
  return (
    <div role="status" aria-live="polite" className="p-8">
      <span className="sr-only">Loading…</span>
      <AppSkeleton className="h-40" />
    </div>
  );
}

// Wraps a console screen: guard → shell → error boundary → lazy content.
function Console({ children }: { children: ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>
        <RouteErrorBoundary>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </RouteErrorBoundary>
      </AdminShell>
    </AdminGuard>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.ADMIN_LOGIN}
        element={
          <Suspense fallback={<Loading />}>
            <LoginScreen />
          </Suspense>
        }
      />

      <Route path={ROUTES.ADMIN_HOME} element={<Console><DashboardScreen /></Console>} />
      <Route path={ROUTES.ADMIN_RECIPES} element={<Console><RecipesScreen /></Console>} />
      <Route path={ROUTES.ADMIN_RECIPE_NEW} element={<Console><RecipeEditScreen /></Console>} />
      <Route path={ROUTES.ADMIN_RECIPE(':id')} element={<Console><RecipeEditScreen /></Console>} />
      <Route path={ROUTES.ADMIN_USERS} element={<Console><UsersScreen /></Console>} />
      <Route path={ROUTES.ADMIN_USER(':id')} element={<Console><UserDetailScreen /></Console>} />
      <Route path={ROUTES.ADMIN_AI_AUDIT} element={<Console><AiAuditScreen /></Console>} />
      <Route
        path={ROUTES.ADMIN_AI_AUDIT_ITEM(':id')}
        element={<Console><AiAuditDetailScreen /></Console>}
      />
      <Route path={ROUTES.ADMIN_PROMPTS} element={<Console><PromptsScreen /></Console>} />
      <Route path={ROUTES.ADMIN_FEATURE_FLAGS} element={<Console><FeatureFlagsScreen /></Console>} />
      <Route path={ROUTES.ADMIN_FEEDBACK} element={<Console><FeedbackScreen /></Console>} />

      <Route path="*" element={<Navigate to={ROUTES.ADMIN_HOME} replace />} />
    </Routes>
  );
}
