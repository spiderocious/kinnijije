# KinniJije — Architecture & Build Plan

**Status:** v1 plan · **Date:** 2026-06-13
**Source of truth:** [prd.md](../../dockito/projects/kinnijije/prd.md) · obeys [rules.md](./rules.md)

This is the contract-first build plan. Read it before writing feature code. It
records the stack decisions (including deliberate deviations from the PRD), the
data model, the endpoint contracts, the AI service shape, the frontend slice
order, and the phased milestones. Phased delivery lives in
[product/phases.md](./product/phases.md).

---

## 1. Stack decisions (locked)

| Concern | Decision | Note |
|---|---|---|
| **Database** | **MongoDB + Mongoose** (behind Repository ports) | ⚠️ **Deviation from PRD** (PRD says Postgres). Justified below. |
| **Content lives in the DB, not code** | recipes/meals/prompts/flags are **data**, seeded **via admin APIs** | No hardcoded recipe arrays. Admin owns content. |
| **AI provider** | **OpenAI from day one**, behind an `AiProvider` port | `OpenAiProvider` (real) + `MockOpenAI` (deterministic), switched by env. |
| **Auth** | **Roll-our-own**, no email verification, **no magic link** | argon2 hash · JWT access + refresh · **tokens in `sessionStorage`** (not cookies). Single user model, **role-gated** (`user` / `admin`). |
| **Object storage** | **R2 via the external file-service** | Kitchen photos **are saved** (key persisted) then piped to OpenAI; recipe hero images by `key`. |
| **End-user frontend** | `apps/web` (PWA), FSD | React 19 · react-query · react-router · `@kinnijije/ui` · meemaw. |
| **Admin frontend** | `apps/admin-web`, FSD | Built **right after the backend** — manages the whole platform. |

### 1.1 Why MongoDB (the deviation)

The PRD specifies Postgres; we are using MongoDB. Per rules.md, deviations need a
reason:

- **AI recipes are schema-variable.** Seeded recipes have precise quantities;
  AI recipes have approximate ones, variable step counts, optional fields. A
  document model stores both shapes in one `recipes` collection without
  nullable-column sprawl.
- **No relational pressure.** v1 is single-user-account with no household
  sharing, no cross-entity joins, no reporting.
- **Embedded sub-documents fit the domain.** A recipe's `ingredients[]` and
  `steps[]` are read together, never queried independently.

**Guardrails preserved despite the deviation:**
- **Mongoose behind Repository ports** — services depend on interfaces; Mongoose
  never leaks into business logic. Swapping DB later = a new adapter.
- **Cursor pagination, never offset.** Cursor = last seen `_id` / indexed
  `createdAt` → `{ items, nextCursor: string | null, hasMore: boolean }`.
- **Strict schemas**, no `any`, validation at the boundary.
- **Service layer never throws** for expected failures — returns `ServiceResult`.

### 1.2 Auth model (revised)

- **No email verification, no magic link.** Direct **sign up** and **log in**
  with email + password (argon2). A magic-link seam can be added later but ships
  **no code now**.
- **JWT in `sessionStorage`** (your call), not httpOnly cookies. Access token
  (short-lived, ~15m) + **refresh token** (longer, ~30d). The ky client attaches
  the access token; on `401` it calls `POST /auth/refresh` with the refresh token
  and retries once. A `token-service` centralises all reads/writes to
  `sessionStorage` so it's swappable.
  - _Trade-off noted:_ `sessionStorage` is XSS-readable (the frontend guide
    prefers httpOnly cookies). Mitigations: strict CSP, no
    `dangerouslySetInnerHTML` with user content, short access-token TTL, refresh
    rotation + server-side revocation. Documented deviation.
- **Single `users` collection, role-gated.** `role: 'user' | 'admin'`. Admin-web
  logs in through the **same** `/auth/login`; admin routes sit behind a
  `requireRole('admin')` middleware. One auth system, one token shape.

### 1.3 AI provider switch

`AiProvider` is a port with two impls, selected at boot by **`AI_PROVIDER`**:

- `AI_PROVIDER=openai` (**default**) → `OpenAiProvider` (real calls; Vision,
  Whisper, GPT generation). Uses your existing `OPENAI_API_KEY`.
- `AI_PROVIDER=mock` → `MockOpenAI` — **same methods, deterministic fixtures**,
  no network. Used by tests and quick local runs. CI never holds real creds.

