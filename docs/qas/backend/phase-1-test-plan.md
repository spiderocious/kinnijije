# Backend QA Test Plan — Phase 1 (curl execution against the running server)

**Date:** 2026-06-13
**Branch:** main
**Mode:** **Mode 2 — API Execution.** Real `curl` against a *running* server,
real `mongosh` against the real Mongo, real response/headers/DB-state inspection.
This is QA *using the app as a client would*, not the in-process vitest/supertest
suite (that suite is the developers' unit/integration safety net — necessary, but
it never proves the deployed process works).

**Author:** QA (backend)
**Status:** RUNBOOK — ready to execute command-by-command.

---

## 0. Why curl, not the vitest suite

The existing `vitest run` (27 tests) drives `buildApp()` **in-process** with
`mongodb-memory-server` and `MockOpenAI`. It never:

- binds a real port, so it can't catch CORS scoping, helmet headers, the JSON
  body-limit, compression, or the `trust proxy` setting;
- exercises the **boot path** (`server.ts` → connect to real Mongo → `seedDefaults`);
- touches the **real Mongo** the deployed app uses (data persists across requests
  and across restarts — truncation between cases is *gone*);
- touches the **real OpenAI / R2 file-service** the running server is wired to.

A green vitest run + a passing curl run prove different things. This plan is the
second one.

---

## 1. Target environment (verified live, 2026-06-13)

| Fact | Value | How verified |
|------|-------|--------------|
| Base URL | `http://localhost:9093/api/v1` | `GET /health` → 200 |
| Health | `{data:{status:"ok",service:"main-backend",env:"development"}}` | live |
| Security headers | helmet present (CSP, HSTS, X-Frame-Options=SAMEORIGIN, nosniff) | `curl -D -` |
| CORS | `Access-Control-Allow-Origin: http://localhost:5173`, `credentials:true` | `curl -D -` |
| Request id | `x-request-id` echoed (lowercase) on every response | `curl -D -` |
| 404 fallthrough | `{error:{code:"not_found",message:"Route not found"}}` | live |
| Mongo | `mongodb://127.0.0.1:27017/kinnijije` | `.env` |
| **AI provider** | **`openai` (REAL)** on :9093 | `.env` → confirm at runtime via `/admin/ai-audit` `provider` field |
| File service | `https://go-file-service-production.up.railway.app` (real R2) | `.env` |
| Tools available | `curl`, `jq`, `mongosh`, `uuidgen` | `which` |

> ⚠️ **Provider split (per QA decision: "mock for the suite, real for a smoke").**
> The running :9093 server is **real OpenAI**. So:
> - **Functional suite (§4–§11):** AI-dependent cases here hit **real** OpenAI/R2.
>   To run them deterministically/hermetically, point the suite at a **second
>   instance booted with `AI_PROVIDER=mock`** (see §2.1). Non-AI cases run fine
>   against :9093 directly.
> - **Real-OpenAI smoke (§12):** run against :9093 as-is — that's the whole point
>   of a real instance.
> Every test row tags whether it is **[mock-ok]** (deterministic, run anywhere) or
> **[real-AI]** (behaviour depends on the live model).

---

## 2. Setup

### 2.1 (optional) a deterministic mock instance for the functional suite
If you want the AI-dependent functional cases hermetic, boot a second server with
mock AI on a spare port and point `BASE` at it:
```bash
# from repo root
PORT=9192 AI_PROVIDER=mock pnpm -F @kinnijije/main-backend dev   # http://localhost:9192
```
Otherwise leave `BASE` on :9093 and accept that AI cases exercise the real model.

### 2.2 shell variables (paste once per session)
```bash
export BASE=http://localhost:9093/api/v1      # or :9192 for the mock instance
export MONGO="mongodb://127.0.0.1:27017/kinnijije"
alias m='mongosh "$MONGO" --quiet --eval'

# tiny helpers
jqd(){ jq -C .; }                              # pretty
code(){ jq -r '.error.code // "OK"'; }         # error code or OK
status(){ curl -s -o /dev/null -w "%{http_code}" "$@"; }   # status only
```

### 2.3 bootstrap test identities
The server seeds flags+prompts on boot. There is **no seeded user** — create them.

