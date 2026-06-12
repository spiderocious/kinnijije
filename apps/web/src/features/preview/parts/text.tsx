import { AppText } from '@kinnijije/ui';

import { ComponentRow, PreviewStamp, Section } from './preview-canvas.tsx';

export function TextPart() {
  return (
    <div>
      <PreviewStamp num="02" title="Typography" meta="bebas paints · inter chrome · mono record" />

      <Section
        title="the painted voice — Bebas"
        description="Dish names and boards are painted capitals. Three sizes; uppercase and opened-up tracking are baked in."
      >
        <ComponentRow label="dish-xl">
          <AppText variant="dish-xl">Party Jollof + Plantain</AppText>
        </ComponentRow>
        <ComponentRow label="dish-lg">
          <AppText variant="dish-lg">Catfish Pepper Soup</AppText>
        </ComponentRow>
        <ComponentRow label="dish-md">
          <AppText variant="dish-md">Yam &amp; Egg Sauce</AppText>
        </ComponentRow>
        <ComponentRow label="display (generic board head)">
          <AppText variant="display" className="text-[28px]">
            What&rsquo;s in your kitchen?
          </AppText>
        </ComponentRow>
      </Section>

      <Section title="chrome — Inter" description="Headings and body. Functional, humanist, legible at small sizes.">
        <ComponentRow label="heading-1 / 2 / 3">
          <div className="space-y-1">
            <AppText variant="heading-1">Your favourites</AppText>
            <AppText variant="heading-2">Cook time, honestly</AppText>
            <AppText variant="heading-3">How adventurous are you?</AppText>
          </div>
        </ComponentRow>
        <ComponentRow label="body / body-sm">
          <div className="max-w-[60ch] space-y-2">
            <AppText variant="body">
              Tell KinniJije what&rsquo;s in your kitchen and it serves three meals you can actually
              cook tonight, with Nigerian and West African recipes treated as first-class.
            </AppText>
            <AppText variant="body-sm">
              Steppers, not free-number fields — nobody types &ldquo;4&rdquo; with stew on their
              hands.
            </AppText>
          </div>
        </ComponentRow>
      </Section>

      <Section title="labels" description="The overline is the quiet mono-feel label; caption is for hints.">
        <ComponentRow label="overline">
          <AppText variant="overline">Your ingredients · 4</AppText>
        </ComponentRow>
        <ComponentRow label="caption">
          <AppText variant="caption">Estimate, padded +30% before display</AppText>
        </ComponentRow>
      </Section>
    </div>
  );
}
