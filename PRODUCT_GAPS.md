# PerfPilot — Product Gaps & Future Planning

This file tracks everything that is **missing, incomplete, or planned**.
Use this as the backlog when deciding what to build next.

---

## Current State (as of Oct 2026)

| Layer | Status |
|-------|--------|
| Layer 1 — CLI Script | ✅ Done |
| Layer 2 — Next.js UI | ✅ Done |
| Layer 3 — Database (Supabase + Prisma) | ✅ Done |
| Layer 3.5 — PSI Migration (Chrome → PageSpeed Insights API) | ✅ Done — Oct 2026 |
| Layer 3.6 — Vercel Deployment | ✅ Done — Oct 2026 → https://perf-pilot.vercel.app |
| Layer 4 — Background Job Queue (BullMQ + Redis) | 🔲 Next |
| Layer 5 — Auth + Team Accounts (Clerk) | 🔲 Pending |
| Layer 6 — PDF Report Export | 🔲 Pending |
| Layer 7 — White-label Branding | 🔲 Pending |
| Layer 8 — Automated Weekly Scans + Email | 🔲 Pending |
| Layer 9 — Stripe Payments | 🔲 Pending |
| Layer 10 — Advanced Features | 🔲 Pending |

---

## Next Priority — UI Layer (Make It Look Like a Product)
**Do before Layer 4 — these are hours not days, and unblock sharing with real users**

### 1. ⚡ Render AI Report as Formatted Sections — HIGHEST IMPACT
**File:** `app/page.tsx` line ~189
**Problem:** AI report rendered inside a `<pre>` monospace block — looks like raw terminal output. Markdown symbols (`**bold**`, `*bullets*`) show as raw characters.
**Fix:** Parse the report text into sections (headings + paragraphs) and render with proper HTML. Each section gets a card with a heading and body text.
**Effort:** 2–3 hours
**Status:** 🔲 Todo

### 2. Score Donut / Gauge Chart
**File:** `app/page.tsx` — the `text-7xl font-black` score block
**Problem:** Just a big number. Doesn't read as "score" to non-technical eyes.
**Fix:** SVG donut/gauge chart — colour fills green/orange/red. Number in centre. Same visual language as Lighthouse, GTmetrix, PageSpeed Insights.
**Effort:** 2–3 hours
**Status:** 🔲 Todo

### 3. Hero Section Above the Input
**File:** `app/page.tsx` — the header block
**Problem:** Page starts immediately with an input box. Cold visitors have no context.
**Fix:** 3 lines above the input:
- Headline: "Site health reports your clients can actually read"
- Sub-headline: "Performance · SEO · Accessibility — one scan, plain English"
- 3 icon+label bullets (Lighthouse data / Real-user CrUX / AI written)
**Effort:** 30 minutes
**Status:** 🔲 Todo

### 4. Metric Cards — Add Threshold Labels
**File:** `app/page.tsx` — `MetricCard` component
**Problem:** Numbers shown without context (is 3.2s LCP good or bad?).
**Fix:** Add "Good / Needs Improvement / Poor" label under each value using Google's thresholds. Colour-coded.
**Effort:** 1 hour
**Status:** 🔲 Todo

### 5. Skeleton Loading State
**File:** `app/page.tsx` — the loading block
**Problem:** A pulsing 🔦 emoji for 60s looks unfinished.
**Fix:** Animated skeleton cards + step-by-step progress text ("Running Lighthouse… Fetching real-user data… Generating report…").
**Effort:** 2–3 hours
**Status:** 🔲 Todo

### 6. White / Light Theme
**File:** `app/globals.css` + `app/page.tsx`
**Problem:** Dark theme reads as developer tool. Agency buyers expect a professional light UI.
**Fix:** White/light-grey background, dark text, `#2563eb` blue accents.
**Effort:** 1 day
**Status:** 🔲 Todo

### 7. Download as PDF
**Problem:** Report lives in the browser, can't be handed to a client.
**Fix:** "Download Report" button exports the results page as a styled PDF.
**Effort:** 3–4 hours
**Status:** 🔲 Todo