```bash
# --- a normal user ---
U_EMAIL="qa_user_$(date +%s)@test.test"
U=$(curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' \
  -d "{\"email\":\"$U_EMAIL\",\"name\":\"QA User\",\"password\":\"Password123!\"}")
echo "$U" | jqd
U_AT=$(echo "$U" | jq -r .data.tokens.access_token)
U_RT=$(echo "$U" | jq -r .data.tokens.refresh_token)
U_ID=$(echo "$U" | jq -r .data.user.id)

# --- an admin: register, then flip role in Mongo (role can't be set via API) ---
A_EMAIL="qa_admin_$(date +%s)@test.test"
curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' \
  -d "{\"email\":\"$A_EMAIL\",\"name\":\"QA Admin\",\"password\":\"Password123!\"}" >/dev/null
m "db.users.updateOne({email:'$A_EMAIL'},{\$set:{role:'admin'}})"
A=$(curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' \
  -d "{\"email\":\"$A_EMAIL\",\"password\":\"Password123!\"}")
A_AT=$(echo "$A" | jq -r .data.tokens.access_token)
A_ID=$(echo "$A" | jq -r .data.user.id)
echo "user=$U_ID  admin=$A_ID"
```

> Every case below assumes `$BASE`, `$U_AT`, `$A_AT` are set. Record the literal
> JSON output and DB query result for each in the report — that *is* the evidence.

---

## 3. Pre-flight cross-cutting checks (run first, once)

| # | Check | Command | Pass criteria |
|---|-------|---------|---------------|
| X-01 | Health up | `curl -s $BASE/health \| jqd` | 200, `status:"ok"` |
| X-02 | Security headers | `curl -s -D - -o /dev/null $BASE/health \| grep -iE 'content-security\|x-frame\|strict-transport\|x-content-type'` | all present |
| X-03 | CORS scoped (not `*`) | `curl -s -D - -o /dev/null $BASE/health \| grep -i access-control-allow-origin` | `http://localhost:5173`, not `*` |
| X-04 | request-id echoed | `curl -s -D - -o /dev/null $BASE/health \| grep -i x-request-id` | present |
| X-05 | 404 envelope | `curl -s $BASE/nope \| jqd` | `{error:{code:"not_found"}}` |
| X-06 | Body-limit enforced | `curl -s -o /dev/null -w '%{http_code}\n' -X POST $BASE/auth/register -H 'Content-Type: application/json' --data-binary @<(head -c 2000000 /dev/zero \| tr '\0' 'a')` | 413 (1mb limit) |
| X-07 | Wrong content-type on JSON route | `curl -s -X POST $BASE/auth/login -H 'Content-Type: text/plain' -d 'x' \| code` | `validation_error` (empty parsed body) |
| X-08 | Method not allowed | `status -X DELETE $BASE/health` | 404 (no route) |

---

## 4. Auth & account — `/auth/*`, `/me*`

> Tag: all **[mock-ok]** (no AI). Safe to run against :9093 directly.

### TC-AUTH-01 — register happy + no secret leak
```bash
E="reg_$(date +%s)@test.test"
R=$(curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' \
  -d "{\"email\":\"$E\",\"name\":\"Ade\",\"password\":\"Password123!\"}")
echo "$R" | jqd
```
**Expect:** 201; `data.user.role=="user"`; `data.user.prefs.cuisines` contains `"Nigerian"`;
tokens present; **`.data.user` has NO `passwordHash`/`tokenVersion`**.
**Assert leak:** `echo "$R" | jq '.data.user | has("passwordHash")'` → `false`.
**DB ground truth:** `m "db.users.findOne({email:'$E'},{passwordHash:1,role:1})"` →
`passwordHash` is an argon2 hash (`$argon2…`), `role:"user"`.

### TC-AUTH-02 — duplicate email → 409
```bash
curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' \
  -d "{\"email\":\"$E\",\"name\":\"X\",\"password\":\"Password123!\"}" | code
```
**Expect:** body `conflict`; `status … ` → 409.
**DB:** `m "db.users.countDocuments({email:'$E'})"` → `1` (no dup row).

### TC-AUTH-03 — validation (bad email / short pw / empty name) → 400 + field_errors
```bash
curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"not-an-email","name":"","password":"short"}' | jqd
```
**Expect:** 400 `validation_error`; `error.field_errors` has keys `email`, `name`, `password`.

### TC-AUTH-04 — signups flag OFF blocks register → 403
```bash
curl -s -X PATCH $BASE/admin/feature-flags/signups -H "Authorization: Bearer $A_AT" \
  -H 'Content-Type: application/json' -d '{"enabled":false}' | jqd
curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"blocked@test.test","name":"N","password":"Password123!"}' | code
# restore
curl -s -X PATCH $BASE/admin/feature-flags/signups -H "Authorization: Bearer $A_AT" \
  -H 'Content-Type: application/json' -d '{"enabled":true}' >/dev/null
```
**Expect:** `feature_disabled` (403). **Restore the flag after** (real DB persists!).

