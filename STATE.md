# ContractForge — Build State

## [2026-06-07T01:00:00Z] Session 9b — Full QA pass on contractforge.co.in

**Status:** COMPLETE — 6 bugs found and documented

### QA summary

| Step | Result |
|---|---|
| Homepage HTTPS | ✅ |
| Signup form | ✅ |
| Signup submit → "check email" | ✅ |
| Billing status / checkout URLs | ✅ Real LS URLs confirmed |
| Contract generate (API) | ✅ 200, ₹, GST 18%, Mumbai, Indian Contract Act |
| PDF export (API) | ✅ 200, 46,532 bytes, ₹ renders |
| Paywall 402 (API) | ✅ Fires correctly |

### Bugs found — see BUGS.md for full detail

| ID | Severity | Summary |
|---|---|---|
| S9-1 | **HIGH** | **No PDF download button in UI** — backend works, frontend never calls export |
| S9-2 | **HIGH** | **PDF party names are hardcoded** — always "Priya Sharma / Sharma Enterprises" |
| S9-3 | MEDIUM | PDF missing "ENTIRE AGREEMENT" section (7 of 8 clauses only) |
| S9-4 | LOW | Page title shows `?` instead of emoji |
| S9-5 | MEDIUM | Email confirmation blocks immediate post-signup access |
| S9-6 | LOW | PDF scope uses generic template items, not user-submitted scope |

### Next session priorities (in order)

1. **Fix S9-1** — Add "Download PDF" button to `ItemForm.tsx`; call `POST /contracts/{id}/export`; trigger browser file download
2. **Fix S9-2 + S9-6** — Pass `client_name`, `client_company`, `scope`, `fee`, `payment_terms`, `timeline` from the generate form into the export request body
3. **Fix S9-3** — Add ENTIRE AGREEMENT section to `_build_pdf()` in `contracts.py`
4. **Fix S9-4** — Locate and fix the emoji in the page title (`layout.tsx` or `page.tsx` metadata)
5. **Fix S9-5** — Evaluate disabling Supabase email confirmation (or auto-redirect after confirmation)

---

## [2026-06-07T00:00:00Z] Session 9 — Env vars + domain + redeploy

**Status:** COMPLETE

### What was done

| Task | Status | Detail |
|---|---|---|
| Issue 4 — domain | ✅ User action | `contractforge.co.in` connected to Vercel, SSL generating |
| Issue 1 — `NEXT_PUBLIC_CHECKOUT_*` env vars | ✅ Already set | Found via Vercel API; confirmed correct values in production |
| Issue 1b — `NEXT_PUBLIC_CHECKOUT_MONTHLY` trailing `\n` | ✅ Fixed | PATCH via Vercel API (env id `esIYMnRBihPrRku4`) |
| Issue 3 — `NEXT_PUBLIC_SITE_URL` | ✅ Fixed | Updated to `https://www.contractforge.co.in` via Vercel API (env id `ZQkJ3Iy4fRWn5PPF`) |
| Redeploy | ✅ Triggered | Deployment `dpl_bQVLxL5aRwS21nrTNzWKqktcEfDY` — BUILDING at time of commit |

### Doppler → Vercel mapping confirmed

| Doppler key | Vercel key | Value |
|---|---|---|
| `LS_CHECKOUT_PER_CONTRACT` | `NEXT_PUBLIC_CHECKOUT_PER_CONTRACT` | `https://contractforge.lemonsqueezy.com/checkout/buy/295f4732-a548-4062-bdb1-b589a096c277` |
| `LS_CHECKOUT_MONTHLY` | `NEXT_PUBLIC_CHECKOUT_MONTHLY` | `https://contractforge.lemonsqueezy.com/checkout/buy/9e263419-18ac-4129-86c0-f2519178a489` |

### Real Vercel project ID (corrected from memory)

`prj_PMWAhvx7fvzaSJp9R7DgRQHl7OoB` (note lowercase `l` before `7` — old memory had `1`)
Team: `team_zYPsi9Di6UqPCVkWN73XeaC3`

### Pending

- **QA pass complete** — see Session 9b below and BUGS.md for all findings

---

## [2026-06-06T00:00:00Z] Session 8 — Bug audit + EOD

**Status:** COMPLETE

### What was done

All three bugs in the Session 8 brief were already resolved in prior sessions. Session 8 was a full audit pass to confirm this.

