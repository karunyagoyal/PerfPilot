# PerfPilot — Product Gaps & Future Planning

This file tracks everything that is **missing, incomplete, or planned** but not yet in the 10-layer build plan.
Use this as the backlog when deciding what to build next.

---

## UI Layer — Make It Look Like a Product
**Status: 🔲 Do after service layer is complete**

The core functionality works. These changes close the gap between "developer project" and "shippable product".
Tackle in order — highest impact first.

### 1. Render AI Report as Formatted Sections ⚡ HIGHEST IMPACT
**File:** `app/page.tsx` line ~189
**Problem:** AI report rendered inside a `<pre>` monospace block — looks like raw terminal output.
**Fix:** Parse the report text into sections (headings + paragraphs) and render with proper HTML. Each section gets a card with a heading, body text, and severity-appropriate colour accent.
**Effort:** 2–3 hours
**Impact:** The most valuable part of the product suddenly looks like a product.

### 2. Score Donut / Gauge Chart
**File:** `app/page.tsx` — the `text-7xl font-black` score block
**Problem:** Just a big number. No visual weight. Doesn't read as "score" to non-technical eyes.
**Fix:** Replace with an SVG donut/gauge chart — colour fills green/orange/red based on score. Number sits in the centre. Same pattern as Lighthouse, GTmetrix, PageSpeed Insights — users already know this visual language.
**Effort:** 2–3 hours
**Impact:** First thing eyes go to. Immediately looks like a performance tool.

### 3. Hero Section Above the Input
**File:** `app/page.tsx` — the header block
**Problem:** Page starts immediately with an input box. Cold visitors have no context.
**Fix:** Add 3 lines above the input:
- Headline: "Site health reports your clients can actually read"
- Sub-headline: "Performance · SEO · Accessibility — one scan, plain English"
- Optional: 3 icon+label bullets (Lighthouse data / Real-user CrUX / AI written)
**Effort:** 30 minutes
**Impact:** Sets context, builds trust, explains the value before the user interacts.

### 4. White / Light Theme
**File:** `app/globals.css` + `app/page.tsx`
**Problem:** Dark theme reads as developer tool. Target buyers (agency owners, clients) expect a professional light UI.
**Fix:** Switch to white/light-grey background, dark text, `#2563eb` blue accents. Keep dark as an optional toggle if desired.
**Effort:** 1 day
**Impact:** Repositions the product from dev tool to agency tool.

### 5. Download as PDF
**File:** New API route or client-side via `html2pdf.js` / `jsPDF`
**Problem:** Report lives in the browser, can't be shared or handed to a client.
**Fix:** "Download Report" button that exports the results page as a styled PDF. Agency logo slot at the top for white-label feel.
**Effort:** 3–4 hours
**Impact:** Makes PerfPilot a deliverable, not just a dashboard. Agencies pay for deliverables.

### 6. Shareable Public Report URL
**File:** `app/api/scan/route.ts` + new `app/report/[id]/page.tsx`
**Problem:** Scan results are only visible to the person who ran the scan.
**Fix:** Each scan gets a public read-only URL (`/report/<scanId>`). Share with a client or post on LinkedIn.
**Effort:** 1 day
**Impact:** Word of mouth channel. Every shared report is a PerfPilot ad.

### 7. Metric Cards — Add Threshold Labels
**File:** `app/page.tsx` — `MetricCard` component
**Problem:** Numbers shown without context (is 3.2s LCP good or bad?).
**Fix:** Add a small label under each value — "Good", "Needs Improvement", "Poor" — using the same thresholds Google uses. Colour-coded to match.
**Effort:** 1 hour
**Impact:** Non-technical clients immediately understand the result without googling what LCP means.

### 8. Skeleton Loading State
**File:** `app/page.tsx` — the loading block
**Problem:** A pulsing 🔦 emoji for 60–120 seconds looks unfinished.
**Fix:** Animated skeleton cards (grey shimmer boxes) in the shape of the results — score circle, metric grid, report section. With a step-by-step progress indicator ("Running Lighthouse… Fetching real-user data… Generating report…").
**Effort:** 2–3 hours
**Impact:** Makes the wait feel intentional and professional, not broken.

---

## Current State (as of Oct 2026)