### TC-AUTH-05 — login correct / wrong / unknown
```bash
status -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$E\",\"password\":\"Password123!\"}"   # 200
curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$E\",\"password\":\"wrongpass1\"}" | code  # invalid_credentials (401)
curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d '{"email":"ghost@test.test","password":"Password123!"}' | code  # invalid_credentials — NOT not_found (no user enumeration)
```

### TC-AUTH-06 — refresh rotates; old RT dies (reuse)
```bash
NR=$(curl -s -X POST $BASE/auth/refresh -H 'Content-Type: application/json' -d "{\"refresh_token\":\"$U_RT\"}")
echo "$NR" | jqd                                   # 200, new access+refresh
curl -s -X POST $BASE/auth/refresh -H 'Content-Type: application/json' -d "{\"refresh_token\":\"$U_RT\"}" | code  # unauthorized (401) — old rotated
```
**DB:** `m "db.refreshtokens.find({userId:ObjectId('$U_ID')}).toArray()"` — old token row revoked/removed, new present.

### TC-AUTH-07 — logout then reuse → 401
```bash
FRESH=$(curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d "{\"email\":\"$E\",\"password\":\"Password123!\"}")
RT2=$(echo "$FRESH" | jq -r .data.tokens.refresh_token)
status -X POST $BASE/auth/logout -H 'Content-Type: application/json' -d "{\"refresh_token\":\"$RT2\"}"   # 204
curl -s -X POST $BASE/auth/refresh -H 'Content-Type: application/json' -d "{\"refresh_token\":\"$RT2\"}" | code  # unauthorized
```

### TC-AUTH-08 — GET /me: no token / bad header / expired / valid
```bash
status $BASE/me                                                   # 401
curl -s $BASE/me -H 'Authorization: token-no-bearer' | code      # unauthorized
curl -s $BASE/me -H "Authorization: Bearer $U_AT" | jqd          # 200, {user}
# expired: mint a token signed with the server's secret but exp in the past:
EXP=$(node -e "const j=require('/Users/feranmi/codebases/2026/kinnijije/apps/main-backend/node_modules/jsonwebtoken');console.log(j.sign({sub:'$U_ID',role:'user'},process.env.JWT_ACCESS_SECRET,{expiresIn:-10}))" 2>/dev/null)
[ -n "$EXP" ] && curl -s $BASE/me -H "Authorization: Bearer $EXP" | code   # unauthorized
```
> If `JWT_ACCESS_SECRET` isn't in your shell, grab it from `.env`. If minting is
> awkward, skip the expired sub-case and note it as covered by the vitest suite.

### TC-AUTH-09 — PATCH /me/prefs happy + bad enum
```bash
curl -s -X PATCH $BASE/me/prefs -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' \
  -d '{"cuisines":["Asian"],"difficultyFloor":"easy","measurement":"imperial"}' | jqd   # 200, prefs updated
curl -s -X PATCH $BASE/me/prefs -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' \
  -d '{"measurement":"furlongs"}' | code                                                # validation_error
```

### TC-AUTH-10 — DELETE /me revokes & 404s after
```bash
DU=$(curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' -d '{"email":"del_'"$(date +%s)"'@test.test","name":"D","password":"Password123!"}')
DAT=$(echo "$DU" | jq -r .data.tokens.access_token); DRT=$(echo "$DU" | jq -r .data.tokens.refresh_token)
status -X DELETE $BASE/me -H "Authorization: Bearer $DAT"                 # 204
status $BASE/me -H "Authorization: Bearer $DAT"                           # 404
curl -s -X POST $BASE/auth/refresh -H 'Content-Type: application/json' -d "{\"refresh_token\":\"$DRT\"}" | code  # unauthorized
```

---

## 5. Ingredients & input — `/ingredients/*`

### TC-ING-01 — suggest with/without q, unauth  **[mock-ok]**
```bash
curl -s "$BASE/ingredients/suggest?q=ric" -H "Authorization: Bearer $U_AT" | jqd   # 200 {items:[…]} relevant
curl -s "$BASE/ingredients/suggest"       -H "Authorization: Bearer $U_AT" | jqd   # 200, array (document head behaviour)
status "$BASE/ingredients/suggest?q=ric"                                            # 401 (no token)
```

### TC-ING-02 — recent reflects a prior suggestions call  **[mock-ok]**
```bash
curl -s "$BASE/ingredients/recent" -H "Authorization: Bearer $U_AT" | jqd   # before
# (run a /suggestions call from §6 first, then re-check)
```

