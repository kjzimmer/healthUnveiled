# Changelog

## [Unreleased]

### Added
- Initial project scaffold: Express + TypeScript + Prisma teaser page
- `public/index.html` — teaser landing page with CSS fixes applied
- `public/js/main.js` — client-side subscribe form with localStorage gate
- `src/server.ts` — Express server serving static files, /health, /api/subscribe
- `src/db.ts` — singleton PrismaClient
- `src/services/SubscriberService.ts` — subscriber persistence
- `src/routes/subscribe.ts` — POST /api/subscribe route
- `prisma/schema.prisma` — People model with SubscriptionStatus enum
- Railway deployment configuration
