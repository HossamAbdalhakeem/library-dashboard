# Frontend Security

This Nuxt SPA uses layered checks: **SCA → SAST → DAST → Manual → Monitoring**.

The NestJS API is out of scope here; the API remains the source of truth for authorization.

## Quick commands

```bash
npm run security:sca    # dependency vulnerabilities (high+)
npm run security:sast   # ESLint + eslint-plugin-security
npm run security:dast   # security headers against a live URL
npm run security:check  # all three in sequence
```

DAST needs a reachable URL:

```bash
NUXT_PUBLIC_SITE_URL=https://your-frontend.example.com npm run security:dast
# or
npm run security:dast -- http://localhost:8000
```

CI runs SCA + SAST on every PR. DAST runs on schedule / manual workflow dispatch.

## What is already hardened

- `nuxt-security` in `nuxt.config.ts` (CSP, COOP/CORP, nosniff, frame denial, HSTS in prod, SRI)
- Edge headers in `vercel.json` (CSP / frame / nosniff / referrer / permissions) for static+CDN coverage
- No `v-html` / `innerHTML` usage in app code
- Auth required via `local-pages` middleware; role allowlists in `app/utils/routeAccess.js`
- `.env` gitignored; use `.env.example` for placeholders only

## Residual risks (manual awareness)

| Topic | Notes |
|-------|--------|
| Token in `localStorage` | XSS can steal the Bearer token. Mitigated by CSP + no HTML injection. Prefer httpOnly cookies later (needs API). |
| Client role gates | UI-only defense in depth. Always enforce permissions on the API. |
| `script-src 'unsafe-inline'` | Required by current SPA/Vite setup; tighten with nonces if SSR is adopted later. |

## Manual checklist (before release)

- [ ] No secrets or demo passwords in source (login fields empty by default)
- [ ] `.env` not committed; production env set in the host (Vercel / etc.)
- [ ] `npm run security:sca` clean at high+
- [ ] `npm run security:sast` clean
- [ ] `npm run security:dast` against production URL (CSP, nosniff, frame, HSTS)
- [ ] Production edge headers present (`vercel.json` + `nuxt-security`)
- [ ] Logout clears `token` / dashboard storage
- [ ] Spot-check: wrong role cannot open another role’s routes in the browser
- [ ] Spot-check: unauthenticated visit to `/home` redirects to `/login`

## Monitoring

- Keep `removeLoggers` enabled outside development (`nuxt-security`)
- Watch hosting logs (Vercel) for spikes in 4xx/5xx on the frontend deploy
- Watch API auth failures / 401 rates after releases
- Optionally add CSP reporting later (`report-uri` / `report-to`) — not enabled by default