### TC-ING-03 — extract/photo happy  **[real-AI on :9093]**
Needs a real R2 `key`. Upload a fridge photo via the file-service presign flow,
or reuse a known key. Then:
```bash
curl -s -X POST $BASE/ingredients/extract/photo -H "Authorization: Bearer $U_AT" \
  -H 'Content-Type: application/json' -d '{"keys":["<real-r2-key>.jpg"]}' | jqd
```
**Expect:** 200 `{extractionId, ingredients:[…], inputUrls:[…]}`.
**DB ground truth:**
```bash
m "db.extractions.find({userId:ObjectId('$U_ID')}).sort({_id:-1}).limit(1).toArray()"
# kind:'photo', inputKeys:[…], extractedIngredients:[…], aiAuditId set
m "db.aiaudits.find({}).sort({_id:-1}).limit(1).pretty()"   # provider:'openai', kind:'vision', cost>0
```
> This is also a **real-OpenAI smoke** data point (§12).

### TC-ING-04 — extract/photo validation & gating  **[mock-ok]**
```bash
curl -s -X POST $BASE/ingredients/extract/photo -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{"keys":[]}' | code            # validation_error
curl -s -X POST $BASE/ingredients/extract/photo -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{"keys":["a","b","c","d","e","f"]}' | code   # validation_error (max 5)
# flag off:
curl -s -X PATCH $BASE/admin/feature-flags/input.photo -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"enabled":false}' >/dev/null
curl -s -X POST $BASE/ingredients/extract/photo -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{"keys":["k.jpg"]}' | code        # feature_disabled (403)
curl -s -X PATCH $BASE/admin/feature-flags/input.photo -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"enabled":true}' >/dev/null   # RESTORE
```

### TC-ING-05 — extract/voice happy + validation + gating  **[real-AI / mock-ok]**
```bash
curl -s -X POST $BASE/ingredients/extract/voice -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{"key":"<real-audio-key>.m4a"}' | jqd  # 200 {transcript, ingredients, inputUrl}
curl -s -X POST $BASE/ingredients/extract/voice -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{}' | code   # validation_error
# voice flag-off identical pattern to ING-04 (key input.voice)
```
**Note (SA-04):** voice *parse* failure returns `ingredients:[]` (no error); photo
failure throws `extraction_failed` (502). Record both degraded behaviours.

---

## 6. Suggestions & recipes — `/suggestions`, `/recipes/:id`

> Seed a published recipe first (admin), then exercise as the user.

### Seed (admin) — used by §6–§8
```bash
RID=$(curl -s -X POST $BASE/admin/recipes -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{
  "name":"Jollof Rice","source":"seed","cuisines":["Nigerian"],"difficulty":"medium",
  "cookTimeMinutes":45,"serves":4,
  "ingredients":[{"name":"rice"},{"name":"tomatoes"},{"name":"pepper"},{"name":"onion"}],
  "steps":[{"heading":"Cook","description":"Cook everything.","estMinutes":45}]}' | jq -r .data.recipe.id)
curl -s -X POST $BASE/admin/recipes/$RID/publish -H "Authorization: Bearer $A_AT" >/dev/null
echo "seeded $RID"
```

### TC-SUG-01 — exactly 3 cards, schema-shaped  **[real-AI if AI-fill triggers]**
```bash
S=$(curl -s -X POST $BASE/suggestions -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' \
  -d '{"ingredients":["rice","tomatoes","pepper","onion","chicken"]}')
echo "$S" | jq '.data.suggestions | length'           # 3
echo "$S" | jq '.data.suggestions[] | {name,source,have:.match.have,total:.match.total,needCount:.match.needCount}'
```
**Expect:** length 3; jollof present with `source:"seed"`, `match.have>=3`; each card has
`recipeId,name,source,heroImageUrl,difficulty,cookTimeMinutes,match,haveIngredients,needIngredients`.

### TC-SUG-02 — excludeRecipeIds honoured  **[mock-ok]**
```bash
curl -s -X POST $BASE/suggestions -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' \
  -d "{\"ingredients\":[\"rice\",\"tomatoes\",\"pepper\"],\"excludeRecipeIds\":[\"$RID\"]}" \
  | jq '.data.suggestions[].recipeId' | grep -q "$RID" && echo "FAIL: excluded id present" || echo "PASS"
```

