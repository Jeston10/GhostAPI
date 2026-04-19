"use client";

import { SiteFooter } from "@/components/layout/site-footer";
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
    if (metrics.total === 0) return "Run a test to see the verdict.";
    const errorRate = metrics.total ? metrics.failed / metrics.total : 0;
    if (errorRate > 0.2) return "🔴 Fails under load (high error rate).";
    if (metrics.p95 > 1500 || errorRate > 0.05) {
      return "🟡 Slows under pressure (high p95 latency).";
    }
    return "🟢 Stable under load (low errors, stable latency).";
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
    <div className="min-h-screen bg-slate-100 font-sans text-[#050040]">
      <section className="bg-white text-sm">
        <SiteNav currentPage="api-testing" variant="hero" />
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-5 md:px-16 md:pt-10 lg:px-24 xl:px-32">
        <Link
          href="/tools/api-testing"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#050040] transition hover:text-[#070052]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to API Testing
        </Link>

        <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="bg-white px-5 py-8 md:px-8 md:py-10">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-slate-500">
                  API Testing Tool
                </p>
                <h1 className="mt-2 max-w-5xl text-3xl font-extrabold tracking-tight text-[#050040] md:text-[2.25rem] md:leading-tight">
                  Validate API performance under expected concurrent load
                </h1>
                <p className="mt-4 max-w-4xl text-sm leading-relaxed text-slate-600 md:text-base">
                  Configure virtual users, parallel requests, and duration to simulate realistic traffic
                  patterns. This page is dedicated to <strong>load testing only</strong>.
                </p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  <span className="rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-2.5 py-1">
                    Virtual users + concurrency control
                  </span>
                  <span className="rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-2.5 py-1">
                    Live p95/p99 latency tracking
                  </span>
                  <span className="rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-2.5 py-1">
                    Exportable JSON report
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-1 text-xs font-semibold text-slate-700">
                  Live mode: Load Testing
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-1 text-xs text-slate-600">
                  Stress/Spike/Endurance are not part of this page.
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600 md:grid-cols-3 md:px-8">
            <QuickInfo label="Purpose" value="Validate stable API performance under expected concurrent load." />
            <QuickInfo label="Not Included" value="Breaking-point stress tests, spike tests, or soak/endurance runs." />
            <QuickInfo label="Who Uses This" value="Backend engineers, QA teams, and release validation workflows." />
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="space-y-6">
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#050040]">Request details</h2>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Provide the endpoint you want to test. For safety, localhost and private IPs are blocked.
              </p>

              <div className="mt-5 space-y-5">
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-slate-700">Request URL</p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="sm:w-[170px]">
                      <span className="sr-only">HTTP Method</span>
                      <select
                        value={method}
                        onChange={(event) => setMethod(event.target.value as typeof method)}
                        className="h-11 w-full rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 focus:border-[#050040] focus:outline-none"
                      >
                        {METHODS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex-1">
                      <span className="sr-only">API URL</span>
                      <input
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        placeholder="https://api.example.com/v1/orders"
                        className="h-11 w-full rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:border-[#050040] focus:outline-none"
                      />
                    </label>
                  </div>
                  {urlError && <span className="text-xs text-rose-500">{urlError}</span>}
                </div>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Headers (JSON)
                  <textarea
                    value={headersText}
                    onChange={(event) => {
                      setHeadersText(event.target.value);
                      setHeaderError(null);
                    }}
                    onBlur={() => handleJsonFormat(headersText, setHeadersText, setHeaderError)}
                    rows={5}
                    className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-sm font-mono text-slate-700 focus:border-[#050040] focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Optional. Auto-formatting runs on blur.</span>
                    <button
                      type="button"
                      onClick={() => handleJsonFormat(headersText, setHeadersText, setHeaderError)}
                      className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-2 py-1 text-xs font-semibold text-[#050040] transition hover:bg-slate-50"
                    >
                      Format JSON
                    </button>
                  </div>
                  {headerError && <span className="text-xs text-rose-500">{headerError}</span>}
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Body (JSON)
                  <textarea
                    value={bodyText}
                    onChange={(event) => {
                      setBodyText(event.target.value);
                      setBodyError(null);
                    }}
                    onBlur={() => handleJsonFormat(bodyText, setBodyText, setBodyError)}
                    rows={5}
                    className="min-h-[140px] rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-sm font-mono text-slate-700 focus:border-[#050040] focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Optional. Leave empty for GET requests.</span>
                    <button
                      type="button"
                      onClick={() => handleJsonFormat(bodyText, setBodyText, setBodyError)}
                      className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-2 py-1 text-xs font-semibold text-[#050040] transition hover:bg-slate-50"
                    >
                      Format JSON
                    </button>
                  </div>
                  {bodyError && <span className="text-xs text-rose-500">{bodyError}</span>}
                </label>

                <label className="grid gap-2 text-sm font-semibold text-slate-700">
                  Advanced config (JSON)
                  <textarea
                    value={advancedText}
                    onChange={(event) => {
                      setAdvancedText(event.target.value);
                      setAdvancedError(null);
                    }}
                    onBlur={() => handleJsonFormat(advancedText, setAdvancedText, setAdvancedError)}
                    rows={10}
                    className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-sm font-mono text-slate-700 focus:border-[#050040] focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Supports profile, auth, scenario, thresholds, and tags.</span>
                    <button
                      type="button"
                      onClick={() => handleJsonFormat(advancedText, setAdvancedText, setAdvancedError)}
                      className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-2 py-1 text-xs font-semibold text-[#050040] transition hover:bg-slate-50"
                    >
                      Format JSON
                    </button>
                  </div>
                  {advancedError && <span className="text-xs text-rose-500">{advancedError}</span>}
                </label>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-4">
                <h3 className="text-sm font-semibold text-slate-700">Load profile</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Control concurrency and intensity. These settings multiply quickly, so start small and
                  ramp up.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" aria-hidden />
                      Virtual Users
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={vus}
                      onChange={(event) => setVus(Number(event.target.value))}
                      className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:border-[#050040] focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">Simulated users.</span>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-slate-500" aria-hidden />
                      Parallel Requests
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={parallelRequests}
                      onChange={(event) => setParallelRequests(Number(event.target.value))}
                      className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:border-[#050040] focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">Intensity per user.</span>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-slate-700">
                    <span className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-slate-500" aria-hidden />
                      Duration
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={duration}
                      onChange={(event) => setDuration(Number(event.target.value))}
                      className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 focus:border-[#050040] focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">Seconds.</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Run load test</h3>
                <span className="text-xs font-semibold text-slate-500">Ready</span>
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Live Load Preview
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  Estimated Load: <span className="font-semibold">VUs × Parallel Requests</span>
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  {vus} × {parallelRequests} = {concurrentRequests} concurrent requests
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Higher numbers drive higher RPS.
                </p>
              </div>

              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-2">
                  <span className="text-slate-600">Status</span>
                  <span className="font-semibold text-slate-700">{status}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-2">
                  <span className="text-slate-600">Concurrent requests</span>
                  <span className="font-semibold text-slate-700">{concurrentRequests}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-2">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold text-slate-700">{duration}s</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-2">
                  <span className="text-slate-600">Queue wait</span>
                  <span className="font-semibold text-slate-700">{queueWaitMs}ms</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={running}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#050040] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#070052] disabled:cursor-not-allowed disabled:opacity-70 sm:rounded-2xl"
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Play className="h-4 w-4" aria-hidden />
                )}
                Run Load Test
              </button>
              <button
                type="button"
                onClick={handleStopTest}
                disabled={!testId || !running}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 sm:rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Square className="h-4 w-4" aria-hidden />
                Stop Test
              </button>
            </div>

            <div className="border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700">Scope and safety</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>• Localhost/private IPs are blocked automatically.</li>
                <li>• Request timeout is capped at 5 seconds.</li>
                <li>• Metrics keep the latest 5,000 timings to stay stable.</li>
                <li>• This route executes load tests only.</li>
              </ul>
            </div>
          </aside>
        </section>

        <section ref={resultsRef} className="mt-7 border border-slate-200 bg-white p-4 shadow-sm sm:mt-8 sm:p-5 md:mt-9 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live Metrics (updates every 2 seconds)
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#050040]">Performance Summary</h2>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={
                  running
                    ? "inline-flex items-center gap-2 rounded-xl border border-emerald-200 sm:rounded-2xl bg-emerald-50 px-4 py-1 text-xs font-semibold text-emerald-700"
                    : "inline-flex items-center gap-2 rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-1 text-xs font-semibold text-slate-700"
                }
              >
                {running ? "Running" : "Completed"}
              </span>
              <span className="text-xs font-semibold text-slate-500">{status}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard label="Total Requests" value={metrics.total} icon={Activity} />
            <MetricCard label="Success Count" value={metrics.success} icon={CheckCircle2} />
            <MetricCard label="Failed Count" value={metrics.failed} icon={CircleAlert} />
            <MetricCard label="Avg Response Time" value={`${metrics.avg.toFixed(1)} ms`} icon={Timer} />
            <MetricCard label="P95" value={`${metrics.p95.toFixed(1)} ms`} icon={Gauge} />
            <MetricCard label="P99" value={`${metrics.p99.toFixed(1)} ms`} icon={Gauge} />
            <MetricCard label="Requests/sec (RPS)" value={metrics.rps.toFixed(2)} icon={Activity} />
            <MetricCard label="In-flight" value={metrics.inFlight ?? 0} icon={Activity} />
            <MetricCard label="Throttled" value={metrics.throttledCount ?? 0} icon={CircleAlert} />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Final Verdict</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">{verdict}</p>
          </div>

          {thresholdSummary && thresholdSummary.checks.length > 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 sm:rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Threshold checks</p>
              <div className="mt-3 grid gap-2">
                {thresholdSummary.checks.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-wrap items-center justify-between rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className={item.passed ? "text-emerald-700" : "text-rose-700"}>
                      {item.passed ? "Pass" : "Fail"} · {item.actual} (target {item.expected})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status breakdown</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {Object.entries(metrics.statusCodeGroups ?? {}).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-2">
                    <span className="font-semibold text-slate-700">{key}</span>
                    <span className="ml-2 text-slate-600">{String(value)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Error taxonomy</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {Object.entries(metrics.errors ?? {}).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-2">
                    <span className="font-semibold text-slate-700">{key}</span>
                    <span className="ml-2 text-slate-600">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Latency trend (5s buckets)</p>
              <div className="mt-3 space-y-2">
                {(metrics.timeBuckets ?? []).slice(-8).map((bucket) => (
                  <div key={bucket.ts} className="rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-2 text-xs">
                    <span className="font-semibold text-slate-700">
                      {new Date(bucket.ts).toLocaleTimeString()}
                    </span>
                    <span className="ml-2 text-slate-600">p95 {bucket.p95.toFixed(0)}ms</span>
                    <span className="ml-2 text-slate-600">rps {bucket.rps.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 sm:rounded-2xl bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Run history and compare</p>
              <button
                type="button"
                onClick={loadRecentRuns}
                className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-1 text-xs font-semibold text-slate-700"
              >
                Refresh history
              </button>
            </div>
            <div className="mt-3 max-h-44 space-y-2 overflow-auto">
              {recentRuns.map((run) => (
                <button
                  key={run.id}
                  type="button"
                  onClick={() => setCompareIds((prev) => ({ ...prev, current: run.id }))}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 px-4 py-2 text-left text-xs"
                >
                  <span className="font-mono text-slate-700">{run.id.slice(0, 10)}...</span>
                  <span className="text-slate-600">{run.status}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                value={compareIds.baseline}
                onChange={(event) =>
                  setCompareIds((prev) => ({ ...prev, baseline: event.target.value.trim() }))
                }
                placeholder="Baseline run ID"
                className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-xs font-medium text-slate-700"
              />
              <input
                value={compareIds.current}
                onChange={(event) =>
                  setCompareIds((prev) => ({ ...prev, current: event.target.value.trim() }))
                }
                placeholder="Current run ID"
                className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-xs font-medium text-slate-700"
              />
            </div>
            <button
              type="button"
              onClick={handleCompare}
              className="mt-2 rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Compare Runs
            </button>
            {compareResult ? (
              <pre className="mt-3 overflow-auto rounded-xl border border-slate-200 sm:rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
                {JSON.stringify(compareResult, null, 2)}
              </pre>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Download a JSON report with metrics, config, and timestamp.
            </p>
            <button
              type="button"
              onClick={downloadReport}
              disabled={!lastConfig}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowDownToLine className="h-4 w-4" aria-hidden />
              Download Report
            </button>
          </div>
        </section>
      </main>

      <SiteFooter />
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
    <div className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-slate-400" aria-hidden />
      </div>
      <p className="mt-3 text-2xl font-bold text-[#050040]">{value}</p>
    </div>
  );
}

type QuickInfoProps = {
  label: string;
  value: string;
};

function QuickInfo({ label, value }: QuickInfoProps) {
  return (
    <div className="rounded-xl border border-slate-200 sm:rounded-2xl bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
