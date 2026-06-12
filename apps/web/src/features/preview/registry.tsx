import { type ComponentType } from 'react';

import { IntroPart } from './parts/intro.tsx';
import { TextPart } from './parts/text.tsx';
import { ButtonPart } from './parts/button.tsx';
import { HoldButtonPart } from './parts/hold-button.tsx';
import { FieldPart } from './parts/field.tsx';
import { StepperPart } from './parts/stepper.tsx';
import { ChipPart } from './parts/chip.tsx';
import { SegmentedPart } from './parts/segmented.tsx';
import { SelectionPart } from './parts/selection.tsx';
import { PillPart } from './parts/pill.tsx';
import { AvatarPart } from './parts/avatar.tsx';
import { PhotoMatchPart } from './parts/photo-match.tsx';
import { MealCardPart } from './parts/meal-card.tsx';
import { CardsPart } from './parts/cards.tsx';
import { ListsPart } from './parts/lists.tsx';
import { ProgressPart } from './parts/progress.tsx';
import { StatesPart } from './parts/states.tsx';
import { StepTimerPart } from './parts/step-timer.tsx';
import { CapturePart } from './parts/capture.tsx';
import { OverlaysPart } from './parts/overlays.tsx';
import { NavigationPart } from './parts/navigation.tsx';
import { ModalsPart } from './parts/modals.tsx';
import { DrawerDemoPart } from './parts/drawer-demo.tsx';

// The preview registry. Each component group registers ONE part here the moment
// it's built. Order in the sidebar comes from PARTS order + GROUP_ORDER — never
// from filename prefixes.

export type PreviewGroup =
  | 'Overview'
  | 'Foundation'
  | 'Primitives'
  | 'Data & display'
  | 'Progress & timers'
  | 'Capture'
  | 'Navigation & overlays'
  | 'Feedback';

export interface PreviewPart {
  readonly slug: string;
  readonly label: string;
  readonly group: PreviewGroup;
  readonly Component: ComponentType;
}

export const GROUP_ORDER: readonly PreviewGroup[] = [
  'Overview',
  'Foundation',
  'Primitives',
  'Data & display',
  'Progress & timers',
  'Capture',
  'Navigation & overlays',
  'Feedback',
];

export const PARTS: readonly PreviewPart[] = [
  { slug: 'intro', label: 'Introduction', group: 'Overview', Component: IntroPart },
  { slug: 'text', label: 'Typography', group: 'Foundation', Component: TextPart },
  { slug: 'button', label: 'Buttons', group: 'Primitives', Component: ButtonPart },
  { slug: 'hold-button', label: 'Hold button', group: 'Primitives', Component: HoldButtonPart },
  { slug: 'field', label: 'Inputs', group: 'Primitives', Component: FieldPart },
  { slug: 'stepper', label: 'Stepper', group: 'Primitives', Component: StepperPart },
  { slug: 'chip', label: 'Chips', group: 'Primitives', Component: ChipPart },
  { slug: 'segmented', label: 'Segmented', group: 'Primitives', Component: SegmentedPart },
  { slug: 'selection', label: 'Selection', group: 'Primitives', Component: SelectionPart },
  { slug: 'meal-card', label: 'Suggestion card ★', group: 'Data & display', Component: MealCardPart },
  { slug: 'photo-match', label: 'Photo & match', group: 'Data & display', Component: PhotoMatchPart },
  { slug: 'pill', label: 'Pills & status', group: 'Data & display', Component: PillPart },
  { slug: 'avatar', label: 'Avatar', group: 'Data & display', Component: AvatarPart },
  { slug: 'cards', label: 'Cards', group: 'Data & display', Component: CardsPart },
  { slug: 'lists', label: 'Lists & needs', group: 'Data & display', Component: ListsPart },
  { slug: 'progress', label: 'Progress', group: 'Progress & timers', Component: ProgressPart },
  { slug: 'step-timer', label: 'Timers', group: 'Progress & timers', Component: StepTimerPart },
  { slug: 'states', label: 'Skeletons & empty', group: 'Progress & timers', Component: StatesPart },
  { slug: 'capture', label: 'Voice & photo', group: 'Capture', Component: CapturePart },
  { slug: 'navigation', label: 'PWA shell', group: 'Navigation & overlays', Component: NavigationPart },
  { slug: 'overlays', label: 'Tooltips & popovers', group: 'Navigation & overlays', Component: OverlaysPart },
  { slug: 'modals', label: 'Modals', group: 'Navigation & overlays', Component: ModalsPart },
  { slug: 'feedback', label: 'Feedback · DrawerService', group: 'Feedback', Component: DrawerDemoPart },
];
