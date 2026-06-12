import { AppStepTimer, AppStepTimeChip } from '@kinnijije/ui';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function StepTimerPart() {
  return (
    <div>
      <PreviewStamp num="13" title="Timers" meta="the step countdown is the clock that matters" />

      <Section
        title="the running step timer"
        description="Signboard treatment, minutes in yellow, readable across the kitchen. A real countdown — press Start, Pause, +2 min, Reset."
      >
        <div className="max-w-[420px]">
          <AppStepTimer
            stepLabel="Step 4"
            instruction="Let the base fry until oil floats"
            seconds={462}
          />
        </div>
      </Section>

      <Section title="inline step-time chips" description="Each estimate is a tappable chip that becomes a countdown. Tap one to run it.">
        <ComponentRow align="center">
          <AppStepTimeChip seconds={300} />
          <AppStepTimeChip seconds={462} />
          <AppStepTimeChip seconds={1200} />
        </ComponentRow>
      </Section>
    </div>
  );
}
