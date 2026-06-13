import { Link } from 'react-router-dom';

import { ROUTES } from '@kinnijije/core';
import type { Recipe } from '@kinnijije/core';
import { AppPill, AppText } from '@kinnijije/ui';

// One recipe in the admin list. A tappable card (full-width on mobile, row-like
// on desktop) showing the hero thumbnail, name, tags, and meta. Reuses AppPill
// for the verified/AI + draft/published status chips.
export function RecipeRow({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to={ROUTES.ADMIN_RECIPE(recipe.id)}
      className="flex items-center gap-3 rounded-card border-2 border-[var(--hair-2)] bg-[var(--sheet)] p-3 transition-colors hover:border-[var(--ink)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(237,174,5,0.55)] sm:gap-4 sm:p-4"
    >
      <img
        src={recipe.heroImageUrl}
        alt=""
        aria-hidden="true"
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
        className="h-14 w-14 shrink-0 rounded-ctrl border-2 border-[var(--ink)] object-cover sm:h-16 sm:w-16"
      />
      <div className="min-w-0 flex-1">
        <AppText variant="heading-3" className="truncate">
          {recipe.name}
        </AppText>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <AppPill tone={recipe.status === 'published' ? 'easy' : 'warn'} small>
            {recipe.status}
          </AppPill>
          <AppPill tone={recipe.source === 'seed' ? 'verified' : 'ai'} small>
            {recipe.source === 'seed' ? 'Verified' : 'AI'}
          </AppPill>
          <span className="text-[11.5px] text-[var(--ink-3)]">
            {recipe.cookTimeMinutes}m · {recipe.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}
