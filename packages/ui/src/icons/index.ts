// Centralised icon proxy. The rest of the codebase imports from `@icons`
// (mapped in each app's tsconfig/vite alias) so the icon source is swappable in
// one place — currently lucide-react.
//
// KinniJije's Studio spec draws a custom domain set (pot, pepper, derica…). We
// ship lucide equivalents rather than hand-drawn SVGs: same 2px-stroke / round-
// cap weight, named to the domain so call sites read like the spec. Use the
// `size` prop, never width/height. Active states change the container, not the
// glyph (icons stay outline at every size) — see 43-icons.html.
export {
  // — Domain set (maps the 43-icons.html drawn glyphs to lucide) —
  CookingPot as IconPot, // the pot — also the bottom-tab puck
  Flame as IconPepper, // pepper / heat
  ShoppingBasket as IconDerica, // a measure / market basket
  Utensils as IconCutlery,
  Mic as IconVoice,
  Camera as IconSnap,
  Heart as IconSave, // favourite / save
  Timer as IconTimer,
  Flag as IconFlag,
  RefreshCw as IconReSuggest,
  Play as IconCook, // start cooking
  Check as IconHave, // "you have it" / verified tick

  // — UI glyphs (chrome) —
  X as IconClose,
  ChevronLeft as IconBack,
  ChevronRight as IconForward,
  ChevronDown as IconChevronDown,
  Search as IconSearch,
  Plus as IconPlus,
  Minus as IconMinus,
  User as IconUser,
  Settings as IconSettings,
  LogOut as IconLogout,
  AlertTriangle as IconWarn,
  Sparkles as IconAi, // AI-suggested marker
  WifiOff as IconOffline,
  Download as IconInstall,
  Trash2 as IconDelete,
  Mail as IconMail,
  Home as IconHome,
} from 'lucide-react';

export type { LucideIcon as IconType } from 'lucide-react';
