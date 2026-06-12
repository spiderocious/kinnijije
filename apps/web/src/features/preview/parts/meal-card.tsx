import { AppMealCard } from '@kinnijije/ui';

import { PreviewGrid, PreviewStamp, Section } from './preview-canvas.tsx';

export function MealCardPart() {
  return (
    <div>
      <PreviewStamp num="21" title="The suggestion card" meta="signature · the product in one object" />

      <Section
        title="the hero"
        description="Every meal the product proposes arrives as this card: the photo (appetite), the match line (the decision), honest provenance, exactly one yellow action."
      >
        <div className="max-w-[400px]">
          <AppMealCard
            name="Party Jollof + Fried Plantain"
            family="jollof"
            provenance="verified"
            have={5}
            total={6}
            need={2}
            meta={['45 MIN', 'SERVES 4', 'MEDIUM']}
            size="lg"
          />
        </div>
      </Section>

      <Section
        title="the family — every state the card takes"
        description="AI card (ink tag, category fallback, ≈ time). The perfect match (green banner — the only time green leads). The stretch suggestion (weak match → secondary CTA)."
      >
        <PreviewGrid cols={3}>
          <AppMealCard
            name="Sardine Fried Rice"
            family="fried"
            provenance="ai"
            have={6}
            total={6}
            meta={['≈ 35 MIN', 'SERVES 2', 'EASY']}
            size="sm"
          />
          <AppMealCard
            name="Yam & Egg Sauce"
            family="beans"
            provenance="verified"
            have={6}
            total={6}
            meta={['30 MIN', 'SERVES 2', 'EASY']}
            size="sm"
            perfect
          />
          <AppMealCard
            name="Banga Soup + Starch"
            family="soup"
            provenance="verified"
            have={3}
            total={6}
            need={5}
            meta={['1H 30M', 'SERVES 6', 'INVOLVED']}
            size="sm"
            weak
          />
        </PreviewGrid>
      </Section>
    </div>
  );
}
