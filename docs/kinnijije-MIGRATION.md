# KinniJije UI — migration report

Shipped **2026-06-12** from the Studio project `kinnijije` (stance: **Buka
signboard**, "Full danfo" variation) into `@kinnijije/ui`.

- **Visual spec (source of truth):** `…/dockito/design-system/projects/kinnijije/preview/*.html`
- **Foundation tokens:** `…/preview/_foundation.css`
- **Library:** `packages/ui/src/` → `@kinnijije/ui`
- **Live preview:** `apps/web` → route `/preview` (sidebar viewer, one part per component)

Run the preview: `pnpm -F @kinnijije/web dev`, open `/preview`.

---

## What this ship did first: a re-theme

The repo arrived as the **monorepo template** — `packages/ui` was themed blue
(`#1e3a8a` brand, `#ea580c` accent), Inter-only, with semantic `brand`/`accent`
token names. That is **not** the approved Buka-signboard system. So the first job
was a re-theme, expressed in the repo's existing idiom (a TS `COLORS`/`FONTS`
object + each app's `tailwind.config.ts` + a `:root` CSS-var layer), not the
Studio's CSS-var convention imposed on top.

Re-themed files:

- `packages/ui/src/theme/index.ts` — full signboard token set (paper/ink ramp,
  danfo + tints, reserved have/crit/warn, type families, tracking, geometry,
  paint-shadows, stripe, motion).
- `packages/ui/src/styles.css` — `:root` CSS vars (the runtime source of truth
  components consume via `bg-[var(--danfo)]` etc.), base reset, animation
  utilities (`kj-serve`, `kj-ticking`, `kj-indeterminate`, `kj-lid`/`kj-steam`,
  `kj-skel`), font `@import` fallback.
- `apps/{web,website,admin-web}/tailwind.config.ts` — **extended** (never
  replaced) with named tokens: `danfo`, `ink`, `paper`, `have`/`crit`/`warn`,
  `font-display/sans/mono`, `shadow-paint`, `bg-stripe`, `tracking-display`.
- `apps/web/src/styles.css` — body bg/colour pointed at the new tokens.

## Conventions detected and matched

- **Folder-per-component**, kebab-case: `<group>/<kebab>/<kebab>.tsx + index.ts`.
- **`AppX` naming** on every component + type. **Named exports** only.
- **`forwardRef`** where a ref makes sense (Button, Input).
- `interface AppXProps` (often `extends …HTMLAttributes`), `readonly` fields.
- **`cn`** = `twMerge(clsx(...))` from `packages/ui/src/utils/cn.ts` (kept as-is).
- **`.ts`/`.tsx` extensions on relative imports** (the standing rule). The two
  pre-existing files using `.js` were aligned. The ui build was flipped to
  `allowImportingTsExtensions: true` + `emitDeclarationOnly: true` — apps consume
  the package as **source** via the Vite alias → `src/index.ts`, so no runtime JS
  emit is needed; the build emits only `.d.ts`. Verified (0 `.js`, 72 `.d.ts`).
- **`eqeqeq: ['error','always']`** — no `!= null`. Optional props guarded with
  `!== undefined`; `meemaw` `<Show>` used for conditional render where cleaner.
- **`noUncheckedIndexedAccess`** + `exactOptionalPropertyTypes` (ui) — handled.
- **Icons via `@icons`** (lucide-react). Per your call, the Studio's drawn domain
  set is mapped to lucide equivalents (`CookingPot → IconPot`, `Flame → IconPepper`,
  `Timer`, `Flag`, `Camera → IconSnap`, `Mic → IconVoice`, `Heart → IconSave`,
  `Play → IconCook`, `RefreshCw → IconReSuggest`, `Check → IconHave`, …) plus
  chrome glyphs. No hand-drawn SVGs.
- **`meemaw`** for control flow (`Repeat`, `Show`) throughout (installed this ship).
- **Fonts via `@fontsource`** (installed this ship): `bebas-neue`, `inter`,
  `@fontsource-variable/jetbrains-mono`, imported in `apps/web/src/main.tsx`.

