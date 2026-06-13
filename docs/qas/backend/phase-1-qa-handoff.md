# Backend QA Handoff — Phase 1 (entire MVP backend)

**Date:** 2026-06-13
**Branch:** main
**Build:** Typecheck ✅ · Lint ✅ · Build ✅ · Tests ✅ (27 passing)
**Base URL:** `http://localhost:9093/api/v1`
**Auth header:** `Authorization: Bearer <access_token>`

The whole MVP backend is implemented behind Repository ports with Zod validation
and contract/integration tests. AI runs through an `AiProvider` port: `openai`
(default) or `mock` (`AI_PROVIDER=mock`, deterministic — used by all tests).

---

## Running it

```bash
# Tests (in-memory Mongo, MockOpenAI — no external services, no API key)
pnpm -F @kinnijije/main-backend test

# Dev server (needs a Mongo + an OpenAI key unless AI_PROVIDER=mock)
cp apps/main-backend/.env.example apps/main-backend/.env   # then fill secrets
pnpm -F @kinnijije/main-backend dev                        # http://localhost:9093
```

On boot the server connects to Mongo and **idempotently seeds**: the 4 feature
flags (all on) and the 3 default AI prompts (active v1).

---

## Seed accounts

There is no pre-seeded user fixture for the running server (single-user product;
sign up directly). For admin access, create one user and flip its role in Mongo
to `admin`, or use the test helper `createAdmin()`. RBAC is enforced by
`requireRole('admin')` on every `/admin/*` route.

| Field | Value |
|-------|-------|
| Test user password | `Password123!` |
| Test admin password | `Password123!` |

---

## Endpoints implemented

### Auth & account
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/auth/register` | — | `{email,password,name}` → `{user,tokens}`. No email verification. Honours `signups` flag. |
| POST | `/auth/login` | — | `{email,password}` → `{user,tokens}`. Suspended users → 403. |
| POST | `/auth/refresh` | — | `{refresh_token}` → `{access_token,refresh_token}`. **Rotates** (old token revoked). |
| POST | `/auth/logout` | — | `{refresh_token}` → 204. |
| GET | `/me` | ✅ | `{user}`. |
| PATCH | `/me/prefs` | ✅ | `{cuisines?,difficultyFloor?,measurement?}`. |
| DELETE | `/me` | ✅ | 204; revokes refresh tokens. |

### Ingredients & input (consumer)
| Method | Path | Auth | Gate |
|--------|------|------|------|
| GET | `/ingredients/suggest?q=` | ✅ | — |
| GET | `/ingredients/recent` | ✅ | — |
| POST | `/ingredients/extract/photo` | ✅ | flag `input.photo`. Body `{keys:[]}` (R2 keys). |
| POST | `/ingredients/extract/voice` | ✅ | flag `input.voice`. Body `{key}`. |

### Suggestions & recipes (consumer)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/suggestions` | ✅ | `{ingredients[],excludeRecipeIds?}` → exactly **3** cards. AI fills (flag `ai.generation`). |
| GET | `/recipes/:id` | ✅ | `{recipe}`. AI cook times **+30% padded** on read. |

### Favourites & feedback (consumer)
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/favourites?cursor=` | ✅ | cursor page `{items,nextCursor,hasMore}`. |
| POST | `/favourites` | ✅ | `{recipeId}` → 201. Freezes recipe snapshot. Duplicate → 409. |
| DELETE | `/favourites/:recipeId` | ✅ | 204. |
| POST | `/feedback` | ✅ | `{recipeId,target:{kind,index},note?}` → 201. |

### Admin (all require `role: admin`)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/metrics` | users, recipe counts, AI calls + cost. |
| GET | `/admin/users?cursor=&q=` | cursor list. |
| GET | `/admin/users/:id` | + recent favourites & extractions. |
| PATCH | `/admin/users/:id` | `{status?,role?}`. |
| GET | `/admin/recipes?cursor=&status=&source=` | incl. drafts. |
| POST | `/admin/recipes` | seed a recipe (draft by default). |
| POST | `/admin/recipes/generate` | AI → **draft** to review. |
| PATCH | `/admin/recipes/:id` | edit. |
| POST | `/admin/recipes/:id/publish` · `/unpublish` | publish state. |
| POST | `/admin/recipes/:id/hero` | `{key,kind}` attach R2 hero. |
| DELETE | `/admin/recipes/:id` | 204. |
| GET | `/admin/ai-audit?cursor=&kind=&status=` | provider-agnostic AI trail. |
| GET | `/admin/ai-audit/:id` | input+prompt in / raw+parsed out / provider/model/cost. |
| GET | `/admin/prompts` · `/admin/prompts/:key` | templates + versions. |
| PUT | `/admin/prompts/:key` | new version, set active. |
| GET | `/admin/feature-flags` · PATCH `/admin/feature-flags/:key` | list / toggle. |
| GET | `/admin/feedback?cursor=&status=` · PATCH `/admin/feedback/:id` | review queue. |

### Health
`GET /health` — liveness.

---

## RBAC matrix

| Action | user | admin |
|--------|------|-------|
| Consumer routes (suggest, recipes, favourites, feedback, me) | ✅ | ✅ |
| `/admin/*` | ❌ 403 | ✅ |
| Unauthenticated `/admin/*` or any `requireAuth` route | 401 | 401 |

---

## Pagination

- **Cursor-based** everywhere (never offset). Cursor = opaque base64 of the last
  `_id`. Response: `{ items, nextCursor: string|null, hasMore: boolean }`.
- First page: no `cursor` param. Next page: `?cursor=<nextCursor>`.

---

## Critical edge cases to verify

| Scenario | Expected |
|----------|----------|
| Duplicate email on register | 409 `conflict` |
| Wrong password on login | 401 `invalid_credentials` |
| Suspended user login | 403 `forbidden` |
| Reusing a rotated refresh token | 401 `unauthorized` |
| Invalid body (bad email / short password) | 400 `validation_error` + `field_errors` |
| Non-admin hits `/admin/*` | 403 `forbidden` |
| Photo/voice extract with its flag off | 403 `feature_disabled` |
| Duplicate favourite | 409 `conflict` |
| Suggestions always returns | exactly 3 cards (seed + AI fill via mock) |
| Cuisine pref filter | a user with only `Asian` never gets a `Nigerian` seed card |
| AI recipe cook time | padded +30% on `GET /recipes/:id` |

---

## AI audit trail (provider-agnostic)

Every AI call (vision/whisper/parse/generate) writes an `aiAudit` entry: what
went **in** (input + prompt key/version), what came **out** (raw + parsed),
plus `provider` (`openai`/`mock`), `model`, `latencyMs`, `costEstimateUsd` as
data. Under tests `provider = mock`. Extractions link to their audit entry.

---

## Out of scope (later phases)

- [ ] admin-web frontend (Phase 2) — seeds real recipes via these APIs.
- [ ] consumer web frontend (Phases 3–6).
- [ ] Real OpenAI verification (needs a key; `AI_PROVIDER=openai`). Run 20
      generations + real fridge photos before trusting (PRD build note).
- [ ] PWA install, settings UI, hero image upload UX.
