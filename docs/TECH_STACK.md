# Tech Stack — Health Unveiled
*Site-specific stack decisions and deviations from the shared standard.*
*Read `shared/SHARED_TECH_STACK.md` first — this doc covers only what differs.*

---

## Deviations from Shared Standard

### @prisma/client at Root Level

**Decision:** `@prisma/client`, `prisma`, and `dotenv` are root-level dependencies in the root `package.json`, not in `server/package.json`.

**Reason:** Prisma's `prisma-client-js` generator outputs the generated client to `node_modules/@prisma/client` relative to `prisma/schema.prisma` (repo root). If `@prisma/client` is also installed in `server/node_modules/`, Node.js and TypeScript both resolve to that ungenerated copy first, breaking Prisma imports at runtime and causing TypeScript to miss generated model types.

**How it works:**
- Root `postinstall` runs `prisma generate`, outputting to root `node_modules/@prisma/client`
- Root `build` script: `cd client && npm install && npm run build && cd ../server && npm install && npm run build`
- TypeScript in `server/` finds `@prisma/client` by walking up: `server/node_modules/` → root `node_modules/` ✓
- Node.js at runtime does the same walk ✓

**Do not add** `@prisma/client` or `prisma` to `server/package.json`. If you see a TypeScript error about `@prisma/client` not found, run `npm install` at the **repo root**, not inside `server/`.

*Logged in `shared/SHARED_FEEDBACK.md` for cross-site resolution.*

### Node.js Version Constraint

Local development runs Node 20.12.2. Prisma 6 is pinned because Prisma 7+ requires Node ≥20.19. Railway runs Node 24 (no constraint there). Upgrade local Node before moving to Prisma 7.

### All Client Packages in `dependencies` (not `devDependencies`)

Railway sets `NODE_ENV=production` at build time, which causes `npm install` to skip `devDependencies`. All packages required for the Vite build must be in `dependencies` in `client/package.json`.

---

## Site-Specific Packages

### Server

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5 | HTTP server |
| `bcryptjs` | ^3 | Password hashing (bcrypt cost 12 for seed, 10 for refresh tokens) |
| `jsonwebtoken` | ^9 | JWT signing and verification |
| `cookie-parser` | ^1.4 | HttpOnly refresh token cookie parsing |
| `express-rate-limit` | ^7.5 | Rate limiting on public endpoints |

### Client

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | DOM renderer |
| `react-router-dom` | ^7.6.2 | SPA routing (`basename="/admin"` for admin SPA) |
| `recharts` | ^2.15.3 | Analytics line chart (responsive container) |
| `vite` | ^6.3.5 | Build tool |
| `@vitejs/plugin-react` | ^4.5.2 | Vite React plugin |
| `typescript` | ^6.0.3 | Type checking |
| `@types/react` | ^18.3.23 | React types |
| `@types/react-dom` | ^18.3.7 | React DOM types |

---

## Vite Build Configuration

Two separate Vite configs in `client/`:

| Config | Base | Root | OutDir | Purpose |
|--------|------|------|--------|---------|
| `vite.config.ts` | `/admin/` | default | `../public/admin` | Admin SPA |
| `vite.teaser.config.ts` | `/` | `src/teaser/` | `../public` | Teaser landing page |

`build:admin` and `build:teaser` run sequentially via `npm run build` in the client package. The teaser build uses `emptyOutDir: false` to avoid wiping the admin build output from `public/`.

**Critical:** `base: '/admin/'` is required in `vite.config.ts`. Without it, built asset paths resolve from `/` instead of `/admin/` and the admin SPA loads blank.

---

## CSS Approach

**Plain CSS with CSS custom properties.** No external framework.

- `client/src/teaser/teaser.css` — teaser page styles; canonical source for the design token palette
- `client/src/admin.css` — admin SPA styles; same token palette, separate stylesheet

Admin layout uses a fixed-sidebar shell per `shared/SHARED_ADMIN_MODULES.md` §6: `.admin-shell` (flex row) → `.sidebar` (220px, `--sidebar-bg: #1a1917`) + `.main-content` (flex 1, scrollable). No Tailwind, no CSS Modules.

---

## Email Capture Service

**Undecided.** Options: Mailchimp, ConvertKit, Buttondown. Decision required before first broadcast to the subscriber list. Current implementation persists emails to the database only — no external service is integrated.
