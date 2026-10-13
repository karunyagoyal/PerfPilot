# PerfPilot AI — Implementation Plan
> Build in layers. Each layer works on its own. Add the next only when the previous is solid.

## Progress
| Layer | Status |
|-------|--------|
| Layer 1 — CLI Script | ✅ Done |
| Layer 2 — Next.js UI | ✅ Done |
| Layer 3 — Database | ✅ Done |
| Layer 4 — Background Jobs | 🔲 Pending |
| Layer 5 — Auth + Orgs | 🔲 Pending |
| Layer 6 — PDF Report | 🔲 Pending |
| Layer 7 — White-Label Branding | 🔲 Pending |
| Layer 8 — Automated Scans + Email | 🔲 Pending |
| Layer 9 — Payments | 🔲 Pending |
| Layer 10 — Advanced Features | 🔲 Pending |

---

## The Core Idea

```
URL  →  Lighthouse  →  CrUX  →  Claude  →  Plain English Report
```

Everything else is just wrapping this loop in a better package.

---

## Layer 1 — Prove It Works (locally, no UI) ✅ DONE
> Goal: Run the core loop on your machine. No database. No UI. Just a script.

**What you build:**
- A Node.js script that takes a URL as input
- Runs Lighthouse on it → get scores + raw issues
- Calls CrUX API → get real user p75 data (LCP, INP, CLS, TTFB)
- Sends both to Claude → get plain English explanation + top 3 fixes
- Prints the result to the terminal

**Files:**
```
scripts/
  run-audit.ts       ← the whole thing in one file
```

**What you need:**
- `lighthouse` npm package
- `chrome-launcher` npm package
- Google Cloud API key (free) — enable CrUX API
- Anthropic API key — Claude Sonnet

**Done when:** You paste a URL in the terminal and get a readable performance summary back.

**Nothing else. No auth. No database. No hosting.**

---

## Layer 2 — Make It a Web Page (simple UI, no auth) ✅ DONE
> Goal: Anyone can use it from a browser. Still no login, no database.

**What you build:**
- A single Next.js page with a URL input field and a submit button
- API route calls Lighthouse + CrUX + Claude (same logic as Layer 1)
- Shows the report on screen

**Stack additions:**
- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui (for basic styling)

**Files:**
```
app/
  page.tsx              ← URL input form
  api/scan/route.ts     ← calls Lighthouse + CrUX + Claude
```

**Done when:** You open `localhost:3000`, paste a URL, click scan, see the report.

**Note:** Lighthouse takes 60–120 seconds. The API route will hang. That's fine for now —
you'll fix it in Layer 4. Don't optimise early.

---

## Layer 3 — Save Results (add a database) ✅ DONE
> Goal: Store scan history so results don't disappear on refresh.

**What you build:**
- Supabase project (free tier) with PostgreSQL
- Prisma ORM to talk to the database
- Two tables: `scans` and `ai_reports`
- Show a history list on the homepage

**Schema (just 2 tables for now):**
```
scans       (id, url, scanned_at, lh_score_perf, lh_raw_json)
ai_reports  (id, scan_id, summary_text, fixes_json)
```

**Stack additions:**
- Supabase (free)
- Prisma

**Done when:** Results persist. You can refresh the page and see past scans.

---

## Layer 4 — Fix the Timeout Problem (background jobs) 🔲 NEXT
> Goal: Stop the browser hanging for 2 minutes on every scan.

**The problem:** Vercel (and browsers) kill requests after 30 seconds.
Lighthouse takes 60–120 seconds. So you need the scan to run in the background.

**What you build:**
- A job queue: user submits URL → job is queued → worker picks it up → stores result
- Dashboard polls for result (or gets a live update via Supabase realtime)

**Stack additions:**
- Upstash Redis (free tier) — the queue
- BullMQ — the queue library
- Railway — a small always-on server that runs the worker

**Files:**
```
worker/
  index.ts         ← BullMQ worker: runs Lighthouse + CrUX + Claude
app/
  api/scan/enqueue/route.ts   ← just adds job to queue, returns immediately
```

**Done when:** Submit URL → page shows "Scanning…" → updates automatically when done.

---

## Layer 5 — Add Login (auth + organisations) 🔲 PENDING
> Goal: Each agency has their own account and sees only their data.

**What you build:**
- Sign up / sign in with Clerk
- Each user belongs to an organisation (agency)
- URLs and scans are scoped to an org