| Layer | Status |
|-------|--------|
| Layer 1 — CLI Script | ✅ Done |
| Layer 2 — Next.js UI | ✅ Done |
| Layer 3 — Database | ✅ Done |
| Layer 4 — Background Jobs | 🔲 Next |
| Layer 5–10 | 🔲 Pending |

**Blocking issue:** Lighthouse scans take 60–120s. Vercel times out at 30s.
Layer 4 (background jobs) must be completed before anything else is production-ready.

---

## Quick Wins (Do Before Layer 4 — Hours, Not Days)

### 1. Enable All Four Lighthouse Categories (Performance + SEO + Accessibility + Best Practices)
**File:** `lib/audit.ts` line 51
**Change:**
```ts
// from
onlyCategories: ["performance"],

// to
onlyCategories: ["performance", "seo", "accessibility", "best-practices"],
```

**What you get for free — one scan, four dimensions:**

*SEO:*
- Title tag present & descriptive
- Meta description
- Links are crawlable
- Page not blocked from indexing (robots.txt / X-Robots-Tag)
- Canonical URL set correctly
- Structured data / schema markup
- hreflang tags
- Image alt attributes
- Legible font sizes on mobile

*Accessibility:*
- Buttons and links have accessible names
- Images have alt text
- Form labels present
- Sufficient colour contrast
- Keyboard navigation works
- ARIA attributes used correctly

*Best Practices:*
- HTTPS enforced
- No deprecated APIs
- No browser errors in console
- Secure cookie attributes
- No mixed content (HTTP resources on HTTPS page)

**Effort:** 2 hours (change + update AI prompt + update result types)
**Value:** One scan covers performance, SEO basics, accessibility, and hygiene — the full picture a client needs

---

### 1a. Product Positioning — "Site Health Tool for Agencies"

This combination (Performance + SEO + Accessibility + Best Practices) shifts the positioning away from "performance monitor" to something more useful and easier to sell:

> **"Everything your client needs to know about their site's health — performance, SEO basics, accessibility — in one report they can actually read."**

**Why this matters for sales:**
- Agencies run this before onboarding a new client — instant audit deliverable
- Agencies run it monthly and email the report — recurring value, justifies subscription
- Non-technical agency owners can hand the report directly to their client without translation

**Pricing fit:** At $29–49/month for an agency running scans across 5–10 clients, the math works cleanly. Each report saves 1–2 hours of manual audit time.

