import { AppProgressBar, AppTimerRing, AppStepList, AppCheckingPot } from '@kinnijije/ui';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function ProgressPart() {
  return (
    <div>
      <PreviewStamp num="24" title="Progress" meta="the 3-second wait is a moment, not a spinner" />

      <Section
        title="the suggestion wait"
        description="The product's one theatrical loading state. A lid lifts, steam rises, the stage line tells the truth."
      >
        <div className="max-w-[420px]">
          <AppCheckingPot sub="Matching your 6 ingredients against 52 real recipes" />
        </div>
      </Section>

      <Section title="linear family" description="Stripe fill for journey progress, flat danfo for a draining timer, marching stripe for indeterminate.">
        <div className="max-w-[420px] space-y-4">
          <ComponentRow label="journey (3/6)">
            <AppProgressBar variant="journey" value={0.5} className="w-full" aria-label="Cook progress" />
          </ComponentRow>
          <ComponentRow label="timer (draining)">
            <AppProgressBar variant="timer" value={0.64} className="w-full" aria-label="Step timer" />
          </ComponentRow>
          <ComponentRow label="indeterminate (uploading)">
            <AppProgressBar variant="indeterminate" className="w-full" aria-label="Uploading" />
          </ComponentRow>
        </div>
      </Section>

      <Section title="timer rings" description="Ink-ringed like a cooker dial. Yellow running, sienna for the final minute, empty when set.">
        <ComponentRow align="center">
          <AppTimerRing value={0.74} label="Running" time="07:42" state="running" />
          <AppTimerRing value={0.1} label="Almost done" time="0:48" state="almost" />
          <AppTimerRing value={0} label="Ready" time="8:00" state="ready" />
        </ComponentRow>
      </Section>

      <Section title="extraction stages" description="Four honest stages with mono timings.">
        <div className="max-w-[420px]">
          <AppStepList
            title="Reading your photo"
            steps={[
              { label: 'Photo uploaded', state: 'done', time: '0.4S' },
              { label: 'Looking at what’s there', state: 'done', time: '1.8S' },
              { label: 'Naming the ingredients', state: 'now', time: '…' },
              { label: 'Ready to confirm', state: 'pending' },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
