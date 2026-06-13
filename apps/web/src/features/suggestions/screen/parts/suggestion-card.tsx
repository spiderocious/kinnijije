import { useNavigate } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import type { SuggestionCard as Card } from '@kinnijije/core';
import { AppMealCard } from '@kinnijije/ui';

import { dishFamilyFor } from '@shared/helpers/dish-family.ts';

// Maps a backend SuggestionCard onto the design-system AppMealCard. A perfect
// match (needs nothing) gets the green banner; a weak match (<60% have) gets the
// secondary CTA automatically.
export function SuggestionCardItem({ card }: { card: Card }) {
  const navigate = useNavigate();
  const meta = [
    `${card.cookTimeMinutes} MIN`,
    card.difficulty.toUpperCase(),
  ];
  const perfect = card.match.needCount === 0;
  const weak = card.match.total > 0 && card.match.have / card.match.total < 0.6;

  return (
    <AppMealCard
      name={card.name}
      family={dishFamilyFor(card.name)}
      {...(card.heroImageUrl && !card.heroImageUrl.includes('recipe-placeholder')
        ? { photoSrc: card.heroImageUrl }
        : {})}
      provenance={card.source === 'seed' ? 'verified' : 'ai'}
      have={card.match.have}
      total={card.match.total}
      need={card.match.needCount}
      meta={meta}
      size="lg"
      perfect={perfect}
      weak={weak}
      onOpen={() => navigate(ROUTES.RECIPE(card.recipeId))}
    />
  );
}