**What this is NOT (and doesn't need to be):**
- Keyword rankings
- Backlink analysis
- Competitor analysis
- Multi-page crawl (full site audit)

Those gaps belong to Semrush/Ahrefs. PerfPilot doesn't compete with them. It's the lightweight, readable, client-ready alternative — fast to run, zero setup, zero jargon.

**Where to reflect this in the product:**
- Homepage headline: update to "Site health reports your clients can actually read"
- AI prompt: instruct Gemini to write a single unified report across all four categories, not separate sections
- Free scan landing page copy (Quick Win #2 below)

---

### 2. Public Free Scan Page
A public `/scan` page with no login required — enter a URL, get a report.
- Acts as SEO anchor (people search "free website performance audit")
- Generates leads for paid agency tier
- Zero cost to run (just API costs per scan)

**Effort:** 1 day
**Value:** First user acquisition channel

---

### 3. Fix README — Layer Count
README currently says "Layer 1–2 complete" — Layer 3 (database) is also done. Update to reflect reality.
**Status:** ✅ Fixed

---

### 4. On-Page SEO Analysis (Layer 3.5)
Deep on-page audit via HTML parsing — goes beyond what Lighthouse checks.
Lighthouse only validates *presence*. This checks *quality*.

**Install:** `npm install cheerio`

**New file:** `lib/seo.ts`

```ts
import * as cheerio from "cheerio";

export interface OnPageSEO {
  title: { text: string; length: number; missing: boolean };
  metaDescription: { text: string; length: number; missing: boolean };
  headings: { h1: string[]; h2: string[]; h3: string[]; multipleH1: boolean };
  images: { total: number; missingAlt: number; examples: string[] };
  internalLinks: { count: number; externalCount: number };
  schema: { found: boolean; types: string[] };
  canonical: { url: string | null };
  openGraph: { hasOg: boolean; title?: string; description?: string };
}

export async function analyseOnPage(url: string): Promise<OnPageSEO> {
  const html = await fetch(url).then(r => r.text());
  const $ = cheerio.load(html);

  const title = $("title").first().text().trim();
  const metaDesc = $('meta[name="description"]').attr("content") ?? "";
  const canonical = $('link[rel="canonical"]').attr("href") ?? null;

  const h1s = $("h1").map((_, el) => $(el).text().trim()).get();
  const h2s = $("h2").map((_, el) => $(el).text().trim()).get();
  const h3s = $("h3").map((_, el) => $(el).text().trim()).get();

  const images = $("img");
  const missingAlt = images.filter((_, el) => !$(el).attr("alt")).length;
  const missingExamples = images
    .filter((_, el) => !$(el).attr("alt"))
    .map((_, el) => $(el).attr("src") ?? "unknown")
    .get()
    .slice(0, 3);

  const links = $("a[href]");
  const origin = new URL(url).origin;
  const internal = links.filter((_, el) => {
    const href = $(el).attr("href") ?? "";
    return href.startsWith("/") || href.startsWith(origin);
  }).length;

  const schemaScripts = $('script[type="application/ld+json"]');
  const schemaTypes: string[] = [];
  schemaScripts.each((_, el) => {
    try {
      const json = JSON.parse($(el).html() ?? "{}");
      if (json["@type"]) schemaTypes.push(json["@type"]);
    } catch {}
  });

  return {
    title: { text: title, length: title.length, missing: !title },
    metaDescription: { text: metaDesc, length: metaDesc.length, missing: !metaDesc },
    headings: { h1: h1s, h2: h2s, h3: h3s, multipleH1: h1s.length > 1 },
    images: { total: images.length, missingAlt, examples: missingExamples },
    internalLinks: { count: internal, externalCount: links.length - internal },
    schema: { found: schemaScripts.length > 0, types: schemaTypes },
    canonical: { url: canonical },
    openGraph: {
      hasOg: $('meta[property="og:title"]').length > 0,
      title: $('meta[property="og:title"]').attr("content"),
      description: $('meta[property="og:description"]').attr("content"),
    },
  };
}
```

**Wire into scan route** — call in parallel with Lighthouse:
```ts
// app/api/scan/route.ts
const [lh, crux, onPage] = await Promise.all([
  runLighthouse(url),
  fetchCrux(url),
  analyseOnPage(url),
]);
```

**Add to AI prompt:**
```ts
const onPageSection = `
--- ON-PAGE SEO ---
Title: "${onPage.title.text}" (${onPage.title.length} chars — ideal: 50–60)
Meta description: "${onPage.metaDescription.text}" (${onPage.metaDescription.length} chars — ideal: 150–160)
H1 tags: ${onPage.headings.h1.length} found ${onPage.headings.multipleH1 ? "⚠️ Multiple H1s" : "✅"}
H2 tags: ${onPage.headings.h2.length} | H3 tags: ${onPage.headings.h3.length}
Images: ${onPage.images.total} total, ${onPage.images.missingAlt} missing alt text
Schema markup: ${onPage.schema.found ? onPage.schema.types.join(", ") : "None found"}
Internal links: ${onPage.internalLinks.count} | External: ${onPage.internalLinks.externalCount}
Canonical: ${onPage.canonical.url ?? "Not set"}
`;
```

**What this covers:**
- ✅ Title tag (text, length, missing)
- ✅ Meta description (text, length, missing)
- ✅ Header hierarchy (H1/H2/H3 count, multiple H1 warning)
- ✅ Schema markup (presence + types e.g. Article, Product, FAQ)
- ✅ Image alt text (count of missing, examples)
- ✅ Internal vs external link count
- ✅ Canonical URL
- ✅ Open Graph tags

**What still needs external API (not in scope yet):**
- ❌ Title/meta keyword quality analysis
- ❌ Internal linking strategy (which pages link to which)
- ❌ Image file size optimisation (Lighthouse covers some of this)
- ❌ Link equity / authority signals (needs Ahrefs/SEMrush)

**Effort:** ~1 day total (lib/seo.ts + wire into route + update prompt + update UI)
**Value:** Transforms PerfPilot from performance tool → performance + on-page SEO tool

---

## Missing Features Not in Original 10-Layer Plan

### SEO Expansion

| Feature | Effort | API Cost | Notes |
|---------|--------|----------|-------|
| Lighthouse SEO category | 2 hrs | Free | Quick win — do this now |
| Site crawl audit (broken links, redirects, sitemap) | 3–5 days | Free (crawlee) | Screaming Frog equivalent |
| Keyword research + volume/difficulty | 1–2 weeks | $99–119/mo (SEMrush/Ahrefs) | Consider BYOK model |
| Google Search Console integration | 3–5 days | Free (Google API) | Needs OAuth per user |
| Rank tracking (SERP positions) | 1–2 weeks | Paid SERP API | DataForSEO ~$50/mo |
| Competitor benchmarking | 3–5 days | Needs keyword API | Compare vs 3 competitor URLs |
| Internal linking analysis | 2–3 days | Free (crawlee) | Part of crawl audit |
| Schema / structured data validator | 1 day | Free (Google API) | Rich results test API |

**Recommended approach for SEO tier:**
- BYOK (Bring Your Own Key) — user connects their own SEMrush/Ahrefs API key
- PerfPilot builds the integration, user pays the data cost
- Unlocks a `Pro` tier at $199/mo without API cost risk for you

---

### AI & Reporting Gaps

| Feature | Effort | Notes |
|---------|--------|-------|
| Multi-page analysis (crawl + aggregate) | 1 week | Currently single-URL only |
| AI-generated keyword recommendations | 2–3 days | Use AI to suggest keywords from page content |
| Industry-specific AI prompts | 1 day | e-commerce vs blog vs SaaS have different priorities |
| Hallucination guard on AI output | 1–2 days | Validate AI fix suggestions against actual audit data |
| Historical trend charts (Recharts) | 3–5 days | 28-day / 90-day performance trends |
| Competitor comparison in report | 3–5 days | Side-by-side score + metric comparison |
| Custom report branding (agency name in AI text) | 1 day | "For Acme Agency's client: example.com…" |

---

### Technical Debt

| Issue | Impact | Fix |
|-------|--------|-----|
| No timeout handling on scan API | User sees blank screen after 30s | Solved by Layer 4 (background jobs) |
| No retry on Lighthouse failure | Silent failures | Add retry logic in worker |
| No rate limiting on `/api/scan` | Abuse risk | Add IP-based rate limit (upstash ratelimit) |
| Single URL only | Can't scan full site | Multi-URL support in Layer 5+ |
| Gemini model hardcoded | Can't A/B test models | Move to env var `AI_MODEL=gemini-2.5-flash-lite` |
| No error reporting | Can't debug production failures | Add Sentry (free tier) |
| CrUX falls back silently | Report misleads user | Show "CrUX unavailable" clearly in UI |

---

### Distribution — Getting First User

This is the hardest part. The product works. The gap is finding someone to use it.

| Channel | Effort | Notes |
|---------|--------|-------|
| Free scan landing page | 1 day | SEO + word of mouth |
| Cold email 10 web agencies | 2 hrs | Offer 3-month free access in exchange for feedback |
| Post a demo scan on LinkedIn | 1 hr | Show a real site's report — visual, shareable |
| Freelancer.com / Upwork | Ongoing | Use PerfPilot reports as deliverables in SEO/perf audits |
| Post on Indie Hackers / Reddit r/webdev | 1 hr | "I built X, roast me" always gets traction |
| AppSumo / PH launch | 2–3 weeks prep | Only after Layer 6 (PDF) + Layer 9 (payments) done |

**First milestone:** One agency using it for free, giving feedback weekly.
**Second milestone:** That agency paying $39/mo.
**Third milestone:** 10 paying agencies ($390 MRR).

Don't build Layer 5–10 until you have at least one user telling you what they actually need.

---

## Tier Roadmap (Future Pricing)

| Tier | What It Includes | Price |
|------|-----------------|-------|
| Free | 3 scans/month, performance only | $0 |
| Starter | Unlimited scans, performance + SEO (Lighthouse), history | $39/mo |
| Agency | + White-label PDF, weekly automated scans, email digest | $89/mo |
| Pro | + SEMrush/Ahrefs BYOK, rank tracking, GSC integration | $199/mo |

---

## Vercel Deployment — What Needs to Change

**Status:** Not yet deployed. Deployment investigated Oct 2026.

### Blockers

#### 1. Lighthouse + Chrome (Critical)
`lib/audit.ts` → `runLighthouse()` uses `chrome-launcher` to spawn a real Chrome process. Vercel serverless functions have no Chrome installed — this will silently fail at runtime.

**Fix:** Replace `runLighthouse()` with the **PageSpeed Insights API** (PSI).
- PSI is Google's hosted Lighthouse — same engine, same metrics, identical data structure
- Uses the existing `GOOGLE_API_KEY` already in the project
- Removes `lighthouse` and `chrome-launcher` as dependencies entirely
- No Chrome, no timeout issues from browser startup
- Also removes the need for `serverExternalPackages` in `next.config.ts`

PSI endpoint:
```
https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<URL>&strategy=mobile&key=<GOOGLE_API_KEY>
```

Relevant response paths (same as what Lighthouse returns locally):
```
lighthouseResult.categories.performance.score      → performanceScore
lighthouseResult.audits["largest-contentful-paint"] → lcp metric
lighthouseResult.audits["interaction-to-next-paint"] → inp metric
... (same audit keys as current code)
```

**Effort:** ~2 hours (rewrite `runLighthouse` only; everything else stays the same)

---

#### 2. Database — Need a Hosted Postgres
The app uses Prisma + PostgreSQL. For Vercel, need a hosted DB. **Neon** is the easiest option:
- Free tier (0.5 GB storage, 190 compute hrs/month)
- Vercel has a first-party Neon integration (adds `DATABASE_URL` + `DIRECT_URL` to env vars automatically)
- `DIRECT_URL` already supported in `prisma.config.ts`

Alternative: Supabase (more features, slightly more complex setup).

---

#### 3. Prisma Generate on Build
Vercel doesn't run `prisma generate` automatically. Need to add a `postinstall` script to `package.json`:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

**Effort:** 2 minutes

---

#### 4. Function Timeout
Even with PSI, the scan route (PSI + CrUX + Gemini) can take 20–40s. Vercel's default timeout is 10s on the free tier.

**Fix:** Add `vercel.json` to set a higher timeout:
```json
{
  "functions": {
    "app/api/scan/route.ts": {
      "maxDuration": 60
    }
  }
}
```

Note: 60s requires Vercel Pro. On free tier, max is 10s — PSI alone is 10–30s so this is a real constraint. Options:
- Upgrade to Vercel Pro ($20/mo)
- Or complete Layer 4 (background jobs) first and deploy the worker elsewhere (Railway) — this is the cleaner long-term solution anyway

---

### Environment Variables to Set in Vercel Dashboard

| Variable | Value | Required? |
|----------|-------|-----------|
| `DATABASE_URL` | Neon/Supabase connection string (pooled) | Yes |
| `DIRECT_URL` | Neon/Supabase direct connection string | Yes (for migrations) |
| `GEMINI_API_KEY` | Google Gemini key | Yes |
| `GOOGLE_API_KEY` | Google Cloud key (CrUX + PSI) | Yes (after PSI switch) |

---

### Deployment Steps (once blockers are fixed)

1. Rewrite `runLighthouse` → PSI API in `lib/audit.ts`
2. Add `postinstall: prisma generate` to `package.json`
3. Add `vercel.json` with function timeout
4. Push to GitHub (repo already exists at `github.com/karunyagoyal/PerfPilot`)
5. Go to vercel.com → New Project → Import from GitHub
6. Add env vars in Vercel dashboard
7. Deploy

---

## Decision Log

| Date | Decision | Reason |
|------|----------|--------|
| Oct 2026 | Use Gemini instead of Claude for AI layer | Gemini API key already set up; Claude is also viable — swap via env var |
| Oct 2026 | Skip SEO expansion for now | Too much scope; Layer 4 is the blocker |
| Oct 2026 | BYOK model for SEMrush/Ahrefs | Avoids API cost risk; viable as Pro tier |
| Oct 2026 | Vercel deployment deferred | Chrome/Lighthouse blocker needs PSI migration first; Layer 4 (background jobs) is the cleaner long-term path |
