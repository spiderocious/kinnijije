# QA Handoff — Consumer App (Phases 3–5)

**Date:** 2026-06-13
**Build:** Typecheck ✅ · Lint ✅ · Build ✅ (backend tests still 29 ✅)
**Frontend:** `apps/web` (PWA) · dev at `http://localhost:5173` (or next free port)
**Backend:** `http://localhost:9093` (must be running, with Phase-2 recipes seeded)
**Seed account:** create one via the app, or reuse `admin@kinnijije.app / Password123!`

The entire consumer PWA is built across Phases 3–5, FSD, reusing `@kinnijije/ui`
throughout (no UI reinvented). Tokens in **sessionStorage**.

---

## Routes

| Route | Screen | Gate |
|-------|--------|------|
| `/` | Landing (value prop + Get started) | public; redirects to `/kitchen` if signed in |
| `/login` · `/register` | Auth | public |
| `/onboarding` | 3-step prefs (cuisines, difficulty, confirm) | authed, no shell |
| `/kitchen` | Home — "What's in your kitchen?" (Type/Voice/Photo) | authed + shell |
| `/suggestions` | 3 meal cards + re-suggest | authed + shell |
| `/recipe/:id` | Recipe (hero, meta, have/need, steps, flag, action bar) | authed + shell |
| `/recipe/:id/cook` | Cook mode (full-screen, wake-lock, timers) | authed, no shell |
| `/favourites` | Saved list (cook-again, unsave) | authed + shell |
| `/settings` | Prefs, measurement, delete account, sign out | authed + shell |
| `/preview` | Design-system catalogue (unchanged) | public |

The PWA shell = `AppShell` (wordmark top bar) + `AppTabBar` (Saved · **Kitchen**
puck · Settings).

---

## The core flow (60 seconds, every meal)

1. `/kitchen` — pick a method:
   - **Type:** autosuggest from the Nigerian dictionary; tap a suggestion or Enter to add a chip.
   - **Voice:** hold `AppVoiceCapture` → records (MediaRecorder) → uploads audio to R2 → `extract/voice` → chips.
   - **Photo:** `Take a photo` (camera) → uploads image(s) to R2 → `extract/photo` → chips.
2. Chips accumulate in the **kitchen session** (shared across methods; not persisted — fresh every time, per PRD).
3. "Suggest meals" → `/suggestions` → 3 `AppMealCard`s (have/need match, Verified/AI tag, perfect-match banner, weak→secondary CTA). "Something else" re-suggests excluding shown cards.
4. Open a card → `/recipe/:id` — have (green) / need (grey) split computed from the session; Steps tab; flag-a-step; Save / Else / **Start cooking**.
5. Cook mode — one big step at a time, progress dots, optional per-step timer, prev/next, **screen stays awake**.

---

## Things to verify by hand

- [ ] Sign up → lands in onboarding → set prefs → kitchen. Skip also works.
- [ ] Log in (existing account) → straight to kitchen. Refresh keeps the session; logout clears it.
- [ ] Type "rice, tomatoes, pepper, onion, chicken" → 3 real seed suggestions (Chicken Stew, Jollof…).
- [ ] Re-suggest returns different cards.
- [ ] Open a recipe → have/need split correct → Save (toast) → appears in Favourites.
- [ ] Start cooking → step timer runs → screen doesn't sleep → Done returns to recipe.
- [ ] Favourites: cook-again opens cook mode; swipe/unsave removes.
- [ ] Settings: measurement toggle persists; "Delete account" behind a type-DELETE critical modal; sign out.
- [ ] **Voice/Photo need an OpenAI key on the backend** (`AI_PROVIDER=openai`). With `AI_PROVIDER=mock` they return deterministic fixtures — good for UI testing without a key.
- [ ] **PWA:** installable (manifest + SW); `theme-color` danfo yellow; offline shell opens the app after first load (production build only — SW is disabled in dev).
- [ ] **Mobile:** every screen is mobile-first; the shell tab bar + sticky CTAs sit in the thumb zone; auth/forms are single-column.

---

## Error & empty states

| Case | Behaviour |
|------|-----------|
| API error on a screen | `AppErrorState` with the **backend message** + Try again |
| Empty favourites | `AppEmptyState` (♡) + "Find a meal" |
| No mic permission (voice) | inline warn message, suggests typing instead |
| Photo/voice extract fails | inline warn, suggests typing instead |
| Save an already-saved recipe | soft "Already in favourites" (handles 409) |
| Invalid/expired session | guards redirect to landing |

---

## Persona compliance (audited clean)

0 `any` · 0 direct `lucide-react` imports · 0 raw `fetch` in components · 0
hardcoded route/EP strings (all via `ROUTES`/`EP`) · 0 `&&` conditional rendering
(uses meemaw `<Show>`/`<Repeat>`) · every route lazy-loaded · route-level error
boundaries · inline errors carry the backend message · accessible (ARIA, semantic,
focus rings, `role=status`/`role=alert`).

---

## Out of scope (deferred / later)

- [ ] Substitution engine, dietary filtering (PRD v2).
- [ ] Push notifications (toggle present but inert in v1).
- [ ] "Uploads & extractions" history view (records exist server-side; UI optional).
- [ ] Real hero photos per recipe (upload via admin; consumer falls back to family art).