**Whisper:** OpenAI's **hosted** Whisper (`POST /v1/audio/transcriptions`,
~$0.006/min) on the **same** `OPENAI_API_KEY` — no separate account or payment,
same SDK, covered by `MockOpenAI`. (Self-hosted Whisper is the only alternative
and needs a GPU; not worth it here.)

**Every AI call is recorded** in an `aiAudit` collection (see §3) — what went
**into** the AI (inputs, prompt used) and what came **out** (raw + parsed
output), plus latency, cost estimate, status. The **provider** and **model** are
recorded as plain fields on each entry (so a swap from OpenAI to anything else is
just a different value in the detail). This powers the provider-agnostic admin AI
audit trail and is the substrate for prompt editing.

### 1.4 Storage flow (kitchen photos are kept)

Kitchen photos are **no longer transient**. Flow:

1. Frontend gets an upload URI (`GET /get-upload-uri?ext=jpg` on the
   file-service) → `PUT`s the image straight to R2 → receives a **`key`**.
2. Frontend calls `POST /ingredients/extract/photo` with the **`key`(s)** (not
   bytes).
3. Backend resolves the key → a view URL (`GET /get-file-uri`), fetches the
   image, sends it to OpenAI Vision, and **persists an `extractions` record**
   (the `key` + extracted ingredients + link to the `aiAudit` entry).
4. The user (and admin) can later see **what was uploaded** and **what was
   extracted**. Voice works the same way (audio `key` → Whisper → extraction
   record).

Backend stores only the **`key`**, never the URI, never bytes. Recipe hero images
follow the same key-based pattern; **`recipe-placeholder.png`** is the default
until an admin uploads a real image per meal.

---

## 2. ServiceResult contract (backend backbone)

```ts
type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ErrorCode; message: string; fieldErrors?: Record<string, string> } };
```

Services never throw for expected failures; they return `err`. Unexpected
failures bubble to the central error handler. `ErrorCode` is a union of
message-keys (`'not_found'`, `'conflict'`, `'validation_error'`,
`'unauthorized'`, `'forbidden'`, `'ai_unavailable'`, `'extraction_failed'`,
`'feature_disabled'`, …). Controllers map `error.code` → HTTP status via one
`codeToStatus()` table, then `ResponseUtil.error(...)`.

---

## 3. Data model (collections)

```
users
  _id, email (unique, lower), passwordHash,
  name, role: 'user' | 'admin',
  prefs: { cuisines: string[], difficultyFloor: 'easy'|'medium'|'anything',
           measurement: 'metric'|'imperial' },
  recentIngredients: string[]  (capped, most-recent-first),
  status: 'active' | 'suspended',
  createdAt, updatedAt

refreshTokens
  _id, userId, tokenHash, expiresAt, revokedAt?, createdAt
  (index: userId; TTL index on expiresAt)
  // No magicLinks collection in v1.

recipes                       ← seed + AI recipes; ALL content lives here (DB, not code)
  _id, slug,
  source: 'seed' | 'ai',      ← drives "Verified recipe" vs "Suggested by AI" tag
  status: 'draft' | 'published',   ← admin publishes; only published are suggestable
  name, cuisines: string[], difficulty: 'easy'|'medium'|'involved',
  cookTimeMinutes, serves,
  heroImageKey?,              ← R2 key; resolved to a URL via file-service.
  heroImageKind: 'photo' | 'generated' | 'placeholder',
  ingredients: [{ name, quantity?, approximate: boolean, canonicalKey }],
  steps: [{ index, heading, description, estMinutes? }],
  searchKeys: string[],       ← canonicalised ingredient keys, multikey-indexed
  createdBy, sourceAuditId?,  ← if AI-generated, links to the aiAudit entry
  createdAt, updatedAt

extractions                   ← kept uploads + their extraction result
  _id, userId, kind: 'photo' | 'voice',
  inputKeys: string[],        ← R2 keys for the uploaded image(s)/audio
  transcript?,                ← voice only
  extractedIngredients: string[],
  aiAuditId,                  ← links to the AI trail entry
  createdAt

favourites
  _id, userId, recipeId, savedSnapshot (frozen recipe — AI recipes are otherwise
       not guaranteed permanent), createdAt
  (compound unique index: { userId, recipeId })

feedback                      ← "This isn't quite right" flags
  _id, userId, recipeId, target: { kind: 'step'|'ingredient', index },
  note?, status: 'open' | 'reviewed', createdAt

aiAudit                       ← every AI call, provider-agnostic — the admin trail
  _id, userId?, kind: 'vision'|'whisper'|'parse'|'generate',
  promptId?, promptVersion?,  ← which prompt template + version was used
  provider: string,           ← just a data field shown in the detail ('openai'|'mock'|…)
  model,                       ← provider's model id, also just data
  input: { ... redacted/safe summary ... },   ← what went INTO the AI
  rawOutput, parsedOutput?,    ← what came back OUT
  status: 'ok' | 'error', errorMessage?,
  latencyMs, costEstimateUsd,
  createdAt
  // The trail records what went into / out of "the AI". The provider/model are
  // recorded AS DATA, not as the definition of the trail — swapping providers
  // later changes the field value, not the audit concept or schema.

prompts                       ← editable AI prompt templates (admin-owned)
  _id, key: 'vision'|'parse'|'generate', version (int, increments on edit),
  template (string with placeholders), notes?,
  active: boolean,            ← the live version for that key
  createdBy, createdAt

featureFlags                  ← runtime on/off switches (admin-owned)
  _id, key (e.g. 'input.photo', 'input.voice', 'ai.generation', 'signups'),
  enabled: boolean, description, updatedBy, updatedAt
```

