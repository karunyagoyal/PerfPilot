# PerfPilot — Run Me

Everything you need to pick up where you left off.

---

## Daily Dev Startup

```bash
# 1. Go to project
cd ~/Self_Projects/PerfPilot

# 2. Start the dev server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

That's it. The app is live.

---

## Test the DB Connection

Run this any time you want to verify Supabase is reachable:

```bash
npx tsx scripts/test-db.ts
```

Expected output: `✅ DB connected. Scans in table: <n>`

---

## Run a CLI Audit (no UI)

```bash
npx tsx scripts/run-audit.ts https://example.com
```

Runs Lighthouse + CrUX + Gemini AI and prints the report to the terminal.

---

## Prisma — Schema Changes

If you ever change `prisma/schema.prisma`:

```bash
# Push schema changes to Supabase (creates/alters tables)
npx prisma db push

# Regenerate the Prisma client types
npx prisma generate
```

---

## Environment Variables (`.env`)

| Variable | What it's for |
|---|---|
| `GEMINI_API_KEY` | Gemini AI — generates the performance report |
| `GOOGLE_API_KEY` | CrUX API — real user field data |
| `DATABASE_URL` | Supabase pooler — used by Prisma at runtime |
| `DIRECT_URL` | Supabase direct — used by Prisma CLI (db push) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |

---

## Project Structure

```
PerfPilot/
├── app/
│   ├── page.tsx                  ← Homepage (scan form + history)
│   ├── api/
│   │   ├── scan/route.ts         ← POST: runs audit, saves to DB
│   │   └── history/route.ts      ← GET: returns last 20 scans
│   └── globals.css
├── lib/
│   ├── audit.ts                  ← Lighthouse + CrUX + Gemini logic
│   ├── db.ts                     ← Prisma DB helpers (save/fetch scans)
│   └── prisma.ts                 ← Prisma client singleton
├── prisma/
│   └── schema.prisma             ← DB schema (Scan + AiReport models)
├── prisma.config.ts              ← Prisma v7 config (DB URLs)
├── scripts/
│   ├── run-audit.ts              ← CLI audit script
│   └── test-db.ts                ← DB connection test
├── docs/
│   └── run-me.md                 ← You are here
├── IMPLEMENTATION_PLAN.md        ← Full 10-layer build plan
└── .env                          ← API keys and DB URLs (never commit)
```

---

## Layers Completed

| Layer | What it does | Status |
|---|---|---|
| Layer 1 | CLI script — Lighthouse + CrUX + AI report | ✅ Done |
| Layer 2 | Next.js UI — scan form + results page | ✅ Done |
| Layer 3 | Database — results saved to Supabase via Prisma | ✅ Done |
| Layer 4 | Background jobs — stop browser hanging on scan | ⏳ Next |
| Layer 5 | Auth — login, orgs, multi-user | — |
| Layer 6 | PDF report generation | — |
| Layer 7 | White-label branding | — |
| Layer 8 | Automated weekly scans + email | — |
| Layer 9 | Stripe payments | — |
| Layer 10 | Advanced features | — |

---

## Supabase Dashboard

Project URL: https://uuftfpujnduwodhgtqfj.supabase.co

Tables created:
- `scans` — one row per audit (url, score, metrics, crux data)
- `ai_reports` — one row per scan (AI-generated report text)

---

## Known Constraints (Apple Work Machine)

- **npm registry** — routed through `npm.apple.com` (internal mirror). Most packages available.
- **Outbound HTTPS** — proxied through `localhost:3551`. External domains need allowlisting.
- **Direct TCP (port 5432)** — works fine. This is how Prisma connects to Supabase.
- **Supabase REST API** — blocked by proxy. Use Prisma (TCP) instead of fetch for DB access.