### TC-SUG-03 — cuisine hard filter  **[mock-ok]**
```bash
curl -s -X PATCH $BASE/me/prefs -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{"cuisines":["Asian"]}' >/dev/null
curl -s -X POST $BASE/suggestions -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{"ingredients":["rice","tomatoes","pepper"]}' \
  | jq '[.data.suggestions[] | select(.source=="seed" and .name=="Jollof Rice")] | length'   # 0
curl -s -X PATCH $BASE/me/prefs -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{"cuisines":["Nigerian","West African"]}' >/dev/null  # restore
```

### TC-SUG-04 — validation & auth  **[mock-ok]**
```bash
curl -s -X POST $BASE/suggestions -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{"ingredients":[]}' | code   # validation_error
curl -s -X POST $BASE/suggestions -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{}' | code                  # validation_error
status -X POST $BASE/suggestions -H 'Content-Type: application/json' -d '{"ingredients":["rice"]}'                                     # 401
```

### TC-REC-01 — get recipe / 404 / malformed-id (no 500)  **[mock-ok]**
```bash
curl -s $BASE/recipes/$RID -H "Authorization: Bearer $U_AT" | jq '.data.recipe.id'   # == RID
status $BASE/recipes/0000000000000000deadbeef -H "Authorization: Bearer $U_AT"       # 404
status $BASE/recipes/not-an-objectid       -H "Authorization: Bearer $U_AT"          # 404, NOT 500
status $BASE/recipes/$RID                                                              # 401 (no token)
```

### TC-REC-02 — SA-02: is a DRAFT readable by a normal user?  **[mock-ok]**  ⚠️
```bash
DRID=$(curl -s -X POST $BASE/admin/recipes -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{
  "name":"Secret Draft","difficulty":"easy","cookTimeMinutes":10,"cuisines":["Nigerian"],
  "ingredients":[{"name":"salt"}],"steps":[{"heading":"x","description":"y"}]}' | jq -r .data.recipe.id)
status $BASE/recipes/$DRID -H "Authorization: Bearer $U_AT"     # observe: 200 means drafts leak to users → BUG candidate
```
**Record actual.** If 200 → file as P2 (draft visibility). If 404 → behaviour is gated.

### TC-REC-03 — SA-03 / +30% padding: AI vs seed cook time  **[real-AI]**
```bash
# generate an AI draft, publish it, read it back
GID=$(curl -s -X POST $BASE/admin/recipes/generate -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' \
  -d '{"ingredients":["rice","pepper"],"cuisines":["Nigerian"],"difficultyFloor":"anything"}' | jq -r .data.recipe.id)
m "db.recipes.findOne({_id:ObjectId('$GID')},{source:1,status:1,cookTimeMinutes:1})"   # raw stored base time
curl -s -X POST $BASE/admin/recipes/$GID/publish -H "Authorization: Bearer $A_AT" >/dev/null
curl -s $BASE/recipes/$GID -H "Authorization: Bearer $U_AT" | jq '.data.recipe | {source,cookTimeMinutes}'  # should be round(base*1.3)
# seed (RID) is unpadded:
m "db.recipes.findOne({_id:ObjectId('$RID')},{cookTimeMinutes:1})"
curl -s $BASE/recipes/$RID -H "Authorization: Bearer $U_AT" | jq '.data.recipe.cookTimeMinutes'   # == stored (45)
```
**Assert:** AI read `cookTimeMinutes == Math.round(stored*1.3)`; seed read == stored.

---

## 7. Favourites & feedback

### TC-FAV-01 — save / dup / list / unsave  **[mock-ok]**
```bash
status -X POST $BASE/favourites -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d "{\"recipeId\":\"$RID\"}"   # 201
curl -s -X POST $BASE/favourites -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d "{\"recipeId\":\"$RID\"}" | code   # conflict (409)
curl -s $BASE/favourites -H "Authorization: Bearer $U_AT" | jq '{n:(.data.items|length),nextCursor,hasMore}'   # n>=1, hasMore:false, nextCursor:null
status -X DELETE $BASE/favourites/$RID -H "Authorization: Bearer $U_AT"   # 204
curl -s $BASE/favourites -H "Authorization: Bearer $U_AT" | jq '.data.items | length'   # 0 (for this recipe)
```
**DB:** `m "db.favourites.countDocuments({userId:ObjectId('$U_ID'),recipeId:ObjectId('$RID')})"` → 0 after delete.

### TC-FAV-02 — favourite nonexistent recipe → 404  **[mock-ok]**
```bash
curl -s -X POST $BASE/favourites -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d '{"recipeId":"0000000000000000deadbeef"}' | code   # not_found
```

