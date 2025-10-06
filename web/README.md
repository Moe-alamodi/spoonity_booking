# Spoonity Meeting Planner (web)

Next.js App Router project implementing the Timezone‑Aware Meeting Planner per SPEC.md.

## Quickstart

1. Copy `.env.example` to `.env.local` and fill in values.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

## Scripts

- `npm run dev` – start dev (Turbopack)
- `npm run build` – production build
- `npm run start` – start production server

## Notes
- Uses NextAuth with Google provider and Prisma adapter.
- API routes are stubbed; integrate Google APIs and tokens handling.
- See `../SPEC.md` for the product and technical specification.
