"use client";

import { CinematicFooter } from "@/components/ui/motion-footer";
import { SiteNav } from "@/components/layout/site-nav";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  Gauge,
  Loader2,
  Play,
  Square,
  Timer,
  Zap,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as const;
const DEFAULT_HEADERS = '{\n  "content-type": "application/json"\n}';

const panel = "border border-slate-200 bg-white";
const inputBase =
  "h-9 w-full border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-[#050040] focus:ring-1 focus:ring-[#050040]/25 rounded-none";
const inputQuick =
  "h-9 w-full border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/25 rounded-none";
const textareaBase =
  "w-full border border-slate-300 bg-white px-2.5 py-2 text-sm font-mono text-slate-800 outline-none transition-colors focus:border-[#050040] focus:ring-1 focus:ring-[#050040]/25 rounded-none";
const textareaQuick =
  "w-full border border-slate-300 bg-white px-2.5 py-2 text-sm font-mono text-slate-800 outline-none transition-colors focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700/25 rounded-none";
const chipSky =
  "border border-slate-200 bg-sky-50/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-800";
const chipQuick =
  "border border-slate-200 bg-emerald-50/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800";
const btnGhost =
  "inline-flex items-center justify-center border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#050040] transition-colors hover:bg-slate-50 rounded-none";
const btnGhostQuick =
  "inline-flex items-center justify-center border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-50/80 rounded-none";
/** Compact pill segmented control (modern app pattern) */
const modeSwitchTrack =
  "inline-flex shrink-0 items-center rounded-full border border-slate-200/90 bg-slate-100/95 p-0.5 shadow-[inset_0_1px_2px_rgba(15,23,42,0.06)] sm:ml-auto";
const modeSwitchBtn =
  "relative select-none rounded-full px-2.5 py-1.5 text-[11px] font-semibold leading-none tracking-tight transition-[color,box-shadow,background-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-100 sm:px-3.5 sm:py-2 sm:text-[12px]";
const modeSwitchBtnOn =
  "bg-white text-[#050040] shadow-[0_1px_2px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.06)]";
const modeSwitchBtnOnQuick =
  "bg-white text-emerald-900 shadow-[0_1px_2px_rgba(5,46,22,0.06),0_0_0_1px_rgba(16,185,129,0.28)]";
const modeSwitchBtnOff =
  "text-slate-500 hover:text-slate-800";

type Summary = {
  totalRequests: number;
  successCount: number;
  failureCount: number;
  failureRate: number;
  httpErrorRate: number;
  avgLatency: number | null;
  p50: number | null;
  p90: number | null;
  p95: number | null;
  p99: number | null;
  minTotalMs: number | null;
  maxTotalMs: number | null;
  rps: number;
  inFlight: number;
};

type Timing = {
  avgTTFB: number | null;
  avgDownload: number | null;
  p95Ttfb: number | null;
  p95Download: number | null;
};

type SpeedPollPayload = {
  summary: Summary;
  timing: Timing;
  statusGroups: Record<string, number>;
  errors: { timeout: number; network: number };
  timeBuckets: Array<{
    ts: number;
    total: number;
    completed: number;
    transportFailed: number;
    p95: number | null;
    rps: number;
    avgTotalMs: number | null;
  }>;
};

type QuickSuccess = {
  success: true;
  status: number;
  statusText: string;
  totalTime: number;
  ttfb: number;
  downloadTime: number;
  size: number;
};

type QuickFailure = {
  success: false;
  error: "timeout" | "network";
  totalTime: null;
  ttfb: null;
  downloadTime: null;
  size: null;
};

type QuickResult = QuickSuccess | QuickFailure;

function fmtMs(value: number | null, fractionDigits = 1): string {
  if (value == null) return "—";
  return `${value.toFixed(fractionDigits)} ms`;
}

function fmtPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export default function SpeedTestPage() {
  const [mode, setMode] = React.useState<"quick" | "load">("quick");

  const [url, setUrl] = React.useState("");
  const [method, setMethod] = React.useState<(typeof METHODS)[number]>("GET");
  const [headersText, setHeadersText] = React.useState(DEFAULT_HEADERS);
  const [bodyText, setBodyText] = React.useState("{}\n");
  const [concurrency, setConcurrency] = React.useState(5);
  const [durationSeconds, setDurationSeconds] = React.useState(20);
  const [timeoutMs, setTimeoutMs] = React.useState(8000);

  const [headerError, setHeaderError] = React.useState<string | null>(null);
  const [bodyError, setBodyError] = React.useState<string | null>(null);
  const [urlError, setUrlError] = React.useState<string | null>(null);

  const [running, setRunning] = React.useState(false);
  const [testId, setTestId] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState("Idle");
  const [lastConfig, setLastConfig] = React.useState<Record<string, unknown> | null>(null);
  const [results, setResults] = React.useState<SpeedPollPayload | null>(null);

  const [quickLoading, setQuickLoading] = React.useState(false);
  const [quickResult, setQuickResult] = React.useState<QuickResult | null>(null);

  const resultsRef = React.useRef<HTMLDivElement | null>(null);
  const quickResultsRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!testId) return;
    let active = true;

    const tick = async () => {
      try {
        const res = await fetch(`/api/speed-tests/${testId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setRunning(Boolean(data.running));
        setStatus(String(data.status ?? "unknown"));
        setResults({
          summary: data.summary as Summary,
          timing: data.timing as Timing,
          statusGroups: data.statusGroups as SpeedPollPayload["statusGroups"],
          errors: data.errors as SpeedPollPayload["errors"],
          timeBuckets: data.timeBuckets as SpeedPollPayload["timeBuckets"],
        });
      } catch {
        setRunning(false);
      }
    };

    tick();
    const id = setInterval(tick, 1500);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [testId]);

  const handleJsonFormat = (
    value: string,
    setValue: (next: string) => void,
    setError: (e: string | null) => void
  ) => {
    if (!value.trim()) {
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch {
      setError("Invalid JSON.");
    }
  };

  const parseJson = (value: string) => {
    if (!value.trim()) return { value: null as Record<string, unknown> | null, error: null as string | null };
    try {
      return { value: JSON.parse(value) as Record<string, unknown>, error: null };
    } catch {
      return { value: null, error: "Invalid JSON." };
    }
  };

  const handleQuickRun = async () => {
    setUrlError(null);
    setQuickResult(null);
    if (!url.trim()) {
      setUrlError("API URL is required.");
      return;
    }

    const h = parseJson(headersText);
    const b = parseJson(bodyText);
    setHeaderError(h.error);
    setBodyError(b.error);
    if (h.error || b.error) return;

    setQuickLoading(true);

    try {
      const res = await fetch("/api/speed/single", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          method,
          headers: (h.value ?? {}) as Record<string, string>,
          body: b.value as Record<string, unknown> | null,
          timeoutMs,
        }),
      });

      const data = (await res.json()) as QuickResult & { error?: string };

      if (!res.ok) {
        setQuickResult({
          success: false,
          error: "network",
          totalTime: null,
          ttfb: null,
          downloadTime: null,
          size: null,
        });
        return;
      }

      if ("success" in data && data.success === false && (data.error === "timeout" || data.error === "network")) {
        setQuickResult(data as QuickFailure);
        return;
      }

      if ("success" in data && data.success === true) {
        setQuickResult(data as QuickSuccess);
      }
    } catch {
      setQuickResult({
        success: false,
        error: "network",
        totalTime: null,
        ttfb: null,
        downloadTime: null,
        size: null,
      });
    } finally {
      setQuickLoading(false);
      quickResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleStart = async () => {
    setUrlError(null);
    if (!url.trim()) {
      setUrlError("API URL is required.");
      return;
    }

    const h = parseJson(headersText);
    const b = parseJson(bodyText);
    setHeaderError(h.error);
    setBodyError(b.error);
    if (h.error || b.error) return;

    const config = {
      url: url.trim(),
      method,
      headers: (h.value ?? {}) as Record<string, string>,
      body: b.value as Record<string, unknown> | null,
      concurrency,
      durationSeconds,
      timeoutMs,
    };

    setRunning(true);
    setStatus("starting");
    setResults(null);

    try {
      const res = await fetch("/api/speed-tests/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(String(data.error ?? "Failed"));
        setRunning(false);
        return;
      }
      setTestId(data.id as string);
      setLastConfig(config);
      setStatus(String(data.status ?? "running"));
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setStatus("Failed to start");
      setRunning(false);
    }
  };

  const handleStop = async () => {
    if (!testId) return;
    await fetch(`/api/speed-tests/${testId}/stop`, { method: "POST" }).catch(() => null);
    setStatus("stopping");
  };

  const downloadReport = () => {
    if (!lastConfig || !results) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            summary: results.summary,
            timing: results.timing,
            statusGroups: results.statusGroups,
            errors: results.errors,
            timeBuckets: results.timeBuckets,
            config: lastConfig,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = `speed-test-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(u);
  };

  const s = results?.summary;
  const t = results?.timing;

  const finput = mode === "quick" ? inputQuick : inputBase;
  const ftextarea = mode === "quick" ? textareaQuick : textareaBase;
  const fghost = mode === "quick" ? btnGhostQuick : btnGhost;

  const requestFields = (
    <>
      <div className="space-y-2 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Endpoint</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <label className="w-full shrink-0 sm:w-36">
            <span className="sr-only">Method</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as typeof method)}
              className={finput}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0 flex-1">
            <span className="sr-only">URL</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/health"
              className={finput}
            />
          </label>
        </div>
        {urlError ? <span className="text-xs text-rose-600">{urlError}</span> : null}
      </div>

      <div className="grid gap-6 py-4 xl:grid-cols-2">
        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Headers (JSON)</p>
            <button
              type="button"
              onClick={() => handleJsonFormat(headersText, setHeadersText, setHeaderError)}
              className={fghost}
            >
              Format
            </button>
          </div>
          <textarea
            value={headersText}
            onChange={(e) => {
              setHeadersText(e.target.value);
              setHeaderError(null);
            }}
            onBlur={() => handleJsonFormat(headersText, setHeadersText, setHeaderError)}
            rows={4}
            className={ftextarea}
            aria-label="Headers JSON"
          />
          {headerError ? <span className="text-xs text-rose-600">{headerError}</span> : null}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Body (JSON)</p>
            <button
              type="button"
              onClick={() => handleJsonFormat(bodyText, setBodyText, setBodyError)}
              className={fghost}
            >
              Format
            </button>
          </div>
          <textarea
            value={bodyText}
            onChange={(e) => {
              setBodyText(e.target.value);
              setBodyError(null);
            }}
            onBlur={() => handleJsonFormat(bodyText, setBodyText, setBodyError)}
            rows={4}
            className={ftextarea}
            aria-label="Body JSON"
          />
          {bodyError ? <span className="text-xs text-rose-600">{bodyError}</span> : null}
        </div>
      </div>

      <div className={`grid gap-3 py-4 ${mode === "quick" ? "" : "sm:grid-cols-3"}`}>
        <label className="grid gap-1 text-xs font-semibold text-slate-700 sm:col-span-1">
          <span className="flex items-center gap-1 text-slate-600">
            <Gauge className="h-3.5 w-3.5" aria-hidden />
            Timeout (ms)
          </span>
          <input
            type="number"
            min={mode === "quick" ? 1000 : 2000}
            max={15000}
            step={500}
            value={timeoutMs}
            onChange={(e) => setTimeoutMs(Number(e.target.value))}
            className={finput}
          />
          <span className="font-normal text-[11px] text-slate-500">
            {mode === "quick" ? "1000–15000 (single request)" : "Per request"}
          </span>
        </label>

        {mode === "load" ? (
          <>
            <label className="grid gap-1 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1 text-slate-600">
                <Zap className="h-3.5 w-3.5" aria-hidden />
                Concurrency
              </span>
              <input
                type="number"
                min={1}
                max={20}
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className={finput}
              />
              <span className="font-normal text-[11px] text-slate-500">1–20 parallel</span>
            </label>
            <label className="grid gap-1 text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1 text-slate-600">
                <Timer className="h-3.5 w-3.5" aria-hidden />
                Duration (s)
              </span>
              <input
                type="number"
                min={5}
                max={120}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                className={finput}
              />
              <span className="font-normal text-[11px] text-slate-500">5–120</span>
            </label>
          </>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#050040]">
      <header className="border-b border-slate-200 bg-white">
        <SiteNav currentPage="api-testing" variant="compact" />
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <Link
              href="/tools/api-testing"
              className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                mode === "quick"
                  ? "text-slate-600 hover:text-emerald-800"
                  : "text-slate-600 hover:text-[#050040]"
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Back to API Testing
            </Link>
          </nav>

          <div
            className={modeSwitchTrack}
            role="group"
            aria-label="Testing mode"
          >
            <button
              type="button"
              className={`${modeSwitchBtn} ${mode === "quick" ? modeSwitchBtnOnQuick : modeSwitchBtnOff}`}
              aria-pressed={mode === "quick"}
              aria-label="Quick check"
              title="Quick check"
              onClick={() => setMode("quick")}
            >
              Quick<span className="hidden sm:inline"> check</span>
            </button>
            <button
              type="button"
              className={`${modeSwitchBtn} ${mode === "load" ? modeSwitchBtnOn : modeSwitchBtnOff}`}
              aria-pressed={mode === "load"}
              aria-label="Detailed API test"
              title="Detailed API test"
              onClick={() => {
                setMode("load");
                setQuickResult(null);
              }}
            >
              <span className="whitespace-nowrap">
                Detailed
                <span className="hidden sm:inline"> API test</span>
              </span>
            </button>
          </div>
        </div>

        <header
          className={`${panel} mb-8 overflow-hidden  shadow-sm shadow-slate-200/40`}
        >
          <div
            className={`border-b border-slate-200 bg-gradient-to-r from-white via-white px-4 py-5 sm:px-6 sm:py-7 ${mode === "quick" ? "to-emerald-50/35" : "to-sky-50/40"}`}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] ${mode === "quick" ? "text-emerald-800" : "text-sky-700"}`}
                >
                  API testing · Server-side speed
                </p>
                <h1
                  className={`text-xl font-bold leading-snug tracking-tight sm:text-2xl lg:text-[1.65rem] ${mode === "quick" ? "text-emerald-950" : "text-[#050040]"}`}
                >
                  {mode === "quick"
                    ? "Quick check — one round-trip, precise timing"
                    : "Detailed API test — sustained session with deep metrics"}
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
                  {mode === "quick" ? (
                    <>
                      Fire a single HTTP request from the GhostAPI server. You get DevRoutes-style phases: total
                      time, time-to-headers (TTFB), and download. HTTP 4xx/5xx still include timings; only user
                      timeouts and true transport failures surface as errors.
                    </>
                  ) : (
                    <>
                      Run a bounded worker pool for a set duration: live totals, latency percentiles, TTFB vs download
                      averages, HTTP status groups, and transport error split — export JSON when you are done. Built
                      for API behavior validation, not rebranded &quot;load testing&quot; marketing.
                    </>
                  )}
                </p>
                <ul className="flex flex-wrap gap-2" role="list">
                  {mode === "quick" ? (
                    <>
                      <li className={chipQuick}>Single shot</li>
                      <li className={chipQuick}>TTFB vs download bars</li>
                      <li className={chipQuick}>Server-side clock</li>
                    </>
                  ) : (
                    <>
                      <li className={chipSky}>Percentiles & status split</li>
                      <li className={chipSky}>Time buckets & export</li>
                      <li className={chipSky}>Transport vs HTTP accounting</li>
                    </>
                  )}
                </ul>
                <p
                  className={`text-xs ${mode === "quick" ? "text-emerald-900/70" : "text-sky-900/70"}`}
                >
                  Clock runs on GhostAPI infrastructure (not in your browser).
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 border-t border-slate-200 pt-4 sm:max-w-sm lg:w-72 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                
                <p
                  className={`border px-3 py-2 text-xs leading-relaxed ${mode === "quick" ? "border-emerald-100 bg-emerald-50/60 text-emerald-950/85" : "border-slate-200 bg-sky-50/60 text-sky-950/80"}`}
                >
                  Timings include server egress + target API; for CI-grade load, use dedicated runners (e.g. k6).
                </p>
              </div>
            </div>
          </div>
        </header>

        {mode === "quick" ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <section className={`${panel} border-t-4 border-t-emerald-600 p-4 shadow-sm sm:p-6`}>
              <div className="border-b border-emerald-100 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-950">Request</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Public URLs only — same safety rules as the rest of API testing.
                </p>
              </div>
              <div className="divide-y divide-slate-100">{requestFields}</div>
              <div className="border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={handleQuickRun}
                  disabled={quickLoading}
                  className="inline-flex w-full items-center justify-center gap-2 border border-emerald-700 bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-800 hover:bg-emerald-800 disabled:opacity-60 sm:w-auto sm:min-w-[220px] rounded-none"
                >
                  {quickLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Zap className="h-4 w-4" aria-hidden />
                  )}
                  Run quick check
                </button>
              </div>
            </section>

            <div ref={quickResultsRef} className="min-h-[280px] space-y-6 lg:sticky lg:top-6">
              {quickLoading ? (
                <div
                  className={`${panel} flex flex-col items-center justify-center border border-emerald-100 bg-emerald-50/50 px-6 py-16 text-center`}
                >
                  <Loader2 className="h-8 w-8 shrink-0 animate-spin text-emerald-700" aria-hidden />
                  <p className="mt-4 text-sm font-semibold text-emerald-950">Measuring round-trip…</p>
                  <p className="mt-1 max-w-sm text-xs text-slate-600">
                    Timings are recorded on the GhostAPI server, not in your browser.
                  </p>
                </div>
              ) : null}

              {!quickLoading && quickResult?.success ? (
                <QuickResultsCard
                  data={quickResult}
                  onRunAgain={() => {
                    void handleQuickRun();
                  }}
                />
              ) : null}

              {!quickLoading && quickResult && !quickResult.success ? (
                <div className="border border-rose-200 bg-rose-50/80 px-6 py-8 text-center shadow-sm">
                  <p className="text-sm font-semibold text-rose-900">
                    Request failed: {quickResult.error === "timeout" ? "timeout" : "network"}
                  </p>
                  <p className="mt-2 text-xs text-rose-800">
                    No timing samples — the request did not complete. Try a longer timeout or check the URL.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickResult(null);
                    }}
                    className="mt-6 border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-50 rounded-none"
                  >
                    Dismiss
                  </button>
                </div>
              ) : null}

              {!quickLoading && !quickResult ? (
                <div
                  className={`${panel} border border-dashed border-emerald-200/90 bg-emerald-50/25 p-8 text-center`}
                >
                  <p className="text-sm font-semibold text-emerald-950">Results appear here</p>
                  <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate-600">
                    Configure the request on the left, then run a quick check — TTFB, download, and total land in
                    this panel, aligned with the form.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
            <section className={`${panel} border-t-4 border-t-slate-400 p-4 shadow-sm sm:p-6`}>
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#050040]">Request</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Public URLs only — same safety rules as the rest of API testing.
                </p>
              </div>
              <div className="divide-y divide-slate-100">{requestFields}</div>
            </section>

            <aside className="flex flex-col gap-5 lg:sticky lg:top-6">
              <section className={`${panel} border border-slate-200 bg-sky-50/20 p-5 shadow-sm`}>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-sky-900">Session</h3>
                  <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                    {running ? "Active" : "Ready"}
                  </span>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-700">
                  <span className="font-semibold text-sky-900">{concurrency}</span> parallel workers ·{" "}
                  <span className="font-semibold text-sky-900">{durationSeconds}s</span> window ·{" "}
                  <span className="font-semibold text-sky-900">{timeoutMs}ms</span> per request timeout
                </p>
                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={handleStart}
                    disabled={running}
                    className="inline-flex w-full items-center justify-center gap-2 border border-[#050040] bg-[#050040] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#070052] disabled:cursor-not-allowed disabled:opacity-60 rounded-none"
                  >
                    {running ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Play className="h-4 w-4" aria-hidden />
                    )}
                    Start detailed test
                  </button>
                  <button
                    type="button"
                    onClick={handleStop}
                    disabled={!testId || !running}
                    className="inline-flex w-full items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 rounded-none"
                  >
                    <Square className="h-4 w-4" aria-hidden />
                    Stop session
                  </button>
                </div>
              </section>

              <section className={`${panel} border border-slate-200 p-5 shadow-sm`}>
                <h3 className="text-xs font-bold uppercase tracking-wide text-sky-900">How timing works</h3>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">
                  <li>
                    <strong className="text-sky-950">Total</strong> — until the full body is read.
                  </li>
                  <li>
                    <strong className="text-sky-950">TTFB</strong> — when response headers are available (Node fetch).
                  </li>
                  <li>
                    <strong className="text-sky-950">Download</strong> — streaming the body via{" "}
                    <code className="text-[11px] text-sky-800">arrayBuffer()</code>.
                  </li>
                </ul>
              </section>
            </aside>
          </div>
        )}

        {mode === "load" ? (
          <section
            ref={resultsRef}
            className={`${panel} mt-10 border border-slate-200 border-t-4 border-t-slate-400 bg-white p-4 shadow-sm sm:p-6`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-sky-700">
                  Detailed results · ~1.5s refresh
                </p>
                <h2 className="mt-1 text-lg font-bold text-[#050040]">Live metrics</h2>
                <p className="mt-1 max-w-2xl text-xs text-slate-600">
                  Session aggregates: HTTP completions vs transport failures, RPS buckets, and exportable JSON.
                </p>
              </div>
              <span className="rounded border border-slate-200 bg-sky-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-900">
                {status}
              </span>
            </div>

            {results && s && t ? (
              <>
                <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Stat label="Total requests" value={s.totalRequests} />
                  <Stat label="Completed (HTTP)" value={s.successCount} />
                  <Stat label="Transport failures" value={s.failureCount} />
                  <Stat label="RPS" value={s.rps.toFixed(2)} />
                  <Stat label="Failure rate (transport)" value={fmtPct(s.failureRate)} />
                  <Stat label="HTTP error rate (4xx/5xx)" value={fmtPct(s.httpErrorRate)} />
                  <Stat label="In-flight" value={s.inFlight} />
                  <Stat label="Avg latency (completed)" value={fmtMs(s.avgLatency)} />
                  <Stat label="p95 latency" value={fmtMs(s.p95)} />
                  <Stat label="p99 latency" value={fmtMs(s.p99)} />
                  <Stat label="Min / max" value={`${fmtMs(s.minTotalMs, 0)} / ${fmtMs(s.maxTotalMs, 0)}`} />
                  <Stat label="Avg TTFB" value={fmtMs(t.avgTTFB)} />
                  <Stat label="p95 TTFB" value={fmtMs(t.p95Ttfb)} />
                  <Stat label="Avg download" value={fmtMs(t.avgDownload)} />
                  <Stat label="p95 download" value={fmtMs(t.p95Download)} />
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="border border-slate-200 bg-sky-50/20 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">
                      Percentiles (completed)
                    </p>
                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <dt className="text-slate-600">p50</dt>
                      <dd className="font-mono text-right text-slate-900">{fmtMs(s.p50, 2)}</dd>
                      <dt className="text-slate-600">p90</dt>
                      <dd className="font-mono text-right text-slate-900">{fmtMs(s.p90, 2)}</dd>
                      <dt className="text-slate-600">p95</dt>
                      <dd className="font-mono text-right text-slate-900">{fmtMs(s.p95, 2)}</dd>
                      <dt className="text-slate-600">p99</dt>
                      <dd className="font-mono text-right text-slate-900">{fmtMs(s.p99, 2)}</dd>
                    </dl>
                  </div>
                  <div className="border border-slate-200 bg-white p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">HTTP status groups</p>
                    <dl className="mt-2 grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(results.statusGroups).map(([k, v]) => (
                        <React.Fragment key={k}>
                          <dt className="text-slate-600">{k}</dt>
                          <dd className="font-mono text-right">{v}</dd>
                        </React.Fragment>
                      ))}
                    </dl>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-sky-800">Transport errors</p>
                    <dl className="mt-1 grid grid-cols-2 gap-1 text-xs">
                      <dt className="text-slate-600">timeout</dt>
                      <dd className="font-mono text-right">{results.errors.timeout}</dd>
                      <dt className="text-slate-600">network</dt>
                      <dd className="font-mono text-right">{results.errors.network}</dd>
                    </dl>
                  </div>
                </div>

                <div className="mt-6 border border-slate-200 bg-sky-50/15 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-sky-800">5s buckets · RPS & p95</p>
                  <div className="mt-3 max-h-44 space-y-1.5 overflow-y-auto text-xs">
                    {(results.timeBuckets ?? []).slice(-12).map((b) => (
                      <div
                        key={b.ts}
                        className="flex flex-wrap justify-between gap-2 border border-slate-200/80 bg-white px-2 py-1.5"
                      >
                        <span className="font-mono text-slate-800">{new Date(b.ts).toLocaleTimeString()}</span>
                        <span className="text-slate-600">n={b.total}</span>
                        <span className="text-slate-600">ok={b.completed}</span>
                        <span className="text-slate-600">fail={b.transportFailed}</span>
                        <span className="text-slate-600">rps {b.rps.toFixed(2)}</span>
                        <span className="text-slate-600">p95 {b.p95 != null ? `${b.p95.toFixed(0)}ms` : "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                  <p className="text-xs text-slate-600">
                    Export includes summary, timing, statusGroups, errors, buckets, and session config.
                  </p>
                  <button
                    type="button"
                    onClick={downloadReport}
                    disabled={!lastConfig}
                    className="inline-flex items-center gap-2 border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 disabled:opacity-50"
                  >
                    <ArrowDownToLine className="h-4 w-4" aria-hidden />
                    Download
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-8 flex items-start gap-2 rounded border border-dashed border-slate-300 bg-sky-50/30 px-4 py-5 text-sm text-slate-600">
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                <span>Start a detailed session to stream aggregates from the server engine.</span>
              </p>
            )}
          </section>
        ) : null}
      </main>

      <CinematicFooter />
    </div>
  );
}

function QuickResultsCard({ data, onRunAgain }: { data: QuickSuccess; onRunAgain: () => void }) {
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    setAnimate(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
    return () => cancelAnimationFrame(id);
  }, [data.totalTime, data.ttfb, data.downloadTime, data.status]);

  const total = Math.max(data.totalTime, 1e-6);
  const ttfbPct = (data.ttfb / total) * 100;
  const dlPct = (data.downloadTime / total) * 100;
  const sizeKb = data.size / 1024;

  return (
    <div className="w-full border border-emerald-100 bg-white shadow-md shadow-emerald-900/5">
      <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/80 to-white px-6 py-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-900">Timing breakdown</p>
        <p className="mt-1 text-xs text-slate-600">GhostAPI server clock (not your browser).</p>
      </div>

      <div className="space-y-6 px-6 py-8">
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          <div className="sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total time</p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-950">
              {data.totalTime.toFixed(2)} <span className="text-base font-semibold text-slate-600">ms</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">TTFB</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-emerald-800">{data.ttfb.toFixed(2)} ms</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Download</p>
            <p className="mt-1 font-mono text-xl font-bold tabular-nums text-emerald-700">
              {data.downloadTime.toFixed(2)} ms
            </p>
          </div>
        </div>

        <div className="rounded border border-emerald-100 bg-emerald-50/40 px-4 py-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-900">HTTP status</p>
          <p className="mt-1 font-mono text-base font-semibold text-emerald-950">
            {data.status}{" "}
            <span className="text-sm font-normal text-slate-600">({data.statusText})</span>
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-slate-600">
              <span className="font-semibold text-emerald-900">TTFB</span>
              <span className="font-mono tabular-nums">{data.ttfb.toFixed(2)} ms</span>
            </div>
            <div className="h-3 w-full overflow-hidden bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-emerald-700 to-emerald-500 transition-[width] duration-500 ease-out"
                style={{ width: animate ? `${ttfbPct}%` : "0%" }}
              />
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-slate-600">
              <span className="font-semibold text-emerald-800">Download</span>
              <span className="font-mono tabular-nums">{data.downloadTime.toFixed(2)} ms</span>
            </div>
            <div className="h-3 w-full overflow-hidden bg-slate-100">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-500 transition-[width] duration-500 ease-out"
                style={{ width: animate ? `${dlPct}%` : "0%" }}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 text-sm text-slate-700">
          <div className="flex justify-between gap-4 py-2">
            <span className="text-slate-600">Response size</span>
            <span className="font-mono font-semibold">{sizeKb.toFixed(2)} KB</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onRunAgain}
          className="w-full border border-emerald-800 bg-emerald-800 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 rounded-none"
        >
          Run again
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-sky-800/90">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-semibold text-[#050040]">{value}</p>
    </div>
  );
}
