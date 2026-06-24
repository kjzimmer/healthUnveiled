# WIP: Phase 5 — React/Vite Client

**Status:** In progress
**Started:** 2026-06-24

## Scope

Two separate Vite builds inside a single `client/` package:

| Build | Config | Base | OutDir | Purpose |
|-------|--------|------|--------|---------|
| Admin SPA | `vite.config.ts` | `/admin/` | `../public/admin` | Admin panel at /admin |
| Teaser | `vite.teaser.config.ts` | `/` | `../public` | Replaces public/index.html |

## CSS Approach

**Plain CSS with CSS custom properties.** Single `admin.css` for admin SPA.
Uses the existing design token palette from `public/index.html`. No external CSS framework.
Logged in `shared/SHARED_FEEDBACK.md` for backfill to `docs/SITE_DESIGN.md`.

## Client Dependencies (all in `dependencies`, not devDeps per Railway gotcha)

- `react` ^18 + `react-dom` ^18
- `react-router-dom` ^7 (basename `/admin` for SPA routing)
- `recharts` ^2 (analytics line chart)
- `vite` ^6 + `@vitejs/plugin-react` ^4
- `typescript` ^6 + `@types/react` + `@types/react-dom`

## Admin SPA Routes

```
/admin/login        LoginPage — public (no auth required)
/admin/             → redirect to /admin/people
/admin/people       PeoplePage — list + detail panel
/admin/contact      ContactPage — inbox
/admin/analytics    AnalyticsPage — CF analytics + Recharts chart
```

## Files

### New
- `client/package.json`
- `client/tsconfig.json`
- `client/vite.config.ts`
- `client/vite.teaser.config.ts`
- `client/index.html`
- `client/src/admin.css`
- `client/src/main.tsx`
- `client/src/App.tsx`
- `client/src/context/AuthContext.tsx` — access token state + session restore on mount
- `client/src/lib/apiFetch.ts` — Bearer injection + 401 auto-refresh
- `client/src/types/index.ts`
- `client/src/components/Layout.tsx` — sidebar nav + outlet
- `client/src/pages/LoginPage.tsx`
- `client/src/pages/PeoplePage.tsx` — list + detail + edit
- `client/src/pages/ContactPage.tsx` — inbox + mark-read
- `client/src/pages/AnalyticsPage.tsx` — 3 stats + line chart + country bars + 3 pro-plan notices
- `client/src/teaser/index.html`
- `client/src/teaser/main.tsx`
- `client/src/teaser/TeaserApp.tsx` — pixel-perfect replica of public/index.html
- `client/src/teaser/teaser.css`

### Updated
- `package.json` (root) — build script includes client build
- `server/src/index.ts` — catch-all route for admin SPA routing

## Teaser Verification Step

When React teaser is deployed:
1. Compare visually against `docs/archive/health-unveiled-teaser.html`
2. If it matches, notify user — DO NOT remove `public/index.html` or `public/js/main.js` until user confirms
3. User removes the files manually after review

## Express Admin Route

```typescript
// After all API routes — catch React Router paths
app.get(['/admin', '/admin/*path'], (_req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'public', 'admin', 'index.html'));
});
```
