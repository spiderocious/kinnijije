import { Link } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import { AppButton, AppStatTile } from '@kinnijije/ui';

import { PageHeader } from '@shared/ui/admin-shell.tsx';
import { QueryState } from '@shared/ui/query-state.tsx';

import { useMetrics } from '../api/use-metrics.ts';

// Dashboard — at-a-glance platform health from /admin/metrics. Reuses the
// design-system AppStatTile; grid collapses to one column on mobile.
export function DashboardScreen() {
  const metrics = useMetrics();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Platform at a glance"
        action={
          <Link to={ROUTES.ADMIN_RECIPE_NEW}>
            <AppButton variant="primary" size="sm">
              New recipe
            </AppButton>
          </Link>
        }
      />

      <QueryState query={metrics}>
        {(data) => (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <AppStatTile value={data.users} label="Users" />
            <AppStatTile value={data.recipes.published} label="Published recipes" />
            <AppStatTile value={data.recipes.draft} label="Draft recipes" />
            <AppStatTile value={data.ai.calls} label="AI calls" />
            <div className="col-span-2 lg:col-span-4">
              <AppStatTile
                value={`$${data.ai.costUsd.toFixed(2)}`}
                label="Estimated AI spend (all-time)"
              />
            </div>
          </div>
        )}
      </QueryState>
    </>
  );
}
