import { Component, type ErrorInfo, type ReactNode } from 'react';

import { AppButton, AppErrorState } from '@kinnijije/ui';

// Route-level error boundary so a thrown render error in one feature can't blank
// the whole console. Fails gracefully in production with a recover action.
interface Props {
  readonly children: ReactNode;
}
interface State {
  readonly hasError: boolean;
}

export class RouteErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Route error:', error.message, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <AppErrorState
            title="Something broke on this screen"
            description="An unexpected error occurred. Reloading usually fixes it."
            action={
              <AppButton variant="secondary" onClick={() => window.location.reload()}>
                Reload
              </AppButton>
            }
          />
        </div>
      );
    }
    return this.props.children;
  }
}
