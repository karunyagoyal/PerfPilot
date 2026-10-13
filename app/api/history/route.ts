import { NextResponse } from "next/server";
import { getRecentScans } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const scans = await getRecentScans(20);
    return NextResponse.json(scans);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Failed to load history" }, { status: 500 });
  }
}
