import { type HTMLAttributes, type ElementType, type ReactNode } from 'react';

import { cn } from '../../utils/cn.ts';

// Typographic primitive for the buka-signboard stance. Three families do three
// jobs: Bebas (display/dish) is the painted voice, Inter (sans) is chrome,
// JetBrains Mono (read) is the record. See _foundation.css :106-124, 372-385.
export type AppTextVariant =
  | 'dish-xl' // painted dish name, hero
  | 'dish-lg'
  | 'dish-md'
  | 'display' // generic Bebas head (boards, stamps)
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'body'
  | 'body-sm'
  | 'overline' // mono-ish label, wide tracking
  | 'caption';

export interface AppTextProps extends HTMLAttributes<HTMLElement> {
  readonly variant?: AppTextVariant;
  readonly as?: ElementType;
  readonly children?: ReactNode;
}

const VARIANT_CLASSES: Record<AppTextVariant, string> = {
  'dish-xl':
    'font-display uppercase tracking-display leading-[1.02] text-[44px] text-[var(--ink)]',
  'dish-lg':
    'font-display uppercase tracking-display leading-[1.02] text-[30px] text-[var(--ink)]',
  'dish-md':
    'font-display uppercase tracking-display leading-[1.02] text-[22px] text-[var(--ink)]',
  display: 'font-display uppercase tracking-display leading-none text-[var(--ink)]',
  'heading-1': 'font-sans text-[24px] font-extrabold leading-snug text-[var(--ink)]',
  'heading-2': 'font-sans text-[19px] font-bold leading-snug text-[var(--ink)]',
  'heading-3': 'font-sans text-[15px] font-bold leading-snug text-[var(--ink)]',
  body: 'font-sans text-[14px] leading-relaxed text-[var(--ink-2)]',
  'body-sm': 'font-sans text-[12.5px] leading-relaxed text-[var(--ink-2)]',
  overline:
    'font-sans text-[11px] font-bold uppercase tracking-overline text-[var(--ink-3)]',
  caption: 'font-sans text-[11.5px] text-[var(--ink-3)]',
};

const DEFAULT_ELEMENT: Record<AppTextVariant, ElementType> = {
  'dish-xl': 'h1',
  'dish-lg': 'h2',
  'dish-md': 'h3',
  display: 'div',
  'heading-1': 'h2',
  'heading-2': 'h3',
  'heading-3': 'h4',
  body: 'p',
  'body-sm': 'p',
  overline: 'div',
  caption: 'span',
};

export function AppText({ variant = 'body', as, className, children, ...rest }: AppTextProps) {
  const Component = as ?? DEFAULT_ELEMENT[variant];
  return (
    <Component className={cn(VARIANT_CLASSES[variant], className)} {...rest}>
      {children}
    </Component>
  );
}
