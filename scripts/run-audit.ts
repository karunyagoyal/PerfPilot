/**
 * PerfPilot — Layer 1
 * Usage: npx tsx scripts/run-audit.ts https://example.com
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { runLighthouse, fetchCrux, generateReport } from "../lib/audit.js";

// ---------------------------------------------------------------------------
// Load .env manually (no dotenv dependency)
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length && !key.startsWith("#")) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
}

const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] ?? "";

if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
  console.error("\n❌  Set GEMINI_API_KEY in your .env file");
  console.error("     Get a free key at: https://aistudio.google.com/app/apikey\n");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const url = process.argv[2];

  if (!url) {
    console.error("\nUsage: npx tsx scripts/run-audit.ts <url>\n");
    console.error("  Example: npx tsx scripts/run-audit.ts https://example.com\n");
    process.exit(1);
  }

  try {
    new URL(url);
  } catch {
    console.error(`\n❌  Invalid URL: ${url}\n`);
    process.exit(1);
  }

  console.log(`\n🚀  PerfPilot audit starting for: ${url}`);
  console.log("─".repeat(60));
  console.log("\n🔦  Running Lighthouse audit…  (this takes ~30–60s)");

  const [lh, crux] = await Promise.all([
    runLighthouse(url),
    fetchCrux(url),
  ]);

  console.log("🤖  Asking Gemini to explain the results…");
  const report = await generateReport(url, lh, crux);

  console.log("\n" + "═".repeat(60));
  console.log("  PERFPILOT REPORT");
  console.log("═".repeat(60));
  console.log(report);
  console.log("═".repeat(60));
  console.log("\n✅  Audit complete.\n");
}

main().catch((err) => {
  console.error("\n❌  Error:", err.message ?? err);
  process.exit(1);
});
