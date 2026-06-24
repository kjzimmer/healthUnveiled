# Shared Doc Feedback
**Site:** health-unveiled
**Governance:** CC appends here when shared docs have gaps, conflicts, or errors.
Never edit SHARED_TECH_STACK.md or SHARED_ADMIN_MODULES.md directly.
This file is reviewed in Claude.ai and resolved there.

---

## [2026-06-24] SHARED_TECH_STACK.md
**Site:** health-unveiled
**Type:** Gap
**Section:** Repository Structure / Database
**Issue:** The shared standard requires `@prisma/client` and `prisma` in `server/package.json` (implied by the server being a self-contained package with its own `npm install`). However, Prisma's `prisma-client-js` generator outputs the generated client to `node_modules/@prisma/client` relative to where `prisma/schema.prisma` is located (repo root). If `@prisma/client` is also installed in `server/node_modules/`, Node.js and TypeScript both resolve to that ungenerated copy first, breaking Prisma imports at runtime and causing TypeScript to miss the generated model types.
**Suggested fix:** The shared standard should document how to handle Prisma in a `server/` + `client/` monorepo structure — either via npm workspaces (hoisting), an explicit `output` path in the generator block pointing to `server/node_modules/@prisma/client`, or by keeping `@prisma/client`/`prisma` at root level as an exception to the scripts-only rule.
**Workaround used:** Kept `@prisma/client`, `prisma`, and `dotenv` at root level in the root `package.json` as an exception to the scripts-only rule. Root `postinstall` runs `prisma generate`. Server resolves `@prisma/client` via Node.js walk-up to root `node_modules/`. Documented in `docs/TECH_STACK.md`.

---

## [2026-06-24] docs/SITE_DESIGN.md, docs/TECH_STACK.md, docs/ARCHITECTURE.md
**Site:** health-unveiled
**Type:** Gap
**Section:** Phase 5 additions not reflected in site docs (docs are read-only for CC)
**Issue:** These site docs need updates after Phase 5 that CC cannot make directly:
- `docs/SITE_DESIGN.md` — CSS Approach: decided on plain CSS custom properties + single `admin.css` for admin SPA; teaser uses `teaser.css` with same design tokens. No external CSS framework.
- `docs/TECH_STACK.md` — Client packages: react 18, react-dom, react-router-dom v7, recharts v2, vite v6, @vitejs/plugin-react, typescript. Two Vite configs: `vite.config.ts` (admin, base `/admin/`) and `vite.teaser.config.ts` (teaser, root `src/teaser/`, base `/`).
- `docs/ARCHITECTURE.md` — New `client/` folder in structure; new admin routes (`/admin`, `/admin/*path` catch-all served by Express); teaser now React-built to `public/index.html` (was static HTML).
**Suggested fix:** Update all three docs in Claude.ai to reflect Phase 5 decisions.
**Workaround used:** Phase 5 decisions documented in `docs/wip/phase5-react-client.md`.
