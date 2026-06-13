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

## Seed accounts — how to log in & how to get an admin

⚠️ **There is no seeded admin and no API endpoint that creates one.**
`POST /auth/register` always sets `role: "user"` (you cannot self-promote), and
`PATCH /admin/users/:id {role:"admin"}` itself needs an admin token. So the
**first** admin must be made with a direct Mongo write. There is no admin-seeding
code in `bootstrap.ts` (it seeds flags + prompts only).

### Make a user (normal account)
```bash
curl -s -X POST http://localhost:9093/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@test.test","name":"User","password":"Password123!"}'
# → 201, returns { user, tokens }. Use tokens.access_token as Bearer.
```

### Make an admin (register → flip role in Mongo → log in)
```bash
# 1. register a normal user
curl -s -X POST http://localhost:9093/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.test","name":"Admin","password":"Password123!"}'

# 2. promote it directly in Mongo (the DB the server uses)
mongosh "mongodb://127.0.0.1:27017/kinnijije" --quiet \
  --eval "db.users.updateOne({email:'admin@test.test'},{\$set:{role:'admin'}})"

# 3. log in — the role is baked into the JWT AT LOGIN, so log in AFTER the flip
curl -s -X POST http://localhost:9093/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.test","password":"Password123!"}' \
  | jq -r .data.tokens.access_token
# → use this token as `Authorization: Bearer <token>` on every /admin/* route.
```
> Order matters: if you log in *before* the flip, the token carries `role:user`
> and `/admin/*` returns 403. Re-login after promoting.

`createAdmin()` in `apps/main-backend/test/helpers.ts` does the same thing for the
vitest suite (insert user with `role:'admin'`, then log in).

| Field | Value |
|-------|-------|
| Mongo URI (dev) | `mongodb://127.0.0.1:27017/kinnijije` |
| Test user password | `Password123!` |
| Test admin password | `Password123!` |

> An `admin@kinnijije.app` row exists in the dev DB but its password is **not
> recorded anywhere** — don't rely on it; make your own admin with the steps above.

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