### TC-FAV-03 — snapshot frozen (AI padded at save)  **[real-AI]**
Favourite the AI recipe `$GID`, then inspect the stored snapshot:
```bash
curl -s -X POST $BASE/favourites -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d "{\"recipeId\":\"$GID\"}" >/dev/null
m "db.favourites.findOne({userId:ObjectId('$U_ID'),recipeId:ObjectId('$GID')},{'recipe.cookTimeMinutes':1})"   # padded value frozen
```

### TC-FAV-04 — cursor pagination across pages  **[mock-ok]**
Seed > one page of favourites (publish N recipes, favourite each), then:
```bash
P1=$(curl -s "$BASE/favourites" -H "Authorization: Bearer $U_AT")
echo "$P1" | jq '{hasMore,nextCursor}'                     # hasMore:true, nextCursor set
NC=$(echo "$P1" | jq -r .data.nextCursor)
curl -s "$BASE/favourites?cursor=$NC" -H "Authorization: Bearer $U_AT" | jq '.data.items[].id'   # disjoint from P1, no gaps
```

### TC-FAV-05 — cross-user isolation  **[mock-ok]**
Register user B; B's `GET /favourites` must not contain A's favourites.

### TC-FB-01..05 — feedback  **[mock-ok]**
```bash
curl -s -X POST $BASE/feedback -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d "{\"recipeId\":\"$RID\",\"target\":{\"kind\":\"step\",\"index\":0},\"note\":\"oil floats\"}" | jq '.data.feedback.status'   # "open"
curl -s -X POST $BASE/feedback -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d "{\"recipeId\":\"$RID\",\"target\":{\"kind\":\"ingredient\",\"index\":1}}" | jq '.data.feedback.status'   # "open"
curl -s -X POST $BASE/feedback -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d "{\"recipeId\":\"$RID\",\"target\":{\"kind\":\"sauce\",\"index\":0}}" | code   # validation_error
curl -s -X POST $BASE/feedback -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d "{\"recipeId\":\"$RID\",\"target\":{\"kind\":\"step\",\"index\":-1}}" | code   # validation_error
curl -s -X POST $BASE/feedback -H "Authorization: Bearer $U_AT" -H 'Content-Type: application/json' -d "{\"recipeId\":\"0000000000000000deadbeef\",\"target\":{\"kind\":\"step\",\"index\":0}}" | code   # not_found
```

---

## 8. Admin — `/admin/*` (RBAC + CRUD + state machines)

### TC-ADM-RBAC — gate on every verb  **[mock-ok]**
```bash
for p in metrics users recipes ai-audit prompts feature-flags feedback; do
  echo -n "$p unauth="; status $BASE/admin/$p
  echo -n "  user="; status $BASE/admin/$p -H "Authorization: Bearer $U_AT"
  echo -n "  admin="; status $BASE/admin/$p -H "Authorization: Bearer $A_AT"; echo
done
# expect: unauth=401, user=403, admin=200 for each
```

### TC-ADM-01 — metrics shape  **[mock-ok]**
```bash
curl -s $BASE/admin/metrics -H "Authorization: Bearer $A_AT" | jqd
```
**Expect:** `{users:N, recipes:{published,draft}, ai:{calls,costUsd}}`.

### TC-ADM-02 — users list + search + detail + 404  **[mock-ok]**
```bash
curl -s "$BASE/admin/users" -H "Authorization: Bearer $A_AT" | jq '{n:(.data.items|length),hasMore}'
curl -s "$BASE/admin/users?q=$U_EMAIL" -H "Authorization: Bearer $A_AT" | jq '.data.items[].email'
curl -s $BASE/admin/users/$U_ID -H "Authorization: Bearer $A_AT" | jq '{user:.data.user.email, favs:(.data.favourites|length), extr:(.data.extractions|length)}'
status $BASE/admin/users/0000000000000000deadbeef -H "Authorization: Bearer $A_AT"   # 404
```
**Secret check:** `curl -s "$BASE/admin/users" -H "Authorization: Bearer $A_AT" | jq '.data.items[0] | has("passwordHash")'` → `false`.

### TC-ADM-03 — suspend blocks login; promote enables admin  **[mock-ok]**
```bash
VIC=$(curl -s -X POST $BASE/auth/register -H 'Content-Type: application/json' -d '{"email":"vic_'"$(date +%s)"'@test.test","name":"V","password":"Password123!"}')
VID=$(echo "$VIC" | jq -r .data.user.id)
curl -s -X PATCH $BASE/admin/users/$VID -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"status":"suspended"}' >/dev/null
curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' -d '{"email":"'"$(echo "$VIC"|jq -r .data.user.email)"'","password":"Password123!"}' | code   # forbidden
curl -s -X PATCH $BASE/admin/users/$VID -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"status":"frozen"}' | code   # validation_error
```

