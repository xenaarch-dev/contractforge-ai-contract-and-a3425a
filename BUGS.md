# ContractForge — Bug Log

## Format: severity | location | description | expected | actual

---

### Session 8 (2026-06-06) — QA audit findings

All three bugs listed in the Session 8 brief were already resolved in prior sessions:

| # | Severity | Bug | Fixed in |
|---|---|---|---|
| 1 | CRITICAL | Webhook handler referenced nonexistent `users` table | Session 6 — now in `billing.py`, queries `subscriptions` by `user_email` |
| 2 | CRITICAL | Billing status endpoint referenced nonexistent `users` table | Session 6 — `GET /billing/status` queries `subscriptions` by `user_email` |
| 3 | HIGH | Dashboard showed hardcoded email instead of real session email | Session 7 — `dashboard/page.tsx` uses `supabase.auth.getSession()` |

---

### Open issues (not yet testable in browser)

| # | Severity | Location | Description | Expected | Actual | Status |
|---|---|---|---|---|---|---|
| 4 | HIGH | Vercel env vars | `NEXT_PUBLIC_CHECKOUT_PER_CONTRACT` and `NEXT_PUBLIC_CHECKOUT_MONTHLY` not set | Pricing buttons show real Lemon Squeezy checkout URLs | Buttons use `#` fallback | ✅ **FIXED Session 9** — already set; trailing `\n` on MONTHLY also fixed |
| 5 | MEDIUM | Supabase | Migration `003_webhooks_log.sql` must be applied manually | `webhooks_log` table + `subscription_ends_at` column exist in production | Not confirmed applied | ⏳ **Pending user action** — SQL shown in STATE.md Session 7 |
| 6 | MEDIUM | Vercel env vars | `NEXT_PUBLIC_SITE_URL` not confirmed set | Email confirmation redirect goes to correct URL | May redirect to Vercel default | ✅ **FIXED Session 9** — updated to `https://www.contractforge.co.in` |
| 7 | UNKNOWN | Vercel / domain registrar | `contractforge.co.in` custom domain + SSL status | HTTPS green lock on custom domain | Status unknown — not set up in repo | ✅ **FIXED by user** — domain connected to Vercel, SSL generating |

---

### Session 9 (2026-06-07) — Full QA pass on contractforge.co.in

**QA scope:** land → signup → generate → PDF → paywall
**Method:** browser (Chrome MCP) for frontend flow; WSL curl for backend API (email confirmation blocked browser E2E)

#### QA results

| Step | Result | Notes |
|---|---|---|
| Homepage loads HTTPS | ✅ PASS | `https://www.contractforge.co.in` — green lock, all key copy present |
| Signup form renders | ✅ PASS | Email, password, T&C checkbox, disabled button until agreed |
| Signup submits | ✅ PASS | "Check your email" confirmation state shown correctly |
| Email confirmation UX | ❌ BLOCKED | See Bug S9-1 — new users cannot proceed immediately |
| Contract generation | ✅ PASS (API) | HTTP 200, ₹75,000, GST 18%, Mumbai, Indian Contract Act |
| PDF export | ✅ PASS (API) | HTTP 200, 46,532 bytes, ₹ renders, valid PDF — see Bugs S9-2, S9-3, S9-4 |
| Second contract → paywall | ✅ PASS (API) | HTTP 402, `subscription_required`, real LS checkout URLs |
| Billing status / checkout URLs | ✅ PASS (API) | Real Lemon Squeezy URLs confirmed (Issue 1 fix verified) |

#### Bugs found this session

---

**Bug S9-1 — HIGH — No PDF download button in UI**
- **Location:** `frontend/components/ItemForm.tsx`
- **Expected:** After contract generation, a "Download PDF" button calls `POST /contracts/{id}/export` and triggers file download
- **Actual:** Generated contract shown as `<pre>` text block only. No export button exists. The backend PDF endpoint works perfectly but is completely unreachable from the frontend.
- **Impact:** Users cannot download a PDF — the core paid feature is inaccessible from the UI.

---

**Bug S9-2 — HIGH — PDF party names are hardcoded defaults, never replaced by actual user input**
- **Location:** `backend/app/routers/contracts.py` → `ContractExportRequest` (lines 92–111); `frontend/components/ItemForm.tsx` (no export call)
- **Expected:** PDF shows the client name and company the user entered in the form (e.g. "Acme Technologies Pvt Ltd")
- **Actual:** PDF always shows hardcoded test data: `Priya Sharma`, `Rahul Sharma`, `Sharma Enterprises Pvt Ltd`, `27AABCU9603R1ZX`
- **Root cause:** `ContractExportRequest` defaults are never overridden. Frontend doesn't call the export endpoint at all (see S9-1), and even if it did, it would not pass `client_name`, `freelancer_name`, etc.
- **Impact:** Every PDF is legally useless — it names the wrong parties.

---

**Bug S9-3 — MEDIUM — PDF template missing "ENTIRE AGREEMENT" (miscellaneous) section**
- **Location:** `backend/app/routers/contracts.py` → `_build_pdf()`
- **Expected:** 8 sections in PDF: Parties, Scope, Payment, Governing Law, Termination, Confidentiality, Entire Agreement, Signatures
- **Actual:** 7 sections — "ENTIRE AGREEMENT" clause is absent from the PDF builder. The Claude-generated markdown contract does include it.
- **Impact:** PDF is not legally complete; standard "entire agreement" / merger clause is missing.

---

**Bug S9-4 — LOW — Page title renders `?` instead of an emoji**
- **Location:** `frontend/app/layout.tsx` or `frontend/app/page.tsx` (metadata title)
- **Expected:** `ContractForge ⚡ AI contracts for Indian freelancers` (or similar emoji)
- **Actual:** `ContractForge ? AI contracts for Indian freelancers` — the emoji is not rendering in the browser tab
- **Impact:** Minor — cosmetic, but visible to all users.

---

**Bug S9-5 — MEDIUM — Email confirmation blocks immediate post-signup access**
- **Location:** Supabase project auth settings + `frontend/app/auth/signup/page.tsx`
- **Expected:** After signup, user can immediately try the product (or is auto-redirected after email confirmation)
- **Actual:** User is stuck on "Check your email" with no path forward until they click the confirmation link. Confirmation email redirect goes to `/dashboard` but without a seamless UX prompt.
- **Impact:** Conversion risk — new users on contractforge.co.in cannot immediately try the free trial they signed up for.

---

**Bug S9-6 — LOW — PDF scope of work uses generic template items, not user-submitted scope**
- **Location:** `backend/app/routers/contracts.py` → `ContractExportRequest.deliverables` default
- **Expected:** PDF scope section matches what the user typed in the "Scope of Work" field
- **Actual:** PDF always shows generic deliverables list (5 pages, responsive design, CMS, SEO, performance). Timeline and fee fields correctly use submitted values.
- **Root cause:** Same as S9-2 — `deliverables` field not populated from user input.
- **Impact:** Compounds S9-2; entire PDF parties + scope section is disconnected from user input.

---

### Resolved bugs (historical)

| Session | Severity | Description |
|---|---|---|
| 4 | HIGH | `supabase.ts` build crash — fixed `createClient("","")` with valid placeholders |
| 4 | HIGH | Auth email confirmation redirected to localhost — fixed `emailRedirectTo` + Supabase Site URL |
| 6 | HIGH | `SyntaxError` in `contracts.py` — extra `)` at line 404 |
| 7 | MEDIUM | All `indigo-*` Tailwind classes replaced with brand colours (`#3E5F44`, `#DDD6B9`) |