**Ingredient canonicalisation** (`canonicalKey` / `searchKeys`) is the spine of
the suggestion engine: "tomatoes", "tomato", "fresh tomatoes" → `tomato`. The
normaliser + dictionary (Nigerian-staple-weighted) lives in `@kinnijije/core`,
shared by backend matching and frontend autosuggest.

---

## 4. Endpoint contracts (`/api/v1`)

Envelope everywhere: success `{ data, meta? }`, error
`{ error: { code, message, field_errors? } }`. Field names below are the **wire
shape** — frontend types must match exactly. Full per-screen mapping is in
[product/phases.md](./product/phases.md) §"every endpoint and the screen it serves".

### Auth & account
| Method | Path | Body | Data |
|---|---|---|---|
| POST | `/auth/register` | `{ email, password, name }` | `{ user, tokens }` |
| POST | `/auth/login` | `{ email, password }` | `{ user, tokens }` |
| POST | `/auth/refresh` | `{ refresh_token }` | `{ access_token }` |
| POST | `/auth/logout` | `{ refresh_token }` | `204` |
| GET  | `/me` | — | `{ user }` |
| PATCH | `/me/prefs` | `{ cuisines?, difficultyFloor?, measurement? }` | `{ user }` |
| DELETE | `/me` | — | `204` |

`tokens = { access_token, refresh_token }` returned in the **body** (frontend
stores them in `sessionStorage`). No magic-link endpoints.

### Ingredients & input
| Method | Path | Body | Data |
|---|---|---|---|
| GET | `/ingredients/suggest?q=` | — | `{ items: string[] }` |
| GET | `/ingredients/recent` | — | `{ items: string[] }` |
| POST | `/ingredients/extract/photo` | `{ keys: string[] }` | `{ extractionId, ingredients, inputUrls }` |
| POST | `/ingredients/extract/voice` | `{ key }` | `{ extractionId, transcript, ingredients, inputUrl }` |

Photo/voice take **R2 keys** (uploaded by the frontend first), not bytes. Gated
by `featureFlags` (`input.photo` / `input.voice`).

### Suggestions & recipes
| Method | Path | Body | Data |
|---|---|---|---|
| POST | `/suggestions` | `{ ingredients, excludeRecipeIds? }` | `{ suggestions: SuggestionCard[3] }` |
| GET | `/recipes/:id` | — | `{ recipe }` |

`SuggestionCard = { recipeId, name, source, heroImageUrl, difficulty,
cookTimeMinutes, match:{ have, total, needCount }, haveIngredients[],
needIngredients[] }`.

### Favourites & feedback
| Method | Path | Body | Data |
|---|---|---|---|
| GET | `/favourites?cursor=` | — | `{ items, nextCursor, hasMore }` |
| POST | `/favourites` | `{ recipeId }` | `201 { favourite }` |
| DELETE | `/favourites/:recipeId` | — | `204` |
| POST | `/feedback` | `{ recipeId, target, note? }` | `201 { feedback }` |

