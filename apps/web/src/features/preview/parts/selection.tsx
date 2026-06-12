import { useState } from 'react';
import { AppSwitch, AppRadioGroup, AppCheckboxTile } from '@kinnijije/ui';

import { PreviewStamp, Section } from './preview-canvas.tsx';

const CUISINES = ['Nigerian', 'West African', 'Asian', 'Mediterranean', 'Comfort food', 'Continental'];

export function SelectionPart() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['Nigerian', 'West African']));
  const [awake, setAwake] = useState(true);
  const [season, setSeason] = useState(true);
  const [measure, setMeasure] = useState('naija');

  const toggle = (c: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  return (
    <div>
      <PreviewStamp num="12b" title="Selection" meta="tiles · switches · radios" />

      <Section
        title="multi-select tiles"
        description="The onboarding cuisine picker. Selected tiles earn the pane treatment — ink border, danfo tint, small paint shadow."
      >
        <div className="grid max-w-[440px] grid-cols-2 gap-2.5">
          {CUISINES.map((c) => (
            <AppCheckboxTile key={c} checked={selected.has(c)} onChange={() => toggle(c)}>
              {c}
            </AppCheckboxTile>
          ))}
        </div>
      </Section>

      <Section title="switches" description="Ink-bordered pill that fills danfo when on; the knob keeps its ink ring.">
        <div className="max-w-[420px] divide-y divide-[var(--hair)] rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-5">
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <div className="text-[13.5px] font-bold">Keep screen awake in cook mode</div>
              <div className="text-[11.5px] text-[var(--ink-3)]">No greasy-finger unlocking</div>
            </div>
            <AppSwitch checked={awake} onChange={setAwake} aria-label="Keep screen awake" />
          </div>
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1">
              <div className="text-[13.5px] font-bold">Bias toward what&rsquo;s in season</div>
              <div className="text-[11.5px] text-[var(--ink-3)]">Cheaper market runs</div>
            </div>
            <AppSwitch checked={season} onChange={setSeason} aria-label="Bias toward season" />
          </div>
        </div>
      </Section>

      <Section title="radio (one-of-N)" description="The chosen dot is a yellow core in an ink ring — a tick, not a flood fill.">
        <div className="max-w-[360px] rounded-card border border-[var(--hair-2)] bg-[var(--sheet)] px-5 py-2">
          <AppRadioGroup
            value={measure}
            onChange={setMeasure}
            name="measure"
            options={[
              { value: 'naija', label: 'As Nigerians measure', example: 'derica · cup · wrap' },
              { value: 'metric', label: 'Metric', example: 'g · ml' },
              { value: 'imperial', label: 'Imperial', example: 'oz · cups' },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
