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

| # | Severity | Location | Description | Expected | Actual |
|---|---|---|---|---|---|
| 4 | HIGH | Vercel env vars | `NEXT_PUBLIC_CHECKOUT_PER_CONTRACT` and `NEXT_PUBLIC_CHECKOUT_MONTHLY` not set | Pricing buttons show real Lemon Squeezy checkout URLs | Buttons use `#` fallback |
| 5 | MEDIUM | Supabase | Migration `003_webhooks_log.sql` must be applied manually | `webhooks_log` table + `subscription_ends_at` column exist in production | Not confirmed applied |
| 6 | MEDIUM | Vercel env vars | `NEXT_PUBLIC_SITE_URL` not confirmed set | Email confirmation redirect goes to correct URL | May redirect to Vercel default |
| 7 | UNKNOWN | Vercel / domain registrar | `contractforge.co.in` custom domain + SSL status | HTTPS green lock on custom domain | Status unknown — not set up in repo |

---

### Resolved bugs (historical)

| Session | Severity | Description |
|---|---|---|
| 4 | HIGH | `supabase.ts` build crash — fixed `createClient("","")` with valid placeholders |
| 4 | HIGH | Auth email confirmation redirected to localhost — fixed `emailRedirectTo` + Supabase Site URL |
| 6 | HIGH | `SyntaxError` in `contracts.py` — extra `)` at line 404 |
| 7 | MEDIUM | All `indigo-*` Tailwind classes replaced with brand colours (`#3E5F44`, `#DDD6B9`) |
