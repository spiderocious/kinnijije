# KinniJije — Build Phases

The ordered plan. **Backend is built once and complete (Phase 1); the admin app
is built next (Phase 2) so all content is seeded and managed via API; the
end-user app is built progressively on top (Phases 3+).** Phase 0 is the
foundation/cleanup. Phases are sequential; we pause for review after each.

Why this order: the backend is the contract everything stands on. **Admin comes
before the end-user app on purpose** — meals, recipes, prompts and feature flags
are **data in the DB, never hardcoded in code**. So we build the admin APIs, then
**seed real content through the admin UI** (with images), then build the consumer
app against a database that already has published recipes. No design work in
these phases — `@kinnijije/ui` already exists and its `/preview` parts
(`meal-card`, `photo-match`, `step-timer`, …) are donors the slices promote.

See full architecture in [build-plan.md](../build-plan.md). Recap:

- **Monorepo:** TS pnpm/Nx, already `@kinnijije/*`. Backend = `main-backend`;
  admin = `apps/admin-web`; end-user PWA = `apps/web`.
- **Product:** single-user-account PWA. Say what's in your kitchen
  (type / voice / photo) → **3 meal suggestions** with have-vs-need + a cook
  flow. Nigerian/West-African first; AI fills the long tail.
- **Content in DB, not code:** recipes, prompts, feature flags are documents,
  created/edited via **admin APIs**. No seed arrays in source.
