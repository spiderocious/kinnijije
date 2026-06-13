import { AppButton } from '@kinnijije/ui';

// Cursor pagination control. The backend is cursor-based (never offset), so we
// keep a stack of seen cursors to allow Back as well as Next. Stateless here —
// the screen owns the cursor stack and passes handlers.
interface CursorPagerProps {
  readonly hasMore: boolean;
  readonly canGoBack: boolean;
  readonly onNext: () => void;
  readonly onBack: () => void;
  readonly busy?: boolean;
}

export function CursorPager({ hasMore, canGoBack, onNext, onBack, busy }: CursorPagerProps) {
  if (!hasMore && !canGoBack) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <AppButton variant="secondary" size="sm" onClick={onBack} disabled={!canGoBack || busy}>
        Back
      </AppButton>
      <AppButton variant="secondary" size="sm" onClick={onNext} disabled={!hasMore || busy}>
        Next
      </AppButton>
    </div>
  );
}
