import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";

export async function saveScan(data: {
  url: string;
  lh_score_perf: number;
  lh_raw_json: object;
  crux_json: object | null;
}) {
  return prisma.scan.create({
    data: {
      ...data,
      crux_json: data.crux_json ?? Prisma.JsonNull,
    },
  });
}

export async function saveAiReport(data: {
  scan_id: string;
  summary_text: string;
  fixes_json: object;
}) {
  return prisma.aiReport.create({ data });
}

export async function getRecentScans(limit = 20) {
  return prisma.scan.findMany({
    orderBy: { scanned_at: "desc" },
    take: limit,
    select: { id: true, url: true, scanned_at: true, lh_score_perf: true },
  });
}