### TC-ADM-04 — recipe lifecycle  **[mock-ok]**
create (draft default) → publish → unpublish → edit → hero → delete. Assert each
status + that publish puts it in `?status=published` and unpublish removes it.
```bash
NRID=$(curl -s -X POST $BASE/admin/recipes -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"name":"Egusi","difficulty":"medium","cookTimeMinutes":50,"cuisines":["Nigerian"],"ingredients":[{"name":"egusi"}],"steps":[{"heading":"Boil","description":"Boil"}]}' | jq -r .data.recipe.id)
curl -s $BASE/admin/recipes/$NRID -H "Authorization: Bearer $A_AT" >/dev/null  # (no GET-one admin route? then read via list/recipes/:id)
curl -s -X POST $BASE/admin/recipes/$NRID/publish   -H "Authorization: Bearer $A_AT" | jq '.data.recipe.status'    # published
curl -s -X POST $BASE/admin/recipes/$NRID/unpublish -H "Authorization: Bearer $A_AT" | jq '.data.recipe.status'    # draft
curl -s -X PATCH $BASE/admin/recipes/$NRID -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"serves":8}' | jq '.data.recipe.serves'   # 8
curl -s -X POST $BASE/admin/recipes/$NRID/hero -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"key":"hero.jpg","kind":"photo"}' | jq '.data.recipe.heroImageKind'   # photo
status -X DELETE $BASE/admin/recipes/$NRID -H "Authorization: Bearer $A_AT"   # 204
status -X POST $BASE/admin/recipes/$NRID/publish -H "Authorization: Bearer $A_AT"   # 404 (gone)
# validation:
curl -s -X POST $BASE/admin/recipes -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"name":"NoDifficulty"}' | code   # validation_error
```

### TC-ADM-05 — generate → DRAFT + audit (SA-03)  **[real-AI]**
```bash
G=$(curl -s -X POST $BASE/admin/recipes/generate -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"ingredients":["rice","pepper"],"cuisines":["Nigerian"],"difficultyFloor":"anything"}')
echo "$G" | jq '.data.recipe | {source,status}'   # source:"ai", status:"draft"  ← contrast with consumer auto-publish
curl -s "$BASE/admin/ai-audit?kind=generate" -H "Authorization: Bearer $A_AT" | jq '.data.items[0] | {provider,kind,model,costEstimateUsd,status}'   # provider:"openai", kind:"generate"
AID=$(curl -s "$BASE/admin/ai-audit" -H "Authorization: Bearer $A_AT" | jq -r .data.items[0].id)
curl -s $BASE/admin/ai-audit/$AID -H "Authorization: Bearer $A_AT" | jq '.data.entry | {provider,model,hasInput:(.input!=null),hasParsed:(.parsedOutput!=null)}'
status $BASE/admin/ai-audit/0000000000000000deadbeef -H "Authorization: Bearer $A_AT"   # 404
```

### TC-ADM-06 — prompts versioning  **[mock-ok]**
```bash
curl -s $BASE/admin/prompts -H "Authorization: Bearer $A_AT" | jq '.data.prompts | length'
curl -s -X PUT $BASE/admin/prompts/generate -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"template":"New generate template","notes":"tuned"}' | jq '.data.prompt | {version,active}'   # version>=2, active:true
curl -s $BASE/admin/prompts/generate -H "Authorization: Bearer $A_AT" | jq '[.data.versions[]|select(.active)] | length'   # exactly 1 active
curl -s $BASE/admin/prompts/bogus -H "Authorization: Bearer $A_AT" | code   # validation_error
```

### TC-ADM-07 — feature flags  **[mock-ok]**
```bash
curl -s $BASE/admin/feature-flags -H "Authorization: Bearer $A_AT" | jq '.data.flags[].key'   # input.photo,input.voice,ai.generation,signups
curl -s -X PATCH $BASE/admin/feature-flags/nope -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"enabled":false}' | code   # not_found
# toggle-gates-route already covered by ING-04
```

