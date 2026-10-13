import { NextRequest, NextResponse } from "next/server";
import { runLighthouse, fetchCrux, generateReport } from "@/lib/audit";
import { saveScan, saveAiReport } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let url: string;
  try {
    const body = await req.json();
    url = body.url;
    if (!url || typeof url !== "string") throw new Error("missing url");
    new URL(url); // validate
  } catch {
    return NextResponse.json({ error: "Invalid or missing URL" }, { status: 400 });
  }

  const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] ?? "";
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured on the server" }, { status: 500 });
  }

  try {
    const [lh, crux] = await Promise.all([runLighthouse(url), fetchCrux(url)]);
    const report = await generateReport(url, lh, crux);

    // Save to database (fire-and-forget errors so a DB issue never fails the scan)
    let scanId: string | undefined;
    try {
      const scan = await saveScan({
        url,
        lh_score_perf: lh.performanceScore,
        lh_raw_json: { metrics: lh.metrics, opportunities: lh.opportunities },
        crux_json: crux,
      });
      scanId = scan.id;
      await saveAiReport({
        scan_id: scan.id,
        summary_text: report,
        fixes_json: lh.opportunities,
      });
    } catch (dbErr: any) {
      console.error("DB save failed (scan still returned):", dbErr?.message);
    }

    return NextResponse.json({
      scanId,
      url,
      performanceScore: lh.performanceScore,
      metrics: lh.metrics,
      opportunities: lh.opportunities,
      crux,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Audit failed" }, { status: 500 });
  }
}
