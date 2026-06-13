import { useEffect, useRef } from 'react';

// Keeps the screen awake while active (cook mode — the phone sits on the counter
// across the kitchen). Uses the Screen Wake Lock API where available; degrades
// silently where not. Re-acquires on visibility change (the lock drops when the
// tab is hidden).
type WakeLockSentinelLike = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
};

export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    if (!active) return;
    const nav = navigator as WakeLockNavigator;
    if (!nav.wakeLock) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        const sentinel = await nav.wakeLock!.request('screen');
        if (cancelled) {
          void sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
      } catch {
        // Permission denied / not supported — degrade silently.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinelRef.current?.release();
      sentinelRef.current = null;
    };
  }, [active]);
}