### 8. Shareable Public Report URL
**File:** `app/api/scan/route.ts` + new `app/report/[id]/page.tsx`
**Problem:** Scan results are only visible to the person who ran the scan.
**Fix:** Each scan gets a public read-only URL (`/report/<scanId>`).
**Effort:** 1 day
**Status:** 🔲 Todo

---

## Quick Wins — Service Layer

### Enable All 4 PSI Categories (Performance + SEO + Accessibility + Best Practices)
**File:** `lib/audit.ts` — add `category=seo&category=accessibility&category=best-practices` to the PSI API URL
**What you get for free:** SEO basics, accessibility checks, HTTPS/security hygiene — all in one scan
**Effort:** 2 hours
**Status:** 🔲 Todo

### On-Page SEO Analysis (cheerio HTML parsing)
**File:** New `lib/seo.ts` — parse title, meta description, H1/H2, alt text, canonical, Open Graph, schema markup
**Effort:** 1 day
**Status:** 🔲 Todo

---

## Distribution — Getting First User

| Channel | Effort | Notes |
|---------|--------|-------|
| Post on Reddit r/webdev / r/SEO | 1 hr | Show a real report on a real site |
| Post demo scan on LinkedIn | 1 hr | Visual, shareable — targets agency owners |
| Cold email 10 web agencies | 2 hrs | Offer 3-month free access for feedback |
| Indie Hackers / Product Hunt | 2–3 weeks prep | After PDF + payments done |

**Milestone 1:** One agency using it free, giving weekly feedback
**Milestone 2:** That agency paying $39/mo
**Milestone 3:** 10 paying agencies ($390 MRR)

---

## Tier Roadmap (Future Pricing)

| Tier | What It Includes | Price |
|------|-----------------|-------|
| Free | 3 scans/month, performance only | $0 |
| Starter | Unlimited scans, performance + SEO, history | $39/mo |
| Agency | + White-label PDF, weekly automated scans, email digest | $89/mo |
| Pro | + SEMrush/Ahrefs BYOK, rank tracking, GSC integration | $199/mo |

---

## Future Features (Post-Launch)

| Feature | Effort | Notes |
|---------|--------|-------|
| Site crawl audit (broken links, redirects) | 3–5 days | Screaming Frog equivalent |
| Google Search Console integration | 3–5 days | Needs OAuth per user |
| Keyword research (SEMrush/Ahrefs BYOK) | 1–2 weeks | User brings own API key |
| Rank tracking | 1–2 weeks | DataForSEO ~$50/mo |
| Competitor benchmarking | 3–5 days | Compare vs 3 competitor URLs |
| Historical trend charts | 3–5 days | 28-day / 90-day performance trends |
| Multi-URL bulk scanning | 1 week | Scan full site not just one page |
| Slack alerts | 2–3 days | Score drops below threshold → alert |
| Custom report branding | 1 day | Agency name in AI report text |

---

## Technical Debt

| Issue | Impact | Fix |
|-------|--------|-----|
| No rate limiting on `/api/scan` | Abuse risk | Add IP-based rate limit (upstash ratelimit) |
| No retry on PSI failure | Silent failures | Add retry with backoff in `runLighthouse` |
| Gemini model hardcoded | Can't A/B test | Move to env var `AI_MODEL=gemini-2.5-flash-lite` |
| No error reporting | Can't debug prod failures | Add Sentry (free tier) |
| CrUX falls back silently | Report misleads user | Show "CrUX unavailable" banner in UI |
| No rate limiting on Google APIs | Cost risk at scale | Track usage, add circuit breaker |

---

## Decision Log

| Date | Decision | Reason |
|------|----------|--------|
| Oct 2026 | Use Gemini instead of Claude for AI layer | Gemini API key already set up; Claude viable via env var swap |
| Oct 2026 | Replace local Lighthouse with PSI API | Chrome can't run on Vercel serverless; PSI is same engine hosted by Google |
| Oct 2026 | Use Supabase (already set up) instead of Neon | DATABASE_URL already configured, no migration needed |
| Oct 2026 | Deploy to Vercel free tier | PSI migration removed the Chrome blocker; 60s timeout sufficient for current scan times |
| Oct 2026 | BYOK model for SEMrush/Ahrefs | Avoids API cost risk; viable as Pro tier upsell |
