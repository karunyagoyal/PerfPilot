# PerfPilot

PerfPilot is a B2B SaaS tool that automates web performance reporting for digital agencies. It combines **Google Lighthouse lab data**, **Chrome UX Report (CrUX) real-user field data**, and **Gemini AI** to generate plain-English performance reports — no technical expertise required.

---

## What It Does

Most performance tools dump raw numbers (LCP: 3.2s, CLS: 0.14...) that mean nothing to a non-technical client. PerfPilot turns those numbers into a clear, actionable report that agencies can hand directly to clients or use to prioritize fixes.

### How it works

```
URL → Lighthouse (lab audit) + CrUX (real-user data) → Gemini AI → Plain-English Report
```

1. You enter a URL
2. PerfPilot runs a full **Lighthouse performance audit** in headless Chrome — same as what Google PageSpeed uses
3. It fetches **real-user Chrome UX data** (p75 percentile, mobile) from Google's CrUX API
4. Both datasets are sent to **Gemini AI**, which generates a structured report in plain English
5. You get a dashboard with scores, metrics, and an AI-written report — all in one page

### What you see in the report

- **Performance Score** (0–100, color-coded)
- **Lab Metrics**: LCP, INP, CLS, FCP, TTFB, TBT, Speed Index
- **Real-User Field Data**: What actual Chrome users are experiencing (from CrUX)
- **Top Opportunities**: Specific fixes with estimated time savings
- **AI Summary**: 4-section plain-English report covering the worst metrics, top 3 fixes, and a lab vs. real-user comparison — written for non-technical readers

---

## Who It's For

- **Digital agencies** that manage performance for client sites and need to communicate results without jargon
- **Developers** who want a fast, automated performance snapshot with AI-generated context
- **Teams** who want to move from raw audit data to actionable priorities quickly

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 4 |
| Performance Audit | Google Lighthouse 13 + Chrome Launcher |
| Real-User Data | Google CrUX API |
| AI Reports | Google Gemini (`gemini-2.5-flash-lite`) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Google Chrome installed (required by Lighthouse)
- A **Google API key** with access to:
  - Chrome UX Report API
  - Gemini API

### 1. Clone the repo

```bash
git clone https://github.com/karunyagoyal/PerfPilot.git
cd PerfPilot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_API_KEY=your_google_crux_api_key
```

> Both keys can be created at [Google AI Studio](https://aistudio.google.com/) and [Google Cloud Console](https://console.cloud.google.com/). Enable the **Chrome UX Report API** in your Google Cloud project.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter any URL, and hit **Scan**.

> Note: Each scan takes 60–120 seconds — Lighthouse runs a real headless Chrome audit.

---

## CLI Usage

You can also run a one-off audit directly from the terminal without starting the web server:

```bash
npm run audit -- https://example.com
```

This runs the same Lighthouse + CrUX pipeline and prints the results to the console.

---

## Project Structure

```
app/
  api/scan/route.ts   # POST endpoint — runs audit and returns JSON
  page.tsx            # Main UI
lib/
  audit.ts            # Core logic: Lighthouse, CrUX, Gemini
scripts/
  run-audit.ts        # CLI entry point
```

---

## Roadmap

PerfPilot is built in layers. Layers 1–3 are complete (core audit + web UI + database). See [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) for the full breakdown and [`PRODUCT_GAPS.md`](./PRODUCT_GAPS.md) for missing features and future planning.

### Build layers
- [x] Layer 1 — CLI script (core loop)
- [x] Layer 2 — Next.js web UI
- [x] Layer 3 — Database persistence (Supabase + Prisma)
- [ ] Layer 4 — Background job queue (BullMQ + Redis) ← **next**
- [ ] Layer 5 — Auth + team accounts (Clerk)
- [ ] Layer 6 — PDF report export
- [ ] Layer 7 — White-label branding
- [ ] Layer 8 — Automated weekly scans + email delivery
- [ ] Layer 9 — Stripe payments
- [ ] Layer 10 — Advanced features (Slack alerts, benchmarking, trends)

### Quick wins (not in original plan, low effort)
- [ ] Enable Lighthouse SEO category — adds on-page SEO audit in ~2 hours
- [ ] Enable Lighthouse accessibility + best-practices categories
- [ ] Public free-scan landing page (SEO anchor + lead capture)

### Product gaps (planned for future)
- [ ] SEO keyword research (SEMrush / Ahrefs BYOK integration)
- [ ] Site crawl audit (broken links, redirects, sitemap)
- [ ] Google Search Console integration
- [ ] Rank tracking
- [ ] Competitor benchmarking
- [ ] Multi-URL bulk scanning

---

## License

MIT