- **Database:** MongoDB via Mongoose behind Repository ports (⚠️ deliberate
  deviation from PRD's Postgres — build-plan §1.1). Cursor pagination only.
  Tests use `mongodb-memory-server`.
- **Auth:** roll-our-own. Email+password, **no email verification, no magic
  link**. JWT access + **refresh**, **stored in `sessionStorage`** (token-service
  + ky 401-refresh). One `users` model, **role-gated** `user` / `admin`; admin-web
  uses the same `/auth/login`.
- **AI:** **OpenAI from day one**, behind an `AiProvider` port. `OpenAiProvider`
  (real: Vision, **hosted Whisper** on the same key, GPT generation) +
  **`MockOpenAI`** (deterministic, same methods), switched by **`AI_PROVIDER`**
  (default `openai`; `mock` for tests/local). Cook times padded **+30%**; AI
  quantities flagged `approximate`. **Every AI call is audited** (inputs, prompt,
  raw + parsed output, cost) for the admin trail.
- **Storage (R2 via the external file-service):** `GET /get-upload-uri` → `PUT`
  to R2 → save the **`key`**; `GET /get-file-uri?key=` to view. Backend stores
  only the `key`. **Kitchen photos ARE saved** (key persisted in an `extractions`
  record) before being piped to OpenAI, so the user/admin can later see the
  upload + what was extracted. Recipe heroes use the same key pattern;
  **`apps/web/public/recipe-placeholder.png`** is the default until an admin
  uploads a real image per meal.
- **HTTP:** ky client (`@kinnijije/api`) + TanStack Query.

---

## Phase 0 — Foundation + cleanup

**Goal:** clear template placeholders and stand up the shared seams.

**Scope:**
- Delete placeholders: `example` feature (backend + web), `ExampleItem`,
  `ROUTES.EXAMPLE*`, `EP.EXAMPLE*`, placeholder home/website copy.
- `@kinnijije/core`: Zod schemas + inferred types for the domain (`User`,
  `UserPrefs`, `Recipe`, `RecipeIngredient`, `RecipeStep`, `Favourite`,
  `Feedback`, `Extraction`, `AiAudit`, `Prompt`, `FeatureFlag`, `SuggestionCard`)
  + envelope types. **Ingredient canonicaliser + Nigerian-weighted dictionary**
  (shared by backend matching + frontend autosuggest).
- DB: MongoDB + Mongoose with Repository **ports** (`UserRepo`,
  `RefreshTokenRepo`, `RecipeRepo`, `FavouriteRepo`, `FeedbackRepo`,
  `ExtractionRepo`, `AiAuditRepo`, `PromptRepo`, `FeatureFlagRepo`) + Mongo
  adapters; connection in `env.ts`; `mongodb-memory-server` for tests.
- Storage: `FileService` client (R2 presigned-URL flow) in `@kinnijije/api`.
- AI: `AiProvider` port + **both** `OpenAiProvider` and `MockOpenAI`; selected by
  `AI_PROVIDER`. `aiAudit` write helper.
- `recipe-placeholder.png` committed (✅ done) as the default hero.
- Extend `env.ts`: `MONGODB_URI`, `OPENAI_API_KEY`, `AI_PROVIDER` (default
  `openai`), `FILE_SERVICE_URL`. (JWT secrets already present.)

**Done when:**
- [ ] No `example` / `ExampleItem` references (`grep` clean).
- [ ] Mongo connects; ports + adapters typecheck.
- [ ] `FileService` client compiles against the documented R2 contract.
- [ ] `AiProvider` port + `OpenAiProvider` + `MockOpenAI` typecheck; `AI_PROVIDER`
      switch works.
- [ ] `pnpm exec nx run-many -t typecheck` and `-t build` pass.

---

## Phase 1 — The entire MVP backend (built once, contract-tested)

**Goal:** implement **every endpoint the whole MVP needs** — consumer **and
admin** — behind the ports, with Zod validation and contract tests. After this,
the API is complete; admin-web (Phase 2) and the consumer app (Phases 3+) build
against a real running backend.

All routes: `asyncHandler` + `ResponseUtil` + Zod + ports, registered in order in
`app.ts`. Every handler returns the envelope and gets a contract test. Admin
routes sit behind `requireRole('admin')`.

### Every endpoint and the screen(s) it serves

> AI: real OpenAI by default; tests run with `AI_PROVIDER=mock` (`MockOpenAI`).
> Storage: photo/voice endpoints take **R2 keys** (frontend uploads first);
> backend persists the key in an `extractions` record, then calls OpenAI.

#### Auth & account
| Method | Path | Used by screen(s) | Purpose |
|---|---|---|---|
| POST | `/auth/register` | **Sign up** (`web`) | Create account (email+password, argon2). Returns `{ user, tokens }`. No verification. |
| POST | `/auth/login` | **Log in** (`web` + **admin-web**) | Authenticate. Same endpoint for admins (role-gated routes downstream). |
| POST | `/auth/refresh` | _app-wide_ (ky 401 interceptor, both apps) | New access token from the refresh token. |
| POST | `/auth/logout` | Settings / header menu (both apps) | Revoke refresh token. |
| GET | `/me` | **AuthGuard / boot**, Settings (both apps) | Current user + role + prefs. |
| PATCH | `/me/prefs` | **Onboarding**, **Settings** (`web`) | Save cuisine biases, difficulty floor, measurement. |
| DELETE | `/me` | **Settings** → Delete account (`web`) | Irreversible deletion. |

#### Ingredients & kitchen input (consumer)
| Method | Path | Used by screen(s) | Purpose |
|---|---|---|---|
| GET | `/ingredients/suggest?q=` | **Kitchen input → Type** | Autosuggest from the Nigerian-weighted dictionary. |
| GET | `/ingredients/recent` | **Kitchen input** ("pick from recent") | User's recent ingredient chips. |
| POST | `/ingredients/extract/photo` | **Kitchen input → Photo** (`capture`) | `{ keys[] }` → OpenAI Vision → `{ extractionId, ingredients, inputUrls }`. Upload is **kept**. Gated by `input.photo` flag. |
| POST | `/ingredients/extract/voice` | **Kitchen input → Voice** (`app-hold-button`) | `{ key }` → Whisper + GPT → `{ extractionId, transcript, ingredients, inputUrl }`. Kept. Gated by `input.voice` flag. |

#### Suggestions & recipes (consumer)
| Method | Path | Used by screen(s) | Purpose |
|---|---|---|---|
| POST | `/suggestions` | **Confirm → Suggest meals**, **Suggestions** (re-suggest) | `{ ingredients, excludeRecipeIds? }` → exactly **3** cards from **published** recipes + AI fill. |
| GET | `/recipes/:id` | **Recipe view**, **Cook mode** | Full recipe (ingredients, steps, meta, source tag, hero URL). |

#### Favourites & feedback (consumer)
| Method | Path | Used by screen(s) | Purpose |
|---|---|---|---|
| GET | `/favourites?cursor=` | **Favourites** | Cursor-paginated saved list. |
| POST | `/favourites` | **Recipe view** → ❤️ Save | Save; freezes AI snapshot. |
| DELETE | `/favourites/:recipeId` | Recipe view / Favourites | Unsave. |
| POST | `/feedback` | **Recipe / Cook mode** → "Flag this step" | Collected for admin review + seed correction. |

#### Admin — platform management (all `requireRole('admin')`, served by **admin-web**)
| Method | Path | Used by admin screen | Purpose |
|---|---|---|---|
| GET | `/admin/metrics` | **Admin dashboard** | Counts: users, recipes (by status), extractions, AI calls + cost. |
| GET | `/admin/users?cursor=&q=` | **Users list** | Browse/search users. |
| GET | `/admin/users/:id` | **User detail** | Prefs, favourites, extraction history. |
| PATCH | `/admin/users/:id` | **User detail** | Suspend/reactivate; set role. |
| GET | `/admin/recipes?cursor=&status=&source=` | **Recipes list** | All recipes incl. drafts. |
| POST | `/admin/recipes` | **New / Seed recipe** | **Seed meals via API** (the seeding mechanism — no code arrays). |
| PATCH | `/admin/recipes/:id` | **Edit recipe** | Edit name, ingredients, steps, meta. |
| POST | `/admin/recipes/:id/publish` · `/unpublish` | **Edit recipe** | Control suggestability. |
| DELETE | `/admin/recipes/:id` | **Recipes list** | Remove. |
| POST | `/admin/recipes/:id/hero` | **Edit recipe** | Attach a hero image `key` (R2 upload). |
| POST | `/admin/recipes/generate` | **AI generate → draft** | Run AI generation now; save as a **draft** to review/edit/publish. |
| GET | `/admin/ai-audit?cursor=&kind=&status=` | **AI audit trail** | Every AI call (provider-agnostic). |
| GET | `/admin/ai-audit/:id` | **AI audit detail** | **What went into the AI (input + prompt), what came out (raw + parsed)**; provider/model/latency/cost shown as data. |
| GET | `/admin/prompts` · `/admin/prompts/:key` | **Prompts editor** | Templates + versions. |
| PUT | `/admin/prompts/:key` | **Prompts editor** | Edit a prompt → new version, set active (tune the Nigerian-first prompt without a deploy). |
| GET | `/admin/feature-flags` | **Feature flags** | List flags. |
| PATCH | `/admin/feature-flags/:key` | **Feature flags** | Turn features on/off (e.g. photo input, AI generation, signups). |
| GET | `/admin/feedback?cursor=&status=` | **Feedback review** | Flagged steps/ingredients. |
| PATCH | `/admin/feedback/:id` | **Feedback review** | Mark reviewed. |

#### Health
`GET /health` — liveness (already scaffolded).

**Cross-cutting:**
- Shared `@kinnijije/core` Zod schemas validate every body/response.
- **Contract test per handler.** Integration tests via `mongodb-memory-server`.
- Suggestion-engine logic unit-tested with `MockOpenAI` — no key needed in CI.
- Feature-flag checks on gated endpoints (`input.photo`, `input.voice`,
  `ai.generation`, `signups`).

**Done when (testable as an API — REST client / test suite):**
- [ ] Every endpoint returns the documented shape; auth gates account routes;
      `requireRole('admin')` gates admin routes; flags gate gated endpoints.
- [ ] Happy path (REST client): admin seeds + publishes a recipe → register a
      user → set prefs → `POST /suggestions` returns it → save favourite → flag a
      step → admin sees the feedback + an AI audit entry.
- [ ] Contract + integration tests green; typecheck + lint + build pass.
- [ ] **Backend QA handoff** doc produced.

---

## Phase 2 — Admin app (`apps/admin-web`) + seed real content

**Goal:** stand up the admin console against the Phase-1 API, then **use it to
seed the real meals** (recipes + the placeholder image, swappable later). After
this, the database holds published recipes and the consumer app has real content
to work with.

**Scope (`apps/admin-web` + `@kinnijije/api`):**
- Admin auth: login via `/auth/login`, `AdminGuard` requiring `role==='admin'`;
  token-service (`sessionStorage`) + ky 401-refresh; seed one admin user.
- **Dashboard:** `/admin/metrics` cards.
- **Users:** list (cursor) + detail; suspend/reactivate; set role.
- **Recipes:** list (status/source filters) · create/edit form (name, cuisines,
  difficulty, cook time, serves, ingredients with canonical keys, steps) ·
  publish/unpublish · delete · **hero upload** (R2 flow, defaults to
  `recipe-placeholder.png`).
- **AI generation → draft:** trigger `/admin/recipes/generate`, review the draft,
  edit, publish.
- **AI audit trail:** list + detail — **see exactly what went into the AI
  (input + prompt) and what came back (raw + parsed)**; provider, model, latency
  and cost are shown as data on each entry (provider-agnostic).
- **Prompts editor:** edit the Vision/parse/generate templates → new version.
- **Feature flags:** toggle photo input, voice input, AI generation, signups, etc.
- **Feedback review:** triage flagged steps/ingredients → mark reviewed.
- **Seed pass:** create the ~50 Nigerian/WA meals **through the UI** (start with a
  tested subset), all using the placeholder hero for now.

**Done when (test by hand):**
- [ ] Log in as admin; non-admins are blocked.
- [ ] Seed + publish recipes via the UI; they appear with the placeholder hero.
- [ ] Generate an AI recipe to a draft, edit, publish.
- [ ] AI audit shows inputs/prompts/outputs for each call; a prompt edit creates a
      new active version.
- [ ] Toggle a feature flag and see the gated endpoint respond accordingly.
- [ ] Typecheck + build pass.

---

## Phase 3 — Consumer: auth + onboarding (`apps/web`)

**Goal:** a user can sign up / log in (email+password, no verification), complete
the 3-step onboarding, and land on home.

**Scope:**
- Auth hooks (`useLogin`, `useRegister`, `useMe`, `useLogout`) → `EP.AUTH_*`.
- token-service (`sessionStorage`) + ky 401-refresh; `AuthProvider`; `AuthGuard`.
- Landing → sign up → log in.
- **Onboarding** (3 skippable): cuisine multi-select (`app-selection`), difficulty
  (`app-segmented`), continue (`app-stepper`) → `PATCH /me/prefs` (defaults:
  Nigerian + West African).
- Home shell ("What's in your kitchen?" + Favourites link).

**Done when:** sign up + log in work; refresh persists; onboarding writes prefs;
typecheck + build pass.

---

## Phase 4 — Consumer: the input loop (Type → suggestions → recipe → cook) ← the heart

**Goal:** the core 60-second loop against **real published recipes** from Phase 2,
**Type input first** (no camera/mic yet) to prove the seam on solid data.

**Scope:**
- **Kitchen input → Type:** autosuggest (`/ingredients/suggest`), chips
  (`app-chip`), recent (`/ingredients/recent`); confirm screen.
- **Suggestions:** 3 `meal-card`s (promoted), match strength, Verified/AI pill,
  re-suggest.
- **Recipe view:** hero, meta strip, Ingredients (have=green/need=grey), Steps,
  "Flag this step" → `POST /feedback`, action bar.
- **Cook mode:** full-screen step takeover (`app-stepper` + `timers`), wake-lock,
  per-step timer, prev/next.

**Done when:** type ingredients → 3 real suggestions → open → cook with a running
timer; re-suggest varies; flag works; typecheck + build pass.

---

## Phase 5 — Consumer: AI input (Voice + Photo)

**Goal:** light up the camera/mic input methods (OpenAI was already live for
generation in admin; here we add the consumer-facing extraction).

**Scope:**
- **Voice:** hold-to-record (`app-hold-button`) → R2 upload → `extract/voice`
  → confirm chips. Shows transcript.
- **Photo:** camera (`capture`) → R2 upload (kept) → `extract/photo` →
  `photo-match` confirm chips; multi-photo combine.
- **Quality gate (PRD):** test 20 generations + real fridge photos; if photo
  extraction is mixed, flip the **`input.photo`** flag (admin) to demote Photo /
  default to Type — no rewrite.
- Optional: an "uploads & extractions" view so the user can see past photos +
  what was extracted (the `extractions` record makes this cheap).

**Done when:** voice/photo produce correct chips; an AI suggestion appears tagged
with padded time + approximate note; typecheck + build pass.

---

## Phase 6 — Consumer: favourites, settings, PWA

**Goal:** close the product.

**Scope:**
- **Favourites:** cursor list, re-open, "cook this again"; save/unsave (AI
  snapshot freeze).
- **Settings:** email/password, prefs (`PATCH /me/prefs`), measurement,
  notification toggle (inert v1), account deletion (`DELETE /me`, `crit`
  confirm), about/privacy, sign out.
- **PWA:** manifest, icons, service worker, installability (Android + iOS),
  offline home shell.

**Done when:** save (incl. AI) persists + re-cook works; settings round-trip;
deletion behind a destructive confirm; installs + launches standalone; typecheck
+ build pass.

---

## Open decisions to confirm before/within each phase

- **MongoDB over Postgres:** confirmed deviation (build-plan §1.1). _[locked]_
- **Auth:** no verification, no magic link; JWT in `sessionStorage` + refresh;
  role-gated admin. _[locked]_
- **AI:** OpenAI from day one; `MockOpenAI` via `AI_PROVIDER`; hosted Whisper on
  the existing key. _[locked]_
- **Kitchen photos kept** (R2 key + `extractions` record), not transient.
  _[locked]_
- **Content via admin APIs**, not code; placeholder hero swappable per meal.
  _[locked]_
- **Seed recipes:** the moat — human-reviewed. Seed a tested **~10 subset** in
  Phase 2; expand to ~50. _[Phase 2 — needs your review]_
- **Hosting / deploy target** for backend + Mongo (Railway alongside the
  file-service?). _[before launch]_
