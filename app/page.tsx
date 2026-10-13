"use client";

import { useState, useEffect } from "react";
import type { LighthouseMetric, CruxData, LighthouseResult } from "@/lib/audit";

interface ScanResult {
  scanId?: string;
  url: string;
  performanceScore: number;
  metrics: LighthouseResult["metrics"];
  opportunities: LighthouseResult["opportunities"];
  crux: CruxData;
  report: string;
}

interface HistoryItem {
  id: string;
  url: string;
  scanned_at: string;
  lh_score_perf: number;
}

function scoreColor(score: number) {
  if (score >= 90) return "text-green-400";
  if (score >= 50) return "text-orange-400";
  return "text-red-400";
}

function scoreBg(score: number) {
  if (score >= 90) return "border-green-500";
  if (score >= 50) return "border-orange-500";
  return "border-red-500";
}

function scoreDot(score: number) {
  if (score >= 90) return "bg-green-400";
  if (score >= 50) return "bg-orange-400";
  return "bg-red-400";
}

function MetricCard({ label, metric }: { label: string; metric: LighthouseMetric }) {
  const scoreClass =
    metric.score === null
      ? "text-gray-400"
      : metric.score >= 0.9
      ? "text-green-400"
      : metric.score >= 0.5
      ? "text-orange-400"
      : "text-red-400";

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-xl font-bold ${scoreClass}`}>
        {metric.displayValue ?? "—"}
      </div>
    </div>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setHistory(data); })
      .catch(() => {});
  }, []);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setResult(data);
      // Prepend to history
      if (data.scanId) {
        setHistory((prev) => [
          { id: data.scanId, url: data.url, scanned_at: new Date().toISOString(), lh_score_perf: data.performanceScore },
          ...prev,
        ]);
      }
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">
          <span className="text-blue-400">Perf</span>Pilot
        </h1>
        <p className="text-gray-400 text-lg">
          Lighthouse + real-user data + AI report — in one click
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleScan} className="flex gap-3 mb-10">
        <input
          type="url"
          required
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          {loading ? "Scanning…" : "Scan →"}
        </button>
      </form>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4 animate-pulse">🔦</div>
          <p className="text-lg">Running audit… (~60s)</p>
          <p className="text-sm mt-2">Lighthouse is analysing the page</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-red-300 mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-8">
          {/* Score */}
          <div className={`border-4 ${scoreBg(result.performanceScore)} rounded-2xl p-8 text-center`}>
            <div className="text-sm text-gray-400 uppercase tracking-widest mb-2">Performance Score</div>
            <div className={`text-7xl font-black ${scoreColor(result.performanceScore)}`}>
              {result.performanceScore}
            </div>
            <div className="text-gray-500 mt-1 text-sm">{result.url}</div>
          </div>

          {/* Metrics grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-300">Lab Metrics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard label="LCP" metric={result.metrics.lcp} />
              <MetricCard label="INP" metric={result.metrics.inp} />
              <MetricCard label="CLS" metric={result.metrics.cls} />
              <MetricCard label="FCP" metric={result.metrics.fcp} />
              <MetricCard label="TTFB" metric={result.metrics.ttfb} />
              <MetricCard label="TBT" metric={result.metrics.tbt} />
              <MetricCard label="Speed Index" metric={result.metrics.speedIndex} />
            </div>
          </div>

          {/* Opportunities */}
          {result.opportunities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-300">Top Opportunities</h2>
              <ul className="space-y-2">
                {result.opportunities.map((o, i) => (
                  <li key={i} className="bg-gray-800 rounded-lg px-4 py-3 flex justify-between items-start gap-4">
                    <span className="text-gray-200 text-sm">{o.title}</span>
                    {o.savings && (
                      <span className="text-orange-400 text-sm font-mono whitespace-nowrap">{o.savings}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CrUX panel */}
          {result.crux.source !== "unavailable" && (
            <div>
              <h2 className="text-lg font-semibold mb-4 text-gray-300">
                Real-User Data{" "}
                <span className="text-xs text-gray-500 font-normal">
                  (CrUX {result.crux.source}-level, mobile p75)
                </span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {result.crux.lcp_p75 !== null && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">LCP</div>
                    <div className={`text-xl font-bold ${result.crux.lcp_p75 <= 2.5 ? "text-green-400" : result.crux.lcp_p75 <= 4 ? "text-orange-400" : "text-red-400"}`}>
                      {result.crux.lcp_p75.toFixed(2)}s
                    </div>
                  </div>
                )}
                {result.crux.inp_p75 !== null && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">INP</div>
                    <div className={`text-xl font-bold ${result.crux.inp_p75 <= 200 ? "text-green-400" : result.crux.inp_p75 <= 500 ? "text-orange-400" : "text-red-400"}`}>
                      {result.crux.inp_p75}ms
                    </div>
                  </div>
                )}
                {result.crux.cls_p75 !== null && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">CLS</div>
                    <div className={`text-xl font-bold ${result.crux.cls_p75 <= 0.1 ? "text-green-400" : result.crux.cls_p75 <= 0.25 ? "text-orange-400" : "text-red-400"}`}>
                      {result.crux.cls_p75.toFixed(3)}
                    </div>
                  </div>
                )}
                {result.crux.fcp_p75 !== null && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">FCP</div>
                    <div className={`text-xl font-bold ${result.crux.fcp_p75 <= 1.8 ? "text-green-400" : result.crux.fcp_p75 <= 3 ? "text-orange-400" : "text-red-400"}`}>
                      {result.crux.fcp_p75.toFixed(2)}s
                    </div>
                  </div>
                )}
                {result.crux.ttfb_p75 !== null && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">TTFB</div>
                    <div className={`text-xl font-bold ${result.crux.ttfb_p75 <= 0.8 ? "text-green-400" : result.crux.ttfb_p75 <= 1.8 ? "text-orange-400" : "text-red-400"}`}>
                      {result.crux.ttfb_p75.toFixed(2)}s
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Report */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-300">AI Report</h2>
            <pre className="bg-gray-800 rounded-lg p-6 text-gray-200 text-sm whitespace-pre-wrap leading-relaxed font-mono">
              {result.report}
            </pre>
          </div>
        </div>
      )}

      {/* Scan History */}
      {history.length > 0 && (
        <div className="mt-16">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Recent Scans</h2>
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="bg-gray-800 rounded-lg px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${scoreDot(item.lh_score_perf)}`} />
                  <span className="text-gray-200 text-sm truncate">{item.url}</span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className={`text-sm font-bold ${scoreColor(item.lh_score_perf)}`}>
                    {item.lh_score_perf}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.scanned_at).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
