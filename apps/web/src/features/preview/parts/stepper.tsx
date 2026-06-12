import { useState } from 'react';
import { AppStepper } from '@kinnijije/ui';

import { PreviewStamp, Section } from './preview-canvas.tsx';

export function StepperPart() {
  const [servings, setServings] = useState(4);
  const [mins, setMins] = useState(60);

  return (
    <div>
      <PreviewStamp num="11b" title="Stepper" meta="kitchen-proof numeric input" />
      <Section
        title="how many are you cooking for?"
        description="Steppers, not free-number fields — big touch targets, mono values. Controlled or uncontrolled."
      >
        <div className="max-w-[360px] space-y-3 rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] p-5">
          <div className="grid grid-cols-[1fr_130px] items-center gap-3">
            <span className="text-[13.5px] font-semibold">Servings</span>
            <AppStepper value={servings} min={1} max={20} onChange={setServings} aria-label="Servings" />
          </div>
          <div className="grid grid-cols-[1fr_130px] items-center gap-3 border-t border-[var(--hair)] pt-3">
            <span className="text-[13.5px] font-semibold">Max cook time</span>
            <AppStepper
              value={mins}
              min={10}
              max={180}
              step={5}
              onChange={setMins}
              format={(v) => `${v} min`}
              aria-label="Max cook time"
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
