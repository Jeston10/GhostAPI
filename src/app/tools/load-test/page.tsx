"use client";

import { CinematicFooter } from "@/components/ui/motion-footer";
import { SiteNav } from "@/components/layout/site-nav";
import {
  Activity,
  ArrowLeft,
  ArrowDownToLine,
  CheckCircle2,
  CircleAlert,
  Gauge,
  Loader2,
  Play,
  Square,
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"] as const;
const DEFAULT_HEADERS = "{\n  \"content-type\": \"application/json\"\n}";
const DEFAULT_ADVANCED = "{\n  \"profile\": {\n    \"type\": \"steady\",\n    \"thinkTimeMinMs\": 200,\n    \"thinkTimeMaxMs\": 800\n  },\n  \"thresholds\": {\n    \"maxP95Ms\": 1200,\n    \"maxErrorRate\": 0.05\n  },\n  \"auth\": {\n    \"type\": \"none\"\n  },\n  \"scenario\": {\n    \"steps\": []\n  }\n}";

const panel = "border border-slate-200 bg-white";
const inputBase =
  "h-9 w-full border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-[#050040] focus:ring-1 focus:ring-[#050040]/25 rounded-none";
const textareaBase =
  "w-full border border-slate-300 bg-white px-2.5 py-2 text-sm font-mono text-slate-800 outline-none transition-colors focus:border-[#050040] focus:ring-1 focus:ring-[#050040]/25 rounded-none";
const chip =
  "border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600";
const btnGhost =
  "inline-flex items-center justify-center border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#050040] transition-colors hover:bg-slate-50 rounded-none";
const btnPrimary =
  "inline-flex w-full items-center justify-center gap-2 border border-[#050040] bg-[#050040] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#070052] disabled:cursor-not-allowed disabled:opacity-60 rounded-none";
const btnSecondary =
  "inline-flex w-full items-center justify-center gap-2 border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 rounded-none";
const statRow =
  "flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2 text-sm";

type LiveMetrics = {
  total: number;
  success: number;
  failed: number;
  avg: number;
  p95: number;
  p99: number;
  rps: number;
  inFlight?: number;
  throttledCount?: number;
  statusCodeGroups?: Record<string, number>;
  errors?: Record<string, number>;
  timeBuckets?: Array<{
    ts: number;
    total: number;
    success: number;
    failed: number;
    p95: number;
    p99: number;
    avg: number;
    rps: number;
  }>;
};

type TestConfig = {
  url: string;
  method: (typeof METHODS)[number];
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  vus: number;
  parallelRequests: number;
  duration: number;
  profile?: Record<string, unknown>;
  auth?: Record<string, unknown>;
  scenario?: Record<string, unknown>;
  thresholds?: Record<string, unknown>;
};

export default function LoadTestPage() {
  const [url, setUrl] = React.useState("");
  const [method, setMethod] = React.useState<(typeof METHODS)[number]>("GET");
  const [headersText, setHeadersText] = React.useState(DEFAULT_HEADERS);
  const [bodyText, setBodyText] = React.useState("{}\n");
  const [vus, setVus] = React.useState(10);
  const [parallelRequests, setParallelRequests] = React.useState(3);
  const [duration, setDuration] = React.useState(15);
  const [advancedText, setAdvancedText] = React.useState(DEFAULT_ADVANCED);

  const [headerError, setHeaderError] = React.useState<string | null>(null);
  const [bodyError, setBodyError] = React.useState<string | null>(null);
  const [advancedError, setAdvancedError] = React.useState<string | null>(null);
  const [urlError, setUrlError] = React.useState<string | null>(null);

  const [running, setRunning] = React.useState(false);
  const [testId, setTestId] = React.useState<string | null>(null);
  const [metrics, setMetrics] = React.useState<LiveMetrics>({
    total: 0,
    success: 0,
    failed: 0,
    avg: 0,
    p95: 0,
    p99: 0,
    rps: 0,
  });
  const [lastConfig, setLastConfig] = React.useState<TestConfig | null>(null);
  const [status, setStatus] = React.useState("Idle");
  const [queueWaitMs, setQueueWaitMs] = React.useState(0);
  const [thresholdSummary, setThresholdSummary] = React.useState<{
    passed: boolean;
    checks: Array<{ name: string; passed: boolean; expected: string; actual: string }>;
  } | null>(null);
  const [recentRuns, setRecentRuns] = React.useState<Array<{ id: string; status: string; updatedAt: string }>>([]);
  const [compareIds, setCompareIds] = React.useState({ baseline: "", current: "" });
  const [compareResult, setCompareResult] = React.useState<Record<string, unknown> | null>(null);

  const resultsRef = React.useRef<HTMLDivElement | null>(null);

  const concurrentRequests = vus * parallelRequests;

  const verdict = React.useMemo(() => {
    if (metrics.total === 0) return { tone: "neutral" as const, text: "Run a test to see the verdict." };
    const errorRate = metrics.total ? metrics.failed / metrics.total : 0;
    if (errorRate > 0.2) {
      return { tone: "bad" as const, text: "Fails under load: error rate is too high." };
    }
    if (metrics.p95 > 1500 || errorRate > 0.05) {
      return { tone: "warn" as const, text: "Degraded under load: elevated p95 latency or errors." };
    }
    return { tone: "good" as const, text: "Stable under load: low errors and acceptable latency." };
  }, [metrics]);

  React.useEffect(() => {
    if (!testId) return;

    let active = true;

    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/tests/${testId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setMetrics(data.metrics as LiveMetrics);
        setRunning(Boolean(data.running));
        setQueueWaitMs(Number(data.queueWaitMs ?? 0));
        setThresholdSummary(data.thresholds ?? null);
        setStatus(String(data.status ?? (data.running ? "Running" : "Completed")));
      } catch {
        setStatus("Completed");
        setRunning(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [testId]);

  const handleJsonFormat = (
    value: string,
    setValue: (next: string) => void,
    setError: (error: string | null) => void
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
    if (!value.trim()) {
      return { value: null as Record<string, unknown> | null, error: null as string | null };
    }
    try {
      const parsed = JSON.parse(value);
      return { value: parsed as Record<string, unknown>, error: null as string | null };
    } catch {
      return { value: null as Record<string, unknown> | null, error: "Invalid JSON." };
    }
  };

  const handleRunTest = async () => {
    setUrlError(null);
    if (!url.trim()) {
      setUrlError("API URL is required.");
      return;
    }

    const headerResult = parseJson(headersText);
    const bodyResult = parseJson(bodyText);
    const advancedResult = parseJson(advancedText);
    setHeaderError(headerResult.error);
    setBodyError(bodyResult.error);
    setAdvancedError(advancedResult.error);

    if (headerResult.error || bodyResult.error || advancedResult.error) return;

    const config: TestConfig = {
      url: url.trim(),
      method,
      headers: (headerResult.value ?? {}) as Record<string, string>,
      body: bodyResult.value as Record<string, unknown> | null,
      vus,
      parallelRequests,
      duration,
      ...(advancedResult.value ?? {}),
    };

    setRunning(true);
    setStatus("Starting...");
    setMetrics({
      total: 0,
      success: 0,
      failed: 0,
      avg: 0,
      p95: 0,
      p99: 0,
      rps: 0,
    });

    try {
      const res = await fetch("/api/tests/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json();
        setStatus(data?.error ?? "Failed to start test.");
        setRunning(false);
        return;
      }

      const data = await res.json();
      setTestId(data.id as string);
      setLastConfig(config);
      setStatus(String(data.status ?? "Running"));
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      void loadRecentRuns();
    } catch {
      setStatus("Failed to start test.");
      setRunning(false);
    }
  };

  const handleStopTest = async () => {
    if (!testId) return;
    await fetch(`/api/tests/${testId}/stop`, { method: "POST" }).catch(() => null);
    setStatus("Stopping...");
  };

  const loadRecentRuns = React.useCallback(async () => {
    const res = await fetch("/api/tests/history?limit=10");
    if (!res.ok) return;
    const data = await res.json();
    const runs = Array.isArray(data.runs) ? data.runs : [];
    setRecentRuns(
      runs.map((run: Record<string, unknown>) => ({
        id: String(run.id ?? ""),
        status: String(run.status ?? "unknown"),
        updatedAt: String(run.updatedAt ?? ""),
      }))
    );
  }, []);

  const handleCompare = async () => {
    if (!compareIds.baseline || !compareIds.current) return;
    const res = await fetch(
      `/api/tests/compare?baseline=${encodeURIComponent(compareIds.baseline)}&current=${encodeURIComponent(
        compareIds.current
      )}`
    );
    if (!res.ok) return;
    const data = await res.json();
    setCompareResult(data as Record<string, unknown>);
  };

  React.useEffect(() => {
    void loadRecentRuns();
  }, [loadRecentRuns]);

  const downloadReport = () => {
    if (!lastConfig) return;
    const report = {
      metrics,
      config: lastConfig,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `load-test-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#050040]">
      <header className="border-b border-slate-200 bg-white">
        <SiteNav currentPage="api-testing" variant="compact" />
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-5 md:px-8 lg:px-10">
        <nav aria-label="Breadcrumb" className="mb-5 border-b border-slate-200 pb-4">
          <Link
            href="/tools/api-testing"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition-colors hover:text-[#050040]"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Back to API Testing
          </Link>
        </nav>

        <header className={`${panel} mb-6`}>
          <div className="border-b border-slate-200 px-4 py-5 sm:px-5 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  API Testing · Load
                </p>
                <h1 className="text-xl font-bold leading-snug tracking-tight text-[#050040] sm:text-2xl">
                  Validate API performance under concurrent load
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                  Configure virtual users, parallel requests, and duration. This page is{" "}
                  <span className="font-semibold text-slate-800">load testing only</span>—not stress, spike, or
                  endurance runs.
                </p>
                <ul className="flex flex-wrap gap-2" role="list">
                  <li className={chip}>VUs + concurrency</li>
                  <li className={chip}>Live p95 / p99</li>
                  <li className={chip}>JSON export</li>
                </ul>
              </div>
              <div className="flex shrink-0 flex-col gap-2 border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <p className={`${chip} text-[#050040]`}>Live mode: steady load</p>
                <p className="border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600">
                  Stress / spike / soak workflows live elsewhere.
                </p>
              </div>
            </div>
          </div>
          <div className="grid divide-y divide-slate-200 bg-slate-50 text-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <QuickInfo label="Purpose" value="Stable performance under expected concurrent load." />
            <QuickInfo label="Not included" value="Breaking-point, spike, or long soak tests." />
            <QuickInfo label="Who uses this" value="Backend, QA, and release checks." />
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-start xl:grid-cols-[1fr_300px]">
          <div className="space-y-0">
            <section className={`${panel} p-4 sm:p-5`}>
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[#050040]">Request</h2>
                <p className="mt-1 text-xs text-slate-600">
                  Target URL and payload. Localhost and private IPs are blocked.
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="space-y-2 py-4 first:pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Endpoint</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                    <label className="sm:w-32 shrink-0">
                      <span className="sr-only">HTTP Method</span>
                      <select
                        value={method}
                        onChange={(event) => setMethod(event.target.value as typeof method)}
                        className={inputBase}
                      >
                        {METHODS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">API URL</span>
                      <input
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder="https://api.example.com/v1/orders"
                        className={inputBase}
                      />
                    </label>
                  </div>
                  {urlError ? <span className="text-xs text-rose-600">{urlError}</span> : null}
                </div>

                <div className="space-y-2 py-4">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Headers (JSON)
                    </p>
                    <button
                      type="button"
                      onClick={() => handleJsonFormat(headersText, setHeadersText, setHeaderError)}
                      className={btnGhost}
                    >
                      Format
                    </button>
                  </div>
                  <textarea
                    value={headersText}
                    onChange={(event) => {
                      setHeadersText(event.target.value);
                      setHeaderError(null);
                    }}
                    onBlur={() => handleJsonFormat(headersText, setHeadersText, setHeaderError)}
                    rows={4}
                    className={`${textareaBase} min-h-[96px]`}
                    aria-label="Request headers as JSON"
                  />
                  <p className="text-[11px] text-slate-500">Optional. Formatted on blur.</p>
                  {headerError ? <span className="text-xs text-rose-600">{headerError}</span> : null}
                </div>

                <div className="space-y-2 py-4">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Body (JSON)</p>
                    <button
                      type="button"
                      onClick={() => handleJsonFormat(bodyText, setBodyText, setBodyError)}
                      className={btnGhost}
                    >
                      Format
                    </button>
                  </div>
                  <textarea
                    value={bodyText}
                    onChange={(event) => {
                      setBodyText(event.target.value);
                      setBodyError(null);
                    }}
                    onBlur={() => handleJsonFormat(bodyText, setBodyText, setBodyError)}
                    rows={4}
                    className={`${textareaBase} min-h-[96px]`}
                    aria-label="Request body as JSON"
                  />
                  <p className="text-[11px] text-slate-500">Optional for GET.</p>
                  {bodyError ? <span className="text-xs text-rose-600">{bodyError}</span> : null}
                </div>

                <div className="space-y-2 py-4">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Advanced (JSON)
                    </p>
                    <button
                      type="button"
                      onClick={() => handleJsonFormat(advancedText, setAdvancedText, setAdvancedError)}
                      className={btnGhost}
                    >
                      Format
                    </button>
                  </div>
                  <textarea
                    value={advancedText}
                    onChange={(event) => {
                      setAdvancedText(event.target.value);
                      setAdvancedError(null);
                    }}
                    onBlur={() => handleJsonFormat(advancedText, setAdvancedText, setAdvancedError)}
                    rows={8}
                    className={textareaBase}
                    aria-label="Advanced configuration as JSON"
                  />
                  <p className="text-[11px] text-slate-500">Profile, auth, scenario, thresholds, tags.</p>
                  {advancedError ? <span className="text-xs text-rose-600">{advancedError}</span> : null}
                </div>

                <div className="space-y-3 py-4">
                  <div className="border border-slate-200 bg-slate-50 px-3 py-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Load profile</h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Concurrency multiplies quickly—start small, then ramp.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <label className="grid gap-1 text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5 normal-case text-slate-600">
                          <Users className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          Virtual users
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={vus}
                          onChange={(event) => setVus(Number(event.target.value))}
                          className={inputBase}
                        />
                        <span className="font-normal text-[11px] text-slate-500">1–50</span>
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5 normal-case text-slate-600">
                          <Gauge className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          Parallel / user
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={parallelRequests}
                          onChange={(event) => setParallelRequests(Number(event.target.value))}
                          className={inputBase}
                        />
                        <span className="font-normal text-[11px] text-slate-500">1–10</span>
                      </label>
                      <label className="grid gap-1 text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5 normal-case text-slate-600">
                          <Timer className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                          Duration (s)
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={duration}
                          onChange={(event) => setDuration(Number(event.target.value))}
                          className={inputBase}
                        />
                        <span className="font-normal text-[11px] text-slate-500">1–60</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-4">
            <section className={`${panel} p-4`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[#050040]">Run</h3>
                <span className="text-[11px] font-semibold text-slate-500">{running ? "Active" : "Ready"}</span>
              </div>
              <div className="mt-3 space-y-3 text-sm">
                <div className="border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Load preview</p>
                  <p className="mt-1 font-mono text-xs text-slate-800">
                    {vus} × {parallelRequests} ={" "}
                    <span className="font-semibold text-[#050040]">{concurrentRequests}</span> concurrent
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Higher values increase RPS.</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className={statRow}>
                    <span className="text-slate-600">Status</span>
                    <span className="font-semibold text-slate-800">{status}</span>
                  </div>
                  <div className={statRow}>
                    <span className="text-slate-600">Concurrent</span>
                    <span className="font-mono font-semibold text-slate-800">{concurrentRequests}</span>
                  </div>
                  <div className={statRow}>
                    <span className="text-slate-600">Duration</span>
                    <span className="font-mono font-semibold text-slate-800">{duration}s</span>
                  </div>
                  <div className={statRow}>
                    <span className="text-slate-600">Queue wait</span>
                    <span className="font-mono font-semibold text-slate-800">{queueWaitMs}ms</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button type="button" onClick={handleRunTest} disabled={running} className={btnPrimary}>
                  {running ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Play className="h-4 w-4" aria-hidden />
                  )}
                  Run load test
                </button>
                <button
                  type="button"
                  onClick={handleStopTest}
                  disabled={!testId || !running}
                  className={btnSecondary}
                >
                  <Square className="h-4 w-4" aria-hidden />
                  Stop
                </button>
              </div>
            </section>

            <section className={`${panel} p-4`}>
              <h3 className="text-xs font-bold uppercase tracking-wide text-[#050040]">Safety</h3>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                <li className="flex gap-2">
                  <span className="text-slate-400" aria-hidden>
                    ·
                  </span>
                  Localhost / private IPs blocked.
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400" aria-hidden>
                    ·
                  </span>
                  Request timeout capped at 5s.
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400" aria-hidden>
                    ·
                  </span>
                  Last 5,000 timings retained.
                </li>
                <li className="flex gap-2">
                  <span className="text-slate-400" aria-hidden>
                    ·
                  </span>
                  Load tests only on this route.
                </li>
              </ul>
            </section>
          </aside>
        </div>

        <section
          ref={resultsRef}
          className={`${panel} mt-8 border-t-2 border-t-[#050040]/15 p-4 sm:mt-10 sm:p-5`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Live metrics · ~2s refresh
              </p>
              <h2 className="mt-1 text-lg font-bold text-[#050040]">Performance</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={
                  running
                    ? "border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800"
                    : "border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700"
                }
              >
                {running ? "Running" : "Idle / done"}
              </span>
              <span className="text-xs font-semibold text-slate-600">{status}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <MetricCard label="Total requests" value={metrics.total} icon={Activity} />
            <MetricCard label="Success" value={metrics.success} icon={CheckCircle2} />
            <MetricCard label="Failed" value={metrics.failed} icon={CircleAlert} />
            <MetricCard label="Avg latency" value={`${metrics.avg.toFixed(1)} ms`} icon={Timer} />
            <MetricCard label="P95" value={`${metrics.p95.toFixed(1)} ms`} icon={Gauge} />
            <MetricCard label="P99" value={`${metrics.p99.toFixed(1)} ms`} icon={Gauge} />
            <MetricCard label="RPS" value={metrics.rps.toFixed(2)} icon={Activity} />
            <MetricCard label="In-flight" value={metrics.inFlight ?? 0} icon={Activity} />
            <MetricCard label="Throttled" value={metrics.throttledCount ?? 0} icon={CircleAlert} />
          </div>

          <div
            className={`mt-4 border px-3 py-3 ${
              verdict.tone === "good"
                ? "border-emerald-200 bg-emerald-50/80"
                : verdict.tone === "warn"
                  ? "border-amber-200 bg-amber-50/80"
                  : verdict.tone === "bad"
                    ? "border-rose-200 bg-rose-50/80"
                    : "border-slate-200 bg-slate-50"
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Verdict</p>
            <p
              className={`mt-1 text-sm font-semibold leading-snug ${
                verdict.tone === "good"
                  ? "text-emerald-900"
                  : verdict.tone === "warn"
                    ? "text-amber-900"
                    : verdict.tone === "bad"
                      ? "text-rose-900"
                      : "text-slate-800"
              }`}
            >
              {verdict.text}
            </p>
          </div>

          {thresholdSummary && thresholdSummary.checks.length > 0 ? (
            <div className="mt-4 border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Threshold checks</p>
              <div className="mt-2 divide-y divide-slate-100 border border-slate-100">
                {thresholdSummary.checks.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className={item.passed ? "text-emerald-800" : "text-rose-800"}>
                      {item.passed ? "Pass" : "Fail"} · {item.actual} (target {item.expected})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">HTTP status</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {Object.entries(metrics.statusCodeGroups ?? {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-baseline justify-between border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-mono font-semibold text-slate-800">{key}</span>
                    <span className="text-slate-600">{String(value)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-500">Errors</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {Object.entries(metrics.errors ?? {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-baseline justify-between border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{key}</span>
                    <span className="text-slate-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Latency · 5s buckets
              </p>
              <div className="mt-2 max-h-52 space-y-1 overflow-y-auto">
                {(metrics.timeBuckets ?? []).slice(-8).map((bucket) => (
                  <div
                    key={bucket.ts}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-mono font-semibold text-slate-800">
                      {new Date(bucket.ts).toLocaleTimeString()}
                    </span>
                    <span className="text-slate-600">p95 {bucket.p95.toFixed(0)}ms</span>
                    <span className="text-slate-600">rps {bucket.rps.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                History & compare
              </p>
              <button type="button" onClick={loadRecentRuns} className={btnGhost}>
                Refresh
              </button>
            </div>
            <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
              {recentRuns.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => setCompareIds((prev) => ({ ...prev, current: run.id }))}
                  className="flex w-full items-center justify-between border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-slate-100"
                >
                  <span className="font-mono text-slate-800">{run.id.slice(0, 10)}…</span>
                  <span className="text-slate-600">{run.status}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                value={compareIds.baseline}
                onChange={(event) =>
                  setCompareIds((prev) => ({ ...prev, baseline: event.target.value.trim() }))
                }
                placeholder="Baseline run ID"
                className={`${inputBase} h-8 text-xs`}
              />
              <input
                value={compareIds.current}
                onChange={(event) =>
                  setCompareIds((prev) => ({ ...prev, current: event.target.value.trim() }))
                }
                placeholder="Current run ID"
                className={`${inputBase} h-8 text-xs`}
              />
            </div>
            <button type="button" onClick={handleCompare} className={`${btnGhost} mt-2 w-full sm:w-auto`}>
              Compare runs
            </button>
            {compareResult ? (
              <pre className="mt-2 max-h-48 overflow-auto border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800">
                {JSON.stringify(compareResult, null, 2)}
              </pre>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-600">Export JSON: metrics, config, timestamp.</p>
            <button
              type="button"
              onClick={downloadReport}
              disabled={!lastConfig}
              className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowDownToLine className="h-4 w-4 shrink-0" aria-hidden />
              Download report
            </button>
          </div>
        </section>
      </main>

      <CinematicFooter />
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  icon: typeof Activity;
};

function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <div className="border border-slate-200 bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
      </div>
      <p className="mt-1 font-mono text-lg font-bold tabular-nums text-[#050040]">{value}</p>
    </div>
  );
}

type QuickInfoProps = {
  label: string;
  value: string;
};

function QuickInfo({ label, value }: QuickInfoProps) {
  return (
    <div className="px-4 py-3 sm:px-5">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium leading-snug text-slate-800">{value}</p>
    </div>
  );
}
