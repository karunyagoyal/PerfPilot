import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface LighthouseMetric {
  score: number | null;
  displayValue: string | undefined;
  title: string;
  description: string;
}

export interface LighthouseResult {
  performanceScore: number;
  metrics: {
    lcp: LighthouseMetric;
    inp: LighthouseMetric;
    cls: LighthouseMetric;
    fcp: LighthouseMetric;
    ttfb: LighthouseMetric;
    tbt: LighthouseMetric;
    speedIndex: LighthouseMetric;
  };
  opportunities: { title: string; description: string; savings: string }[];
  diagnostics: { title: string; description: string }[];
}

export interface CruxData {
  lcp_p75: number | null;
  inp_p75: number | null;
  cls_p75: number | null;
  fcp_p75: number | null;
  ttfb_p75: number | null;
  source: "url" | "origin" | "unavailable";
}

// ---------------------------------------------------------------------------
// Step 1 — Run Lighthouse via PageSpeed Insights API (no Chrome required)
// ---------------------------------------------------------------------------
export async function runLighthouse(url: string): Promise<LighthouseResult> {
  const GOOGLE_API_KEY = process.env["GOOGLE_API_KEY"] ?? "";

  const apiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(url)}&strategy=mobile&category=performance&key=${GOOGLE_API_KEY}`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PageSpeed Insights API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as any;
  const lhr = data.lighthouseResult;
  const audits = lhr.audits as Record<string, any>;

  const metric = (key: string): LighthouseMetric => ({
    score: audits[key]?.score ?? null,
    displayValue: audits[key]?.displayValue,
    title: audits[key]?.title ?? key,
    description: audits[key]?.description ?? "",
  });

  const opportunities = Object.values(audits)
    .filter((a: any) => a.details?.type === "opportunity" && a.score !== null && a.score < 1)
    .map((a: any) => ({
      title: a.title,
      description: a.description,
      savings: a.displayValue ?? "",
    }))
    .slice(0, 5);

  const diagnostics = Object.values(audits)
    .filter((a: any) => a.details?.type === "table" && a.score !== null && a.score < 1)
    .map((a: any) => ({ title: a.title, description: a.description }))
    .slice(0, 5);

  return {
    performanceScore: Math.round((lhr.categories["performance"]?.score ?? 0) * 100),
    metrics: {
      lcp: metric("largest-contentful-paint"),
      inp: metric("interaction-to-next-paint"),
      cls: metric("cumulative-layout-shift"),
      fcp: metric("first-contentful-paint"),
      ttfb: metric("server-response-time"),
      tbt: metric("total-blocking-time"),
      speedIndex: metric("speed-index"),
    },
    opportunities,
    diagnostics,
  };
}

// ---------------------------------------------------------------------------
// Step 2 — Fetch CrUX data
// ---------------------------------------------------------------------------
export async function fetchCrux(url: string): Promise<CruxData> {
  const GOOGLE_API_KEY = process.env["GOOGLE_API_KEY"] ?? "";

  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "your_google_cloud_api_key_here") {
    return { lcp_p75: null, inp_p75: null, cls_p75: null, fcp_p75: null, ttfb_p75: null, source: "unavailable" };
  }

  const endpoint = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${GOOGLE_API_KEY}`;

  for (const body of [{ url }, { origin: new URL(url).origin }]) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, formFactor: "PHONE" }),
      });

      if (!res.ok) continue;

      const data = await res.json() as any;
      const metrics = data?.record?.metrics;
      if (!metrics) continue;

      const p75 = (key: string) => {
        const val = metrics[key]?.percentiles?.p75;
        return val !== undefined && val !== null ? parseFloat(val) : null;
      };

      return {
        lcp_p75: p75("largest_contentful_paint") != null
          ? p75("largest_contentful_paint")! / 1000
          : null,
        inp_p75: p75("interaction_to_next_paint"),
        cls_p75: p75("cumulative_layout_shift"),
        fcp_p75: p75("first_contentful_paint") != null
          ? p75("first_contentful_paint")! / 1000
          : null,
        ttfb_p75: p75("experimental_time_to_first_byte") != null
          ? p75("experimental_time_to_first_byte")! / 1000
          : null,
        source: "url" in body ? "url" : "origin",
      };
    } catch {
      continue;
    }
  }

  return { lcp_p75: null, inp_p75: null, cls_p75: null, fcp_p75: null, ttfb_p75: null, source: "unavailable" };
}

// ---------------------------------------------------------------------------
// Step 3 — Generate Gemini report
// ---------------------------------------------------------------------------
export async function generateReport(
  url: string,
  lh: LighthouseResult,
  crux: CruxData
): Promise<string> {
  const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] ?? "";

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const cruxSummary =
    crux.source === "unavailable"
      ? "CrUX field data is not available for this URL (not enough Chrome users or API key not set)."
      : `CrUX real-user data (${crux.source}-level, mobile p75):
- LCP: ${crux.lcp_p75 !== null ? crux.lcp_p75.toFixed(2) + "s" : "n/a"}  (Good: < 2.5s)
- INP: ${crux.inp_p75 !== null ? crux.inp_p75 + "ms" : "n/a"}  (Good: < 200ms)
- CLS: ${crux.cls_p75 !== null ? crux.cls_p75.toFixed(3) : "n/a"}  (Good: < 0.1)
- FCP: ${crux.fcp_p75 !== null ? crux.fcp_p75.toFixed(2) + "s" : "n/a"}  (Good: < 1.8s)
- TTFB: ${crux.ttfb_p75 !== null ? crux.ttfb_p75.toFixed(2) + "s" : "n/a"}  (Good: < 0.8s)`;

  const opportunitiesList = lh.opportunities
    .map((o) => `- ${o.title}: ${o.savings}`)
    .join("\n") || "None flagged";

  const prompt = `You are a web performance expert writing a report for a non-technical web agency owner.
Use plain English. No jargon. Be specific. Be actionable. Be concise.

URL audited: ${url}

--- LIGHTHOUSE LAB DATA (simulated, mobile) ---
Overall Performance Score: ${lh.performanceScore}/100
- LCP (Largest Contentful Paint): ${lh.metrics.lcp.displayValue ?? "n/a"}
- INP (Interaction to Next Paint): ${lh.metrics.inp.displayValue ?? "n/a"}
- CLS (Cumulative Layout Shift): ${lh.metrics.cls.displayValue ?? "n/a"}
- FCP (First Contentful Paint): ${lh.metrics.fcp.displayValue ?? "n/a"}
- TTFB (Time to First Byte): ${lh.metrics.ttfb.displayValue ?? "n/a"}
- TBT (Total Blocking Time): ${lh.metrics.tbt.displayValue ?? "n/a"}
- Speed Index: ${lh.metrics.speedIndex.displayValue ?? "n/a"}

Top opportunities to improve:
${opportunitiesList}

--- CRUX FIELD DATA (real Chrome users) ---
${cruxSummary}

---

Write a performance report with these sections:

1. SUMMARY (2–3 sentences: overall health, biggest problem, business impact)

2. WHAT'S HURTING YOU MOST (pick the 2–3 worst metrics, explain what each means in one sentence, show the value vs Google's threshold)

3. TOP 3 FIXES (numbered list — be specific, explain what to do, why it helps, rough SEO impact: Low/Medium/High)

4. LAB DATA vs REAL USERS (one paragraph comparing Lighthouse score vs CrUX field data — are real users experiencing the same issues?)

Keep the whole report under 400 words. Write as if the agency owner will read this to their client.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
