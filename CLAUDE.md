# Memory

## Project
ContractForge — AI freelance contract generator for Indian market (₹, GST, Mumbai defaults, Indian Contract Act).

## URLs
| What | URL |
|------|-----|
| Frontend (prod) | https://www.contractforge.co.in |
| Frontend (Vercel) | https://contractforge-ai-contract-and-a3425a.vercel.app |
| Backend (Render) | https://contractforge-ai-contract-and-a3425a.onrender.com |
| Supabase | vcjicrqfnwdegggkrlpd.supabase.co |

## Stack
- Frontend: Next.js 14 (TypeScript, Tailwind) — deployed on Vercel
- Backend: FastAPI (Python) — deployed on Render, env vars via Doppler
- Auth: Supabase
- Payments: Lemon Squeezy (per-contract `295f4732` + monthly `9e263419`)
- PDF: ReportLab (DejaVuSans for ₹ glyph)

## Brand colours
- Primary: Hunter Green `#3E5F44` / hover `#4a7252`
- Secondary: Sand `#DDD6B9`

## Key files
| File | Role |
|------|------|
| `frontend/components/ItemForm.tsx` | Main contract form + PDF download |
| `frontend/app/dashboard/page.tsx` | Dashboard — loads billing status, passes email to form |
| `backend/app/routers/contracts.py` | Generate + export endpoints |
| `backend/app/routers/billing.py` | Webhook + billing status |
| `backend/tests/test_contracts.py` | 9 backend tests (all green) |
| `frontend/__tests__/items.test.tsx` | 14 frontend tests (all green) |

## Current state (Session 11, 2026-06-07)
- 23 tests total green
- All S9-1/2/3/4/6 + B1 + B2 fixed and pushed to main
- Vercel auto-deploys on push → check contractforge.co.in after each push
- Only open bug: S9-5 (email confirmation UX — low priority, user manages manually)

## Pending
- Production smoke test: verify B1+B2 on live site
- Phase 3: e-signature flow (not started)
