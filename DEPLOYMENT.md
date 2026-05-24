# Deployment

Project: `proj_a3425ae5974c`

## Live URLs

- Repository: https://github.com/padmajakotoky73-hash/contractforge-ai-contract-and-a3425a
- Backend: https://contractforge-ai-contract-and-a3425a.onrender.com
- Frontend: (skipped)

## Monitoring

- Sentry: (not configured)
- Uptime Robot: (not configured)

## Smoke tests

```json
{
  "backend_health": {
    "url": "https://contractforge-ai-contract-and-a3425a.onrender.com/healthz",
    "status": 0,
    "error": "The read operation timed out"
  }
}
```

## Runbook

1. **Rollback (backend):** open the Render dashboard, navigate to the service, and redeploy a previous commit.
2. **Rollback (frontend):** in Vercel, promote the previous deployment to production.
3. **Rotate secrets:** update Doppler config + redeploy backend + frontend.
4. **Investigate errors:** open the Sentry project link above; the healer service may already have opened a PR.
5. **Restore database:** Supabase keeps daily backups; restore via the dashboard.