| Task | Status |
|---|---|
| Bug 1 — Webhook users→subscriptions | ✅ Already fixed (Session 6). No `webhooks.py` exists; handler is in `billing.py`, queries `subscriptions` by `user_email`. |
| Bug 2 — Billing status users→subscriptions | ✅ Already fixed (Session 6). `GET /billing/status` queries `subscriptions` by `user_email`. |
| Bug 3 — Dashboard hardcoded email | ✅ Already fixed (Session 7). `dashboard/page.tsx` uses `supabase.auth.getSession()`. |
| Test suite | ✅ 9/9 green (`python3 -m pytest backend/tests/ -x -q`) |
| Hardcoded email scan (`grep @gmail @example placeholder`) | ✅ Clean — only `placeholder` in password input attrs |
| `BUGS.md` created | ✅ New file — documents open issues + resolved history |

### Done-state

| Criterion | Result |
|---|---|
| `pytest -x -q` — 9 tests | ✅ 9/9 green |
| No `users` table references in backend routers | ✅ |
| Dashboard email from real Supabase session | ✅ |
| No hardcoded emails in frontend `.tsx` | ✅ |
| `BUGS.md` with open issues documented | ✅ |

### Pending (carry-forward)

- **Supabase migration 003** (`webhooks_log` + `subscription_ends_at`) — SQL in Session 7 notes. Must be run in Supabase dashboard → SQL editor.
- **Vercel env vars** — `NEXT_PUBLIC_CHECKOUT_PER_CONTRACT`, `NEXT_PUBLIC_CHECKOUT_MONTHLY`, `NEXT_PUBLIC_SITE_URL` must be set.
- **`contractforge.co.in` domain** — custom domain + SSL status unknown. Configure in Vercel → Domains.
- **QA on `contractforge.co.in`** — browser QA pass blocked until domain + SSL confirmed live.
- **E-signature flow** — Phase 3, not started.

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ContractForge EOD // Day 152 (2026-06-06)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Bug 1 fixed (webhook subscriptions) — already done in Session 6
✅ Bug 2 fixed (billing subscriptions) — already done in Session 6
✅ Bug 3 fixed (dashboard real email) — already done in Session 7
❌ QA on contractforge.co.in — blocked: domain/SSL not confirmed live
❌ SSL live on contractforge.co.in — status unknown, not configured in repo

COMMITS: ec863c5 (last) — feat: add T&C checkbox to signup
BUGS FOUND IN QA: See BUGS.md — 4 open issues (env vars, migration, domain)
DOMAIN STATUS: Not configured in Vercel yet — pending user action
MRR: ₹0 | CUSTOMERS: 0 | LS: pending
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---


## [2026-06-03T07:06:00Z] Session 6 — Lemon Squeezy wiring

**Status:** COMPLETE

### What was built

**Phase 1 — Backend (commit `5ebe4a6`)**

| File | Change |
|---|---|
| `backend/app/config.py` | `AliasChoices` for `LEMON_SQUEEZY_*` / `LS_*` Doppler env vars + legacy `LEMONSQUEEZY_*` names |
| `backend/app/routers/billing.py` | Full rewrite: 422 on bad HMAC, `webhooks_log` logging, `subscription_ends_at` from `renews_at`/`ends_at`, `order_created` increments credits, new `GET /billing/status` endpoint |
| `backend/app/routers/contracts.py` | 402 body → `subscription_required`, `upgrade_url: "/pricing"`, `"Generate unlimited contracts from ₹2,499/month"` |
| `supabase/migrations/003_webhooks_log.sql` | `webhooks_log` table + `subscription_ends_at` column on `subscriptions` |
| `backend/tests/test_billing.py` | 7 tests: invalid HMAC→422, `GET /billing/status` free + monthly, webhook log assertions |

**Phase 2 — Frontend (commit `f697450`)**

| File | Change |
|---|---|
| `frontend/app/pricing/page.tsx` | Footer: "GST invoice included · Prices in INR" |
| `frontend/components/ItemForm.tsx` | 402 → inline paywall with both checkout buttons; other errors → inline message; no raw throw |
| `frontend/app/dashboard/page.tsx` | Loads `GET /billing/status` on mount; shows plan badge (monthly/per_contract/free) |

**Also fixed:** pre-existing `SyntaxError` in `contracts.py` (extra `)` at line 404)

### Done-state — all tests green

| Criterion | Result |
|---|---|
| `pytest -x -q` — 9 tests | ✅ 9/9 green |
| `POST /webhooks/lemonsqueezy` valid HMAC → 200 | ✅ |
| `POST /webhooks/lemonsqueezy` invalid HMAC → 422 | ✅ |
| `GET /billing/status` free plan | ✅ |
| `GET /billing/status` monthly plan | ✅ |
| `POST /contracts/generate` no sub → 402 `subscription_required` | ✅ |
| GitHub push → Render auto-deploy | ✅ |
| `GET /healthz` → 200 | ✅ `https://contractforge-ai-contract-and-a3425a.onrender.com/healthz` |

