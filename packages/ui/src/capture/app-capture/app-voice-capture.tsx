import { type ReactNode } from 'react';
import { Repeat, Show } from 'meemaw';

import { cn } from '../../utils/cn.ts';

// The hold-to-record button — same press physics as every press, scaled up. The
// transcript shows before extraction so the cook sees what was heard.
// Spec: 14-capture.html (.voicebox). Recording capture itself is app-level; this
// is the presentational surface with hooks.
export interface AppVoiceCaptureProps {
  readonly micIcon: ReactNode;
  readonly transcript?: string;
  /** Waveform bar heights (px). Defaults to a static sample. */
  readonly wave?: readonly number[];
  readonly onHoldStart?: () => void;
  readonly onHoldEnd?: () => void;
  readonly className?: string;
}

const DEFAULT_WAVE = [8, 16, 24, 12, 20, 26, 10, 18, 14, 22, 8];

export function AppVoiceCapture({
  micIcon,
  transcript,
  wave = DEFAULT_WAVE,
  onHoldStart,
  onHoldEnd,
  className,
}: AppVoiceCaptureProps) {
  return (
    <div
      className={cn(
        'rounded-card border-2 border-[var(--ink)] bg-[var(--sheet)] p-5 text-center shadow-paint',
        className,
      )}
    >
      <div className="text-[11px] font-bold uppercase tracking-overline text-[var(--ink-3)]">
        Hold to talk · release when done
      </div>
      <button
        type="button"
        onPointerDown={onHoldStart}
        onPointerUp={onHoldEnd}
        onPointerLeave={onHoldEnd}
        className={cn(
          'mx-auto my-3.5 grid h-24 w-24 cursor-pointer place-items-center rounded-full border-2 border-[var(--ink)] bg-[var(--danfo)] text-[var(--ink)] shadow-paint',
          'transition-[transform,box-shadow] duration-[120ms] ease-signboard',
          'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        )}
        aria-label="Hold to record"
      >
        {micIcon}
      </button>
      <div className="flex h-[26px] items-center justify-center gap-[3px]">
        <Repeat each={[...wave]}>
          {(h: number, i: number) => (
            <span
              key={i}
              className="block w-[3px] rounded-sm bg-[var(--ink)]"
              style={{ height: h }}
            />
          )}
        </Repeat>
      </div>
      <Show when={transcript !== undefined}>
        <div className="mt-3.5 rounded-card bg-[var(--paper-deep)] px-3.5 py-3 text-left text-[13px] italic text-[var(--ink-2)]">
          {transcript}
        </div>
      </Show>
    </div>
  );
}
