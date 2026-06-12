import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Repeat } from 'meemaw';

import { AppToast } from '../feedback/app-feedback/index.ts';
import { cn } from '../utils/cn.ts';
import { DrawerService } from './drawer-service.ts';
import { drawerStore, type ToastEntry, type ToastPosition } from './drawer-store.ts';
import { SwipeableToast } from './swipeable-toast.tsx';

const POSITIONS: readonly ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

const ZONE: Record<ToastPosition, string> = {
  'top-left': 'top-6 left-6 items-start',
  'top-center': 'top-6 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-6 right-6 items-end',
  'bottom-left': 'bottom-6 left-6 items-start flex-col-reverse',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2 items-center flex-col-reverse',
  'bottom-right': 'bottom-6 right-6 items-end flex-col-reverse',
};

// ToastHost — mount once at the app root. Renders the toast queue grouped into
// six position zones via createPortal; subscribes via useSyncExternalStore.
export function ToastHost() {
  const state = useSyncExternalStore(drawerStore.subscribe, drawerStore.getState);
  if (state.toasts.length === 0 || typeof document === 'undefined') return null;

  return createPortal(
    <Repeat each={[...POSITIONS]}>
      {(pos: ToastPosition) => {
        const zone = state.toasts.filter((t) => t.position === pos);
        if (zone.length === 0) return null;
        return (
          <div
            key={pos}
            className={cn(
              'pointer-events-none fixed z-[60] flex max-w-[calc(100vw-3rem)] flex-col gap-3',
              ZONE[pos],
            )}
          >
            <Repeat each={[...zone]}>{(t: ToastEntry) => <ToastSlot key={t.id} toast={t} />}</Repeat>
          </div>
        );
      }}
    </Repeat>,
    document.body,
  );
}

function ToastSlot({ toast }: { readonly toast: ToastEntry }) {
  const action = toast.action;
  return (
    <div className="pointer-events-auto">
      <SwipeableToast disabled={toast.sticky} onDismiss={() => DrawerService.dismissToast(toast.id)}>
        <AppToast
          tone={toast.tone}
          {...(action !== undefined
            ? {
                action: {
                  label: action.label,
                  onClick: () => {
                    action.onClick();
                    DrawerService.dismissToast(toast.id);
                  },
                },
              }
            : {})}
        >
          {toast.message}
        </AppToast>
      </SwipeableToast>
    </div>
  );
}