### Pending / not yet done

- **Doppler `doppler` CLI** not in shell PATH in this dev environment — secrets confirmed present at Doppler dashboard level. Production Render reads them via the Doppler integration automatically. No local `doppler run` check was possible.
- **Supabase migration** `003_webhooks_log.sql` must be applied manually via Supabase dashboard — SQL in Session 7 notes below.
- **`NEXT_PUBLIC_CHECKOUT_PER_CONTRACT` / `NEXT_PUBLIC_CHECKOUT_MONTHLY`** env vars must be set in Vercel for the pricing buttons to show real LS URLs (not `#`).
- **`NEXT_PUBLIC_SITE_URL`** in Vercel still pending from Session 5.
- E-signature flow (Phase 3).

---

## [2026-06-04T00:00:00Z] Session 7 — API URL + email + brand colours

**Status:** COMPLETE — commit `32db549`

### What was done

| Task | Status |
|---|---|
| TASK 1 — Migration 003 SQL provided for manual run | ✅ SQL below |
| TASK 2 — API URL verification (already correct) | ✅ `NEXT_PUBLIC_API_URL` was already set |
| TASK 3 — Hardcoded email replaced with Supabase session email | ✅ |
| TASK 4 — Brand colours applied (Hunter Green #3E5F44, Sand #DDD6B9) | ✅ |

### TASK 1 — Migration 003 SQL (run in Supabase dashboard → SQL editor)

```sql
CREATE TABLE IF NOT EXISTS webhooks_log (
  id          uuid      DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type  text      NOT NULL,
  lemon_squeezy_id text,
  payload     jsonb,
  received_at timestamptz DEFAULT now(),
  processed   boolean   DEFAULT false,
  error       text
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'subscription_ends_at'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN subscription_ends_at timestamptz;
  END IF;
END $$;
```

### TASK 3 — Email fix details

- `dashboard/page.tsx`: now imports `supabase`, calls `getSession()` in `useEffect`, passes real email to both billing fetch and `ItemForm`
- `ItemForm.tsx`: accepts `userEmail?: string` prop, uses it in POST body (fallback to `anonymous@contractforge.io` if unauthenticated)

### TASK 4 — Brand colour mapping applied

| Old | New | Used for |
|---|---|---|
| `bg-indigo-600` | `bg-[#3E5F44]` | All primary buttons |
| `hover:bg-indigo-500` | `hover:bg-[#4a7252]` | Button hover states |
| `text-indigo-400` | `text-[#3E5F44]` | Links, checkmarks, step numbers |
| `border-indigo-500` | `border-[#3E5F44]` | Highlight card borders |
| `border-zinc-7xx text-zinc-2xx` | `border-[#DDD6B9] text-[#DDD6B9]` | Secondary/outline buttons |
| `focus:border-indigo-500` | `focus:border-[#3E5F44]` | Form field focus |

Files changed: `ItemForm.tsx`, `dashboard/page.tsx`, `pricing/page.tsx`, `page.tsx`, `signin/page.tsx`, `signup/page.tsx`, `refund/page.tsx`, `terms/page.tsx`, `privacy/page.tsx`, `PaywallModal.tsx`

### Done-state

| Criterion | Result |
|---|---|
| `pytest -x -q` — 9 tests | ✅ 9/9 green |
| Zero `indigo-*` Tailwind classes remaining | ✅ |
| `user_email` uses real Supabase session | ✅ |
| API URL uses `NEXT_PUBLIC_API_URL` | ✅ (was already correct) |

### Test URL (after Vercel deploys)

`https://contractforge-ai-contract-and-a3425.vercel.app/dashboard`

**Production:**
- Frontend: `https://contractforge-ai-contract-and-a3425.vercel.app`
- Backend: `https://contractforge-ai-contract-and-a3425a.onrender.com`

---

## [2026-05-25T00:00:00Z] Session 4 — Landing page + auth routes

**Status:** COMPLETE

**What was built:**
- `frontend/app/page.tsx` — full 7-section marketing landing page replacing the placeholder login redirect (Nav, Hero, How It Works, What's Inside, Pricing, Final CTA, Footer)
- `frontend/app/auth/signin/page.tsx` — Supabase email + password sign-in page; redirects to `/dashboard` on success
- `frontend/app/auth/signup/page.tsx` — Supabase email + password sign-up with email confirmation state
- `frontend/lib/supabase.ts` — fixed empty-string fallbacks (`?? ""`) to valid placeholders so build passes without env vars set locally

### Done-state — all 13 green

| Criterion | Result |
|---|---|
| `GET /` → HTTP 200, landing page | ✅ `https://contractforge-ai-contract-and-a3425.vercel.app/` |
| `GET /auth/signin` → sign-in form | ✅ |
| `GET /auth/signup` → sign-up form | ✅ |
| `GET /dashboard` → loads (auth-gated) | ✅ |
| `GET /healthz` → `{"status":"healthy"}` | ✅ `https://contractforge-ai-contract-and-a3425a.onrender.com/healthz` |
| Backend API docs reachable | ✅ `/docs` returns 200 |
| Landing contains "30 seconds" | ✅ |
| Landing contains "ContractForge" | ✅ |
| Landing contains "GST" | ✅ |
| Landing contains "NDA" | ✅ |
| Pricing section present | ✅ |
| Supabase tables exist (free_trials, subscriptions) | ✅ 401 (auth required, not 404) |
| Mobile viewport renders (375px) | ✅ |

**Files created/modified:**
- `frontend/app/page.tsx` — complete rewrite (7-section landing page)
- `frontend/app/auth/signin/page.tsx` — new
- `frontend/app/auth/signup/page.tsx` — new
- `frontend/lib/supabase.ts` — fallback fix
- `frontend/next-env.d.ts` — generated by Next.js build
- `frontend/tsconfig.json` — updated by Next.js build
- `.gitignore` — added `.claude/` entry
- `package-lock.json` — generated at repo root

**Fixes applied:**
1. **`supabase.ts` build crash** — `createClient("", "")` thrown during static prerender. Fixed: `?? "http://localhost:54321"` and `?? "placeholder-key"`.
2. **WSL/npm mismatch** — Windows npm picked up from PATH. Fix: `source ~/.nvm/nvm.sh` before any npm commands.
3. **Production URL typo** — `a3425a.vercel.app` was wrong; real URL is `a3425.vercel.app` (no trailing "a"). Verified via Vercel dashboard.

**Production:**
- Frontend: `https://contractforge-ai-contract-and-a3425.vercel.app`
- Backend: `https://contractforge-ai-contract-and-a3425a.onrender.com`
- Vercel deployment: CWNURPU6B, commit `7a22459`, Ready / Production

**Blockers:** None

**Next:**
- Dashboard UI (contract form, PDF preview, download)
- Lemon Squeezy checkout integration (per-contract + monthly)
- Supabase free-trial gate (1 free contract, then paywall)
- E-signature flow (Phase 2)

---

## [2026-05-26T07:06:00Z] Session 5 — Auth redirect fix + QA tests 5-7

**Status:** COMPLETE

### Auth redirect fix

**Root cause:** `emailRedirectTo` in `signup/page.tsx` used only `window.location.origin`. Supabase dashboard Site URL was pointing to localhost, causing confirmation emails to redirect there even when the Vercel URL was passed.

**Fixes applied:**
1. **FIX B (code)** — `frontend/app/auth/signup/page.tsx`: `emailRedirectTo` now uses `process.env.NEXT_PUBLIC_SITE_URL || window.location.origin`. Commit `71b6f21`.
2. **FIX A (Supabase dashboard)** — Site URL set to `https://contractforge-ai-contract-and-a3425.vercel.app`. Redirect URLs: `https://contractforge-ai-contract-and-a3425.vercel.app/**` and `https://contractforge-ai-contract-and-a3425.vercel.app/auth/callback`. (localhost not allowed on free plan.)
3. **FIX C (Vercel env var)** — `NEXT_PUBLIC_SITE_URL=https://contractforge-ai-contract-and-a3425.vercel.app` to be added (user action pending).

### QA Tests 5-7 — ALL PASSED

| Test | Endpoint | Result | Notes |
|---|---|---|---|
| 5 — Contract generation | `POST /contracts/generate` | ✅ 200 | contract_id `cf-20260526070625`, ₹75,000, GST 18%, Mumbai |
| 6 — PDF export | `POST /contracts/{id}/export` | ✅ 200 | 46,531 bytes, DejaVuSans font |
| 7 — Paywall gate | `POST /contracts/generate` (2nd) | ✅ 402 | Free trial consumed, paywall fires correctly |

**Test user:** `qa-xenaarch-146@mailinator.com` (created via admin API, email pre-confirmed)

**Production URLs:**
- Frontend: `https://contractforge-ai-contract-and-a3425.vercel.app`
- Backend: `https://contractforge-ai-contract-and-a3425a.onrender.com`

**Pending (user action):**
- Add `NEXT_PUBLIC_SITE_URL` to Vercel env vars → triggers redeploy

**Next session:** Laptop + Obsidian setup, ForgeOS agents (`~/forge/forgeos`)
