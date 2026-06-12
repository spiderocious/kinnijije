// @kinnijije/ui — buka-signboard component library.
// Production sibling of the Studio HTML spec at
// design-system/projects/kinnijije/preview/*.html.

// Theme tokens
export * from './theme/index.ts';

// Utils
export { cn } from './utils/cn.ts';

// ── Primitives ──
export { AppText } from './primitives/app-text/index.ts';
export type { AppTextVariant, AppTextProps } from './primitives/app-text/index.ts';
export { AppButton } from './primitives/app-button/index.ts';
export type {
  AppButtonVariant,
  AppButtonSize,
  AppButtonProps,
} from './primitives/app-button/index.ts';
export { AppHoldButton } from './primitives/app-hold-button/index.ts';
export type { AppHoldButtonProps } from './primitives/app-hold-button/index.ts';
export { AppInput, AppField } from './primitives/app-field/index.ts';
export type { AppInputProps, AppFieldProps } from './primitives/app-field/index.ts';
export { AppStepper } from './primitives/app-stepper/index.ts';
export type { AppStepperProps } from './primitives/app-stepper/index.ts';
export { AppChip } from './primitives/app-chip/index.ts';
export type { AppChipTone, AppChipProps } from './primitives/app-chip/index.ts';
export { AppSegmented } from './primitives/app-segmented/index.ts';
export type { AppSegmentedOption, AppSegmentedProps } from './primitives/app-segmented/index.ts';
export { AppSwitch, AppRadioGroup, AppCheckboxTile } from './primitives/app-selection/index.ts';
export type {
  AppSwitchProps,
  AppRadioOption,
  AppRadioGroupProps,
  AppCheckboxTileProps,
} from './primitives/app-selection/index.ts';

// ── Data & display ──
export { AppPill } from './data/app-pill/index.ts';
export type { AppPillTone, AppPillProps } from './data/app-pill/index.ts';
export { AppAvatar } from './data/app-avatar/index.ts';
export type { AppAvatarSize, AppAvatarProps } from './data/app-avatar/index.ts';
export { AppPhotoPlaceholder, AppVTag } from './data/app-photo/index.ts';
export type {
  DishFamily,
  AppPhotoPlaceholderProps,
  AppVTagProps,
} from './data/app-photo/index.ts';
export { AppMatchLine } from './data/app-match-line/index.ts';
export type { AppMatchLineProps } from './data/app-match-line/index.ts';
export { AppMealCard } from './data/app-meal-card/index.ts';
export type {
  AppMealCardSize,
  AppMealProvenance,
  AppMealCardProps,
} from './data/app-meal-card/index.ts';
export { AppIngredientCard, AppStatTile, AppRecentCard } from './data/app-cards/index.ts';
export type {
  IngredientRow,
  AppIngredientCardProps,
  AppStatTileProps,
  AppRecentCardProps,
} from './data/app-cards/index.ts';
export { AppListRow, AppFavouritesList, AppMarketList, AppHaveNeed } from './data/app-lists/index.ts';
export type {
  FavouriteItem,
  AppListRowProps,
  AppFavouritesListProps,
  MarketItem,
  AppMarketListProps,
  AppHaveNeedProps,
} from './data/app-lists/index.ts';
export { AppHonestyBar } from './data/app-honesty-bar/index.ts';
export type { AppHonestyBarProps } from './data/app-honesty-bar/index.ts';

// ── Progress & timers ──
export { AppProgressBar, AppTimerRing, AppStepList, AppCheckingPot } from './feedback/app-progress/index.ts';
export type {
  AppProgressVariant,
  AppProgressBarProps,
  TimerRingState,
  AppTimerRingProps,
  StepState,
  ExtractStep,
  AppStepListProps,
  AppCheckingPotProps,
} from './feedback/app-progress/index.ts';
export { AppStepTimer, AppStepTimeChip } from './timers/app-step-timer/index.ts';
export type { AppStepTimerProps, AppStepTimeChipProps } from './timers/app-step-timer/index.ts';

// ── States ──
export { AppSkeleton, AppEmptyState, AppErrorState, AppNoMatch } from './feedback/app-states/index.ts';
export type {
  AppSkeletonProps,
  AppEmptyStateProps,
  AppErrorStateProps,
  AppNoMatchProps,
} from './feedback/app-states/index.ts';

// ── Capture ──
export { AppCaptureMethods, AppVoiceCapture, AppPhotoExtract, AppMultiShot } from './capture/app-capture/index.ts';
export type {
  CaptureMethod,
  AppCaptureMethodsProps,
  AppVoiceCaptureProps,
  FoundItem,
  AppPhotoExtractProps,
  ShotThumb,
  AppMultiShotProps,
} from './capture/app-capture/index.ts';

// ── Overlays ──
export { AppTooltip } from './overlays/app-tooltip/index.ts';
export type { AppTooltipProps } from './overlays/app-tooltip/index.ts';
export { AppPopover, AppDefinedTerm } from './overlays/app-popover/index.ts';
export type { AppPopoverProps, AppDefinedTermProps } from './overlays/app-popover/index.ts';

// ── Navigation ──
export { AppShell, AppTabBar, AppSettingsDrawer } from './nav/app-shell/index.ts';
export type {
  AppShellProps,
  AppTab,
  AppTabBarProps,
  SettingsRow,
  AppSettingsDrawerProps,
} from './nav/app-shell/index.ts';

// ── Feedback (presentational) ──
export { AppToast, AppBanner, AppCallout } from './feedback/app-feedback/index.ts';
export type {
  FeedbackTone,
  AppToastProps,
  AppBannerProps,
  AppCalloutProps,
} from './feedback/app-feedback/index.ts';

// ── Modals ──
export { AppModal, AppFormModal, AppCriticalModal, AppCustomModal } from './overlays/app-modal/index.ts';
export type {
  ModalPosition as AppModalPosition,
  AppModalProps,
  AppFormModalProps,
  AppCriticalModalProps,
  AppCustomModalProps,
} from './overlays/app-modal/index.ts';

// ── DrawerService (imperative overlay layer) ──
export { DrawerService, ToastHost, BannerHost, ModalHost } from './drawer/index.ts';
export type {
  ToastOptions,
  BannerOptions,
  ConfirmOptions,
  CriticalOptions,
  CustomModalOptions,
  ToastPosition,
  BannerPosition,
} from './drawer/index.ts';

// Icons are NOT re-exported here. Import them from the dedicated proxy:
//   import { IconPot } from '@icons';
