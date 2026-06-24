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
- Root `build` script: `cd server && npm install && npm run build` (no separate `prisma generate` needed)
- TypeScript in `server/` finds `@prisma/client` by walking up: `server/node_modules/` → root `node_modules/` ✓
- Node.js at runtime does the same walk ✓

**Do not add** `@prisma/client` or `prisma` to `server/package.json`. If you see a TypeScript error about `@prisma/client` not found, run `npm install` at the **repo root**, not inside `server/`.

*Logged in `shared/SHARED_FEEDBACK.md` for cross-site resolution.*

### Node.js Version Constraint

Local development runs Node 20.12.2. Prisma 6 is pinned because Prisma 7+ requires Node ≥20.19. Railway runs Node 24 (no constraint there). Upgrade local Node before moving to Prisma 7.

---

## Site-Specific Packages

### Server

| Package | Version | Purpose |
|---------|---------|---------|
| `express-rate-limit` | ^7.5.0 | Rate limiting on public endpoints |

### Client

*(No client packages yet — React/Vite client is Phase 5.)*

---

## CSS Approach

**Undecided.** Decision documented here when the React client build begins (Phase 5). See `docs/SITE_DESIGN.md`.

---

## Email Capture Service

**Undecided.** Options: Mailchimp, ConvertKit, Buttondown. Decision required before first broadcast to the subscriber list. Current implementation persists emails to the database only — no external service is integrated.
