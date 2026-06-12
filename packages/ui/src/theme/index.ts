// KinniJije design tokens — buka-signboard stance, "Full danfo" variation.
// Single source of truth for the palette, type, geometry and motion. Mirrors
// design-system/projects/kinnijije/preview/_foundation.css from the Studio spec.
// When re-theming, edit here AND the matching entries in each app's
// tailwind.config.ts + packages/ui/src/styles.css.
//
// Stance rules baked into these names:
//   - `danfo` is the ONE action colour. It always wears ink text + an ink
//     border — never used as a text colour on cream.
//   - `have` (leaf green) means "you have it" + Verified, nothing else.
//   - `crit` (cold crimson) guards irreversible actions only.
//   - `warn` (burnt sienna) is the rare notice colour (offline, ≈ AI times).
//   - red never decorates; the food photography owns red.

export const COLORS = {
  // Paper & ink (warm on warm)
  paper: '#F8EFDF', // warm cream — the canvas
  paperDeep: '#F1E5CE', // recessed surface
  sheet: '#FFFDF7', // a clean plate on the counter
  ink: '#221A12', // warm near-black — signboard paint
  ink2: '#45392B', // body
  ink3: '#7C6E5C', // secondary
  ink4: '#AC9F8B', // tertiary / placeholders
  hair: '#E6D9C2', // quiet divider
  hair2: '#D8C8AC', // firmer edge

  // Danfo yellow — the one action colour (always ink text + ink border)
  danfo: '#EDAE05',
  danfoDeep: '#C99204', // hover
  danfoPress: '#A37703', // pressed
  danfoTint: '#FAF0CF', // chips, selected rows
  danfoEdge: '#E5CE85', // tint edge
  danfoSoft: '#F6DF8E', // highlighter swipe under display heads

  // Reserved: leaf green — "you have" + Verified ONLY
  have: '#3E7A3A',
  haveBg: '#E9F1E4',
  haveEdge: '#BFD6B8',

  // Reserved: cold crimson — irreversible ONLY
  crit: '#A11212',
  critBg: '#F6E4E1',
  critEdge: '#E2B6AE',

  // Reserved: burnt sienna — rare notices (offline, ≈ AI quantities)
  warn: '#9C4A0E',
  warnBg: '#F8EBDC',
  warnEdge: '#E5C6A4',
} as const;

export type ColorToken = keyof typeof COLORS;

export const FONTS = {
  display: "'Bebas Neue', 'Inter', sans-serif", // painted dish names & boards
  sans: "'Inter', system-ui, -apple-system, sans-serif", // chrome
  mono: "'JetBrains Mono', ui-monospace, monospace", // times, counts, record
} as const;

export const TRACKING = {
  display: '0.045em', // Bebas opens up, painted-letter air
  heading: '-0.005em',
  body: '0',
  label: '0.01em',
  overline: '0.18em',
} as const;

export const RADII = {
  card: '5px',
  ctrl: '4px',
  pill: '9999px',
} as const;

// The bold ink border width and the signature paint-shadow.
export const BORDER_WIDTH = '2px';
export const PAINT_SHADOW = {
  paint: '4px 4px 0 #221A12',
  paintSm: '3px 3px 0 #221A12',
  paintFlat: '0 0 0 #221A12',
} as const;

// The danfo stripe band (signboard footer).
export const STRIPE =
  'repeating-linear-gradient(45deg, #EDAE05 0 10px, #221A12 10px 20px)';

export const MOTION = {
  ease: 'cubic-bezier(.3, 0, .2, 1)',
  press: '120ms', // button collapse onto its shadow
  serve: '200ms', // cards arrive — up 8px, like a plate set down
  settle: '300ms', // overlays, big surfaces
} as const;