### TC-ADM-08 — feedback review queue  **[mock-ok]**
```bash
FID=$(curl -s "$BASE/admin/feedback?status=open" -H "Authorization: Bearer $A_AT" | jq -r .data.items[0].id)
curl -s -X PATCH $BASE/admin/feedback/$FID -H "Authorization: Bearer $A_AT" -H 'Content-Type: application/json' -d '{"status":"reviewed"}' | jq '.data.feedback.status'   # reviewed
status -X PATCH $BASE/admin/feedback/0000000000000000deadbeef -H "Authorization: Bearer $A_AT" -d '{"status":"reviewed"}' -H 'Content-Type: application/json'   # 404
```

---

## 9. Cross-cutting sweep over real responses

| # | Check | How |
|---|-------|-----|
| C-01 | IDs are raw 24-hex, **no prefix** | `echo $U_ID \| grep -Eq '^[a-f0-9]{24}$' && echo PASS` |
| C-02 | Timestamps ISO-8601 | `curl -s $BASE/me -H "Authorization: Bearer $U_AT" \| jq -r .data.user.createdAt` matches `…Z`/offset |
| C-03 | No secret leak anywhere | grep responses for `passwordHash`/`tokenVersion` → none |
| C-04 | Error envelope consistent | every error body is `{error:{code,message}}`, `code` in closed set |
| C-05 | Pagination shape | every list = `{items,nextCursor,hasMore}`, never `page`/`offset` |

---

## 10. The PRD "golden path" (one continuous real run)

Admin seeds+publishes a recipe → user registers → sets prefs → `POST /suggestions`
returns it → saves favourite → flags a step → admin sees the feedback **and** an AI
audit entry. Run §2.3 → §6 seed → SUG-01 → FAV-01 → FB-01 → ADM-08, capturing each
response. This is the Phase-1 "Done when" acceptance line — it must pass end-to-end
against :9093.

---

## 11. Data hygiene (real DB persists!)
Unlike the vitest suite, **nothing truncates between cases.** After a run:
```bash
m "db.users.deleteMany({email:/@test\\.test$/})"
m "db.recipes.deleteMany({name:{\$in:['Jollof Rice','Egusi','Secret Draft']}})"
# (or accept accumulation in the dev DB; never run destructive cleanup against a shared/staging DB)
```
Always **restore toggled feature flags** (signups, input.photo, input.voice) to ON
at the end — they persist and will silently break later runs/the frontend.

---

## 12. Real-OpenAI smoke (separate manual pass, :9093 as-is)
Per the PRD build note + QA decision. Run against the real instance:
- **20 generations:** loop `POST /admin/recipes/generate` with varied ingredient
  sets; eyeball each draft for sane Nigerian-first names, plausible steps,
  `approximate` flags on AI quantities; confirm every call wrote an `aiAudit`
  with `provider:"openai"`, non-zero `costEstimateUsd`, `latencyMs`.
- **Real fridge photos:** upload 5–10 actual photos via the R2 presign flow →
  `POST /ingredients/extract/photo` → judge extraction quality. If mixed, the
  remediation is to flip `input.photo` OFF (admin) and default to Type — no code
  change (this is the flag's whole purpose).
- **Real voice:** record 3–5 clips → `extract/voice` → check transcript + parsed
  chips.
Record qualitative pass/fail + cost totals. **This is the gate before trusting
photo input in production.**

---

## 13. Reporting
For each TC record: command run, **literal** response JSON, status code, DB query
result where applicable, PASS/FAIL, and any divergence. File failures as bugs in
the handoff bug list (severity, repro, expected vs actual). Re-verify after fix.

### Severity guide
- **P0:** auth bypass, secret leak, data loss, 500 on a happy path.
- **P1:** wrong status/contract on a core flow (suggestions, favourites, admin CRUD).
- **P2:** SA-02 draft visibility if unintended; degraded-path inconsistencies.
- **P3:** doc/shape nits.

---

## 14. Source-audit divergences to confirm during execution
| ID | Watch for | Where it shows up |
|----|-----------|-------------------|
| SA-02 | draft recipe readable by a normal user via `GET /recipes/:id` | TC-REC-02 |
| SA-03 | consumer AI-fill auto-publishes, admin generate stays draft | TC-SUG-01 vs TC-ADM-05 |
| SA-04 | voice parse-fail returns `[]`, photo fail throws 502 | TC-ING-05 |
| SA-05 | provider on :9093 is `openai` not `mock` — AI cases are non-deterministic | TC-ADM-05 audit `provider` |

## 15. Out of scope
- Idempotency / rate-limit / ledger — **not implemented in this backend** (no such
  middleware/store/money fields exist); nothing to curl.
- admin-web / consumer-web frontends (Phases 2–6).
- Load / true-concurrency (needs a load tool + isolated DB).
- Email verification / magic link — not in product.
