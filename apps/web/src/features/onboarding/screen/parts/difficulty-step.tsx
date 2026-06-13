import type { DifficultyFloor } from '@kinnijije/core';
import { AppRadioGroup, AppText } from '@kinnijije/ui';

// The "how adventurous" answer — sets the difficulty floor for suggestions.
const OPTIONS = [
  { value: 'easy', label: 'Keep it easy', example: 'quick, few steps' },
  { value: 'medium', label: 'Medium is fine', example: 'a bit of effort' },
  { value: 'anything', label: 'Anything goes', example: 'bring it on' },
] as const;

interface DifficultyStepProps {
  readonly value: DifficultyFloor;
  readonly onChange: (value: DifficultyFloor) => void;
}

export function DifficultyStep({ value, onChange }: DifficultyStepProps) {
  return (
    <section>
      <AppText variant="dish-md">How adventurous are you in the kitchen?</AppText>
      <AppText variant="body-sm" className="mt-2 text-[var(--ink-3)]">
        We won’t push harder recipes than you’re up for.
      </AppText>

      <div className="mt-5">
        <AppRadioGroup<DifficultyFloor> options={OPTIONS} value={value} onChange={onChange} name="difficulty" />
      </div>
    </section>
  );
}
