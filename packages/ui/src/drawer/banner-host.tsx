import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Repeat } from 'meemaw';

import { AppBanner } from '../feedback/app-feedback/index.ts';
import { cn } from '../utils/cn.ts';
import { DrawerService } from './drawer-service.ts';
import { drawerStore, type BannerEntry, type BannerPosition } from './drawer-store.ts';

const POSITIONS: readonly BannerPosition[] = ['top', 'bottom'];

const ZONE: Record<BannerPosition, string> = {
  top: 'top-0 inset-x-0 flex-col',
  bottom: 'bottom-0 inset-x-0 flex-col-reverse',
};

// BannerHost — mount once at the app root. Full-width strips at top or bottom.
export function BannerHost() {
  const state = useSyncExternalStore(drawerStore.subscribe, drawerStore.getState);
  if (state.banners.length === 0 || typeof document === 'undefined') return null;

  return createPortal(
    <Repeat each={[...POSITIONS]}>
      {(pos: BannerPosition) => {
        const zone = state.banners.filter((b) => b.position === pos);
        if (zone.length === 0) return null;
        return (
          <div key={pos} className={cn('pointer-events-none fixed z-[55] flex gap-2 p-4', ZONE[pos])}>
            <Repeat each={[...zone]}>{(b: BannerEntry) => <BannerSlot key={b.id} banner={b} />}</Repeat>
          </div>
        );
      }}
    </Repeat>,
    document.body,
  );
}

function BannerSlot({ banner }: { readonly banner: BannerEntry }) {
  const cta = banner.cta;
  const effectiveCta =
    cta !== undefined
      ? {
          label: cta.label,
          onClick: () => {
            cta.onClick();
            DrawerService.dismissBanner(banner.id);
          },
        }
      : !banner.sticky
        ? { label: 'Dismiss', onClick: () => DrawerService.dismissBanner(banner.id) }
        : undefined;

  return (
    <div className="pointer-events-auto mx-auto w-full max-w-[1100px]">
      <AppBanner
        tone={banner.tone}
        title={banner.title}
        {...(banner.description !== undefined ? { description: banner.description } : {})}
        {...(banner.icon !== undefined ? { icon: banner.icon } : {})}
        {...(effectiveCta !== undefined ? { cta: effectiveCta } : {})}
      />
    </div>
  );
}