## Components generated (37 components across 8 groups)

**Foundation/Primitives** — `AppText` (dish/display/heading/body/overline),
`AppButton` (primary/secondary/ghost/crit/crit-solid · sm/md/lg · press physics),
`AppHoldButton` (hold-to-confirm), `AppInput`/`AppField`, `AppStepper`, `AppChip`
(default/have/need/add), `AppSegmented`, `AppSwitch`, `AppRadioGroup`,
`AppCheckboxTile`.

**Data & display** — `AppMealCard` (★ signature · lg/sm · perfect banner ·
weak→secondary CTA), `AppPhotoPlaceholder` + `AppVTag` (painted gradients by dish
family), `AppMatchLine`, `AppPill` (full trust taxonomy), `AppAvatar`,
`AppIngredientCard`, `AppStatTile`, `AppRecentCard`, `AppListRow` +
`AppFavouritesList` (swipe-to-unsave), `AppMarketList`, `AppHaveNeed`,
`AppHonestyBar`.

**Progress & timers** — `AppProgressBar` (journey/timer/indeterminate),
`AppTimerRing` (cooker dial), `AppStepList`, `AppCheckingPot` (theatrical load),
`AppStepTimer` (real countdown · pause/+2/reset), `AppStepTimeChip` (tap→countdown).

**States** — `AppSkeleton`, `AppEmptyState`, `AppErrorState`, `AppNoMatch`.

**Capture** — `AppCaptureMethods`, `AppVoiceCapture` (hold-to-record), 
`AppPhotoExtract`, `AppMultiShot`.

**Navigation & overlays** — `AppShell`, `AppTabBar` (raised pot-puck),
`AppSettingsDrawer`, `AppTooltip`, `AppPopover`, `AppDefinedTerm`.

**Modals** — `AppModal`, `AppFormModal`, `AppCriticalModal` (typed DELETE),
`AppCustomModal`.

**Feedback + overlay layer** — `AppToast`, `AppBanner`, `AppCallout`, and the
**DrawerService** imperative layer (`drawer/`): framework-free `drawer-store.ts`
pub-sub + `drawer-service.ts` singleton (`toast`/`banner`/`confirm`/`critical`/
`openModal`) + `ToastHost`/`BannerHost`/`ModalHost` (`useSyncExternalStore` +
`createPortal`) + `swipeable-toast.tsx`. Modelled on the Gbedity reference, themed
to signboard tokens. Hosts are mounted once in `apps/web/src/app.tsx`. Demo screen
at `/preview` → "Feedback · DrawerService" exercises the full API.

## Skipped — scenes (build in app code, not the library)

These Studio specimens are full screens, not library building blocks. They're
visual specs for the application; build them in feature code using the components
above:

- `22-cook-flow.html`, `30-kitchen-input.html`, `31-suggestions.html`,
  `32-recipe.html`, `33-cook-mode.html`, `34-onboarding.html`, `42-cross.html`.

## Manual work remaining

- **Real photography** for the ~50 seed dishes. `AppPhotoPlaceholder` accepts a
  `src`; pass real URLs and the painted gradient becomes the fallback. The
  type-led degraded card (photo missing) is not specimen'd — design if needed.
- **Voice/photo capture wiring.** `AppVoiceCapture`/`AppPhotoExtract` are the
  presentational surfaces with hooks (`onHoldStart`/`onHoldEnd`, `onRemove`); the
  actual recording/extraction is app-level.
- **`example-screen.tsx`** still carries template placeholder class names
  (`text-brand-900` etc., now no-ops). Left as-is — it's a template stub, not in
  scope. Replace or delete when building real screens.
- **Dark mode** is deliberately out of scope (kitchens are lit; PRD is
  light-first), per the Studio build notes.

## Verification

`pnpm -F @kinnijije/ui typecheck` ✓ · `lint` ✓ · `build` (emits `.d.ts` only) ✓
`pnpm -F @kinnijije/web typecheck` ✓ · `lint` ✓ · `build` ✓ (fonts bundled)
