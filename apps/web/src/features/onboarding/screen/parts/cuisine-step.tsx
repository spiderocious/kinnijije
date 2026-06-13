import { AppCheckboxTile, AppText } from '@kinnijije/ui';

// Cuisine biases. Nigerian + West African default on (the product's heart);
// users can add others. These feed the suggestion engine's hard cuisine filter.
const CUISINES = [
  'Nigerian',
  'West African',
  'Asian',
  'Mediterranean',
  'Comfort food',
  'Continental',
] as const;

interface CuisineStepProps {
  readonly selected: string[];
  readonly onChange: (next: string[]) => void;
}

export function CuisineStep({ selected, onChange }: CuisineStepProps) {
  const toggle = (cuisine: string, on: boolean) => {
    onChange(on ? [...new Set([...selected, cuisine])] : selected.filter((c) => c !== cuisine));
  };

  return (
    <section>
      <AppText variant="dish-md">What kind of cooking do you enjoy?</AppText>
      <AppText variant="body-sm" className="mt-2 text-[var(--ink-3)]">
        Pick any that apply. We’ll lean your suggestions this way.
      </AppText>

      <div className="mt-5 flex flex-col gap-2.5">
        {CUISINES.map((cuisine) => (
          <AppCheckboxTile
            key={cuisine}
            checked={selected.includes(cuisine)}
            onChange={(on) => toggle(cuisine, on)}
          >
            {cuisine}
          </AppCheckboxTile>
        ))}
      </div>
    </section>
  );
}
