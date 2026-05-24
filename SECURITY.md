# Security Report

Project: `proj_a3425ae5974c`  
Gate status: **PASSED**

## Threat model

Multi-tenant SaaS. Trust boundary is Supabase JWT. Database access restricted by RLS using auth.uid().

## Controls applied

- **A01 - Broken access control** -- Supabase JWT validation + RLS on every table.
- **A02 - Cryptographic failures** -- TLS terminated at Vercel/Render; secrets via env only.
- **A03 - Injection** -- SQLAlchemy parameterised queries; Pydantic + Zod input validation.
- **A04 - Insecure design** -- Threat-modelled API surface; rate limits on mutations.
- **A05 - Security misconfiguration** -- Strict CORS allow-list; security headers in Next.js.
- **A06 - Vulnerable components** -- Dependabot + Trivy + Snyk wired into CI.
- **A07 - Identification & auth failures** -- Supabase Auth handles password reset, MFA, lockout.
- **A08 - Software & data integrity** -- Webhooks verified via HMAC signatures.
- **A09 - Logging & monitoring** -- Sentry on backend + frontend; structured logs.
- **A10 - SSRF** -- No user-controlled outbound URLs without allow-list.

## Findings

| Severity | Finding |
| -------- | ------- |
| WARNING | backend/app/routers/billing.py:21 -- POST route missing auth |
| PASS | No hardcoded secrets in source files |
| PASS | No raw f-string SQL queries found |
| PASS | No .env committed to project root |
| PASS | .gitignore correctly excludes .env |
| PASS | No service-role key leaked into client components |

Critical: 0 | Warnings: 1 | Passed: 5
