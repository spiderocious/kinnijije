import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

import { AppButton, AppErrorState, AppSkeleton } from '@kinnijije/ui';

import { errorMessage } from '@shared/helpers/error-message.ts';

// Standard loading/error gate for a single-query screen. Skeleton while loading,
// the design-system error state (backend message + retry) on failure.
interface QueryStateProps<T> {
  readonly query: UseQueryResult<T>;
  readonly children: (data: T) => ReactNode;
  readonly skeletonRows?: number;
}

export function QueryState<T>({ query, children, skeletonRows = 3 }: QueryStateProps<T>) {
  if (query.isPending) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-3">
        <span className="sr-only">Loading…</span>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <AppSkeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <AppErrorState
        title="Couldn’t load this"
        description={errorMessage(query.error)}
        action={
          <AppButton variant="secondary" onClick={() => void query.refetch()}>
            Try again
          </AppButton>
        }
      />
    );
  }

  return <>{children(query.data)}</>;
}