**Schema additions:**
```
organisations  (id, name, plan)
urls           (id, org_id, url, label, active)
-- scans and ai_reports get org_id foreign key
```

**Stack additions:**
- Clerk (free to 10K MAU)

**Done when:** Two different agencies log in and each sees only their own data.

---

## Layer 6 — Generate a PDF Report 🔲 PENDING
> Goal: A branded PDF the agency can email directly to their client.

**What you build:**
- An HTML report template (scores, AI fixes, CrUX vs Lighthouse comparison)
- Puppeteer renders HTML → PDF
- PDF stored in Cloudflare R2 (cheap object storage)
- Download link on the dashboard

**Stack additions:**
- Puppeteer (runs on worker server, not Vercel)
- Cloudflare R2 (free tier generous)
- `@aws-sdk/client-s3` with R2 endpoint

**Done when:** Click "Download Report" → get a clean PDF with scores and AI recommendations.

---

## Layer 7 — White-Label Branding 🔲 PENDING
> Goal: Agency puts their own logo + colours on the PDF. Client never sees PerfPilot.

**What you build:**
- Settings page: upload logo, pick brand colour, set report footer
- PDF template reads these values and applies them

**Schema additions:**
```
organisations  +logo_url, +brand_colour, +report_footer
```

**Done when:** Agency uploads their logo → PDF has their branding on it.

---

## Layer 8 — Automated Weekly Scans + Email Digest 🔲 PENDING
> Goal: Reports go out automatically. Agency doesn't have to log in.

**What you build:**
- BullMQ cron scheduler — triggers scans every week per org
- Resend email — sends weekly digest with PDF links to agency

**Stack additions:**
- Resend (free to 3K sends/month)
- React Email (email templates)

**Done when:** Every Monday morning, agency gets an email with last week's report. No manual action needed.

---

## Layer 9 — Take Money (payments) 🔲 PENDING
> Goal: First dollar in. Enforce plan limits.

**What you build:**
- `/pricing` page with 3 tiers
- Stripe Checkout for subscribing
- Stripe webhook to update `organisations.plan`
- Enforce limits: URL count, scan frequency, team seats
- Stripe Customer Portal for self-serve upgrades/cancellations

**Tiers:**
| | Starter $39/mo | Agency $89/mo |
|---|---|---|
| URLs | 10 | 50 |
| Scans | Weekly | Daily |
| White-label PDF | No | Yes |
| Team seats | 1 | 3 |

**Stack additions:**
- Stripe Billing + Customer Portal

**Done when:** Real card → real charge → plan enforced in the app.

---

## Layer 10 — Advanced Features (only if customers ask) 🔲 PENDING
> Add these only when a paying customer says they need it.

- **Slack alerts** — notify agency when a score drops below threshold
- **Competitor benchmarking** — compare client site vs 3 competitor URLs
- **CrUX trend charts** — 40-week history visualised in Recharts
- **Scale tier ($199/mo)** — 250 URLs, unlimited seats, API access
- **Soft-launch public scanner** — `/free-scan` page as SEO anchor

---

## Summary — What Each Layer Adds

```
Layer 1  │ ✅ Core loop works (script only)
Layer 2  │ ✅ Has a UI (Next.js page)
Layer 3  │ ✅ Saves history (database)
Layer 4  │ 🔲 Doesn't hang the browser (background jobs)   ← NEXT
Layer 5  │ 🔲 Multi-user (auth + orgs)
Layer 6  │ 🔲 Generates a PDF
Layer 7  │ 🔲 PDF is white-labeled
Layer 8  │ 🔲 Runs automatically (no manual trigger)
Layer 9  │ 🔲 Charges money (Stripe)
Layer 10 │ 🔲 Advanced features (when customers ask)
```

---

## Where to Start Right Now

**Layer 1 only.** One script. One file. No database, no UI, no hosting.

```bash
npx ts-node scripts/run-audit.ts https://example.com
```

Output should look like:

```
Performance Score: 62/100

LCP (Largest Contentful Paint): 4.2s  [Real users, p75]
  ⚠ Google 'Good' threshold is under 2.5s
  Fix 1: Preload your hero image
  Fix 2: Switch to a faster CDN
  Fix 3: Compress images to WebP

CLS (Cumulative Layout Shift): 0.28  [Real users, p75]
  ⚠ Google 'Good' threshold is under 0.1
  Fix 1: Set explicit width/height on images
  ...
```

**Once that works — and only then — move to Layer 2.**