### Admin (all behind `requireRole('admin')`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/metrics` | dashboard counts (users, recipes, extractions, AI spend) |
| GET | `/admin/users?cursor=&q=` | users list |
| GET | `/admin/users/:id` | user detail (prefs, favourites, extractions) |
| PATCH | `/admin/users/:id` | suspend/reactivate, set role |
| GET | `/admin/recipes?cursor=&status=&source=` | recipe list (incl. drafts) |
| POST | `/admin/recipes` | **create/seed** a recipe |
| PATCH | `/admin/recipes/:id` | edit a recipe |
| POST | `/admin/recipes/:id/publish` · `/unpublish` | publish state |
| DELETE | `/admin/recipes/:id` | remove a recipe |
| POST | `/admin/recipes/:id/hero` | attach a hero image `key` |
| POST | `/admin/recipes/generate` | run AI generation now, save as a **draft** to review |
| GET | `/admin/ai-audit?cursor=&kind=&status=` | AI audit trail list |
| GET | `/admin/ai-audit/:id` | one call: input + prompt in, raw + parsed output, plus provider/model/cost as data |
| GET | `/admin/prompts` · GET `/admin/prompts/:key` | prompt templates + versions |
| PUT | `/admin/prompts/:key` | edit a prompt → new version, set active |
| GET | `/admin/feature-flags` | list flags |
| PATCH | `/admin/feature-flags/:key` | toggle a flag |
| GET | `/admin/feedback?cursor=&status=` | review flagged steps/ingredients |
| PATCH | `/admin/feedback/:id` | mark reviewed |

### Health
`GET /health` — liveness (already scaffolded).

---

## 5. AI service shape

```ts
interface AiProvider {
  extractFromImages(images: Buffer[], prompt: PromptRef): Promise<ServiceResult<string[]>>;
  transcribe(audio: Buffer): Promise<ServiceResult<string>>;
  parseIngredients(text: string, prompt: PromptRef): Promise<ServiceResult<string[]>>;
  generateRecipe(input: GenerateRecipeInput, prompt: PromptRef): Promise<ServiceResult<Recipe>>;
}
```

- `OpenAiProvider` (real) and `MockOpenAI` (deterministic) implement it; chosen by
  `AI_PROVIDER`.
- Prompts are pulled from the `prompts` collection by `key` (admin-editable), so
  the **system prompt — Nigerian/West-African-first** — is tunable without a
  deploy.
- Every call writes an `aiAudit` entry.
- **AI cook times padded +30%** on display; AI quantities flagged `approximate`.

---

## 6. Suggestion engine logic

1. Canonicalise input → `searchKeys`.
2. Query **published** seed `recipes` with ≥60% key overlap.
3. Hard-filter by user `prefs.cuisines` + `difficultyFloor`.
4. ≥2 strong seed matches → 2 seed + 1 AI. Else → seed matches + AI fill to 3.
5. AI generation (if `ai.generation` flag on) prompted with prefs + ingredients;
   the generated recipe is saved (source `ai`) and audited.
6. Compute `match.have / match.total` per card.

---

## 7. Frontend feature slices

**`apps/admin-web` (built first, Phase 2)** — auth (role-gated) · dashboard
metrics · users list/detail/suspend · recipes CRUD + publish + hero upload + seed
· AI generation-to-draft · **AI audit trail** (inputs/prompts/outputs) · prompt
editor · feature flags · feedback review.

**`apps/web` (Phases 3+)** — auth (sign up / log in) · onboarding · kitchen-input
(Type/Voice/Photo) · suggestions · recipe view · cook mode · favourites ·
settings · PWA.

The `/preview` parts (`meal-card`, `photo-match`, `step-timer`, …) are donors —
promote, don't rebuild.

---

## 8. Seam-verification checklist (before each feature is "done")

```
[ ] Mongoose schema field names == frontend TS type field names exactly
[ ] Optional fields match: schema optional ↔ frontend field?: T
[ ] Pagination: nextCursor (string|null) + hasMore (boolean) on both sides
[ ] Arrays: backend sends [] not null for empty; frontend handles empty
[ ] Dates: ISO 8601 strings; frontend never assumes number
[ ] Errors: frontend checks error.code, not error.message
[ ] AI recipes: approximate flag surfaced; cook time already padded server-side
[ ] Tokens: stored only via token-service (sessionStorage); never logged
[ ] Admin routes: every one behind requireRole('admin')
```
