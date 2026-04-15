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
  Timer,
  Users,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";

const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
const DEFAULT_HEADERS = "{\n  \"content-type\": \"application/json\"\n}";

type LiveMetrics = {
  total: number;
  success: number;
  failed: number;
  avg: number;
  p95: number;
  p99: number;
  rps: number;
};

type TestConfig = {
  url: string;
  method: (typeof METHODS)[number];
  headers: Record<string, string>;
  body: Record<string, unknown> | null;
  vus: number;
  parallelRequests: number;
  duration: number;
};

export default function LoadTestPage() {
  const [url, setUrl] = React.useState("");
  const [method, setMethod] = React.useState<(typeof METHODS)[number]>("GET");
  const [headersText, setHeadersText] = React.useState(DEFAULT_HEADERS);
  const [bodyText, setBodyText] = React.useState("{}\n");
  const [vus, setVus] = React.useState(10);
  const [parallelRequests, setParallelRequests] = React.useState(3);
  const [duration, setDuration] = React.useState(15);

  const [headerError, setHeaderError] = React.useState<string | null>(null);
  const [bodyError, setBodyError] = React.useState<string | null>(null);
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
        setStatus(data.running ? "Running" : "Completed");
      } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    setHeaderError(headerResult.error);
    setBodyError(bodyResult.error);

    if (headerResult.error || bodyResult.error) return;

    const config: TestConfig = {
      url: url.trim(),
      method,
      headers: (headerResult.value ?? {}) as Record<string, string>,
      body: bodyResult.value as Record<string, unknown> | null,
      vus,
      parallelRequests,
      duration,
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
      setStatus("Running");
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setStatus("Failed to start test.");
      setRunning(false);
    }
  };

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

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:pt-10">
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
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                    Virtual users + concurrency control
                  </span>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                    Live p95/p99 latency tracking
                  </span>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
                    Exportable JSON report
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3">
                <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  Live mode: Load Testing
                </div>
                <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
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
                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-[#050040] focus:outline-none"
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
                        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-[#050040] focus:outline-none"
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
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-700 focus:border-[#050040] focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Optional. Auto-formatting runs on blur.</span>
                    <button
                      type="button"
                      onClick={() => handleJsonFormat(headersText, setHeadersText, setHeaderError)}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#050040] transition hover:bg-slate-50"
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
                    className="min-h-[140px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-700 focus:border-[#050040] focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                    <span>Optional. Leave empty for GET requests.</span>
                    <button
                      type="button"
                      onClick={() => handleJsonFormat(bodyText, setBodyText, setBodyError)}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#050040] transition hover:bg-slate-50"
                    >
                      Format JSON
                    </button>
                  </div>
                  {bodyError && <span className="text-xs text-rose-500">{bodyError}</span>}
                </label>
              </div>

              <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 px-4 py-4">
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
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-[#050040] focus:outline-none"
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
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-[#050040] focus:outline-none"
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
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-[#050040] focus:outline-none"
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
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
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
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Status</span>
                  <span className="font-semibold text-slate-700">{status}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Concurrent requests</span>
                  <span className="font-semibold text-slate-700">{concurrentRequests}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-slate-600">Duration</span>
                  <span className="font-semibold text-slate-700">{duration}s</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunTest}
                disabled={running}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#050040] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#070052] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {running ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Play className="h-4 w-4" aria-hidden />
                )}
                Run Load Test
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

        <section ref={resultsRef} className="mt-10 border border-slate-200 bg-white p-6 shadow-sm">
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
                    ? "inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    : "inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
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
          </div>

          <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Final Verdict</p>
            <p className="mt-2 text-sm font-semibold text-slate-700">{verdict}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Download a JSON report with metrics, config, and timestamp.
            </p>
            <button
              type="button"
              onClick={downloadReport}
              disabled={!lastConfig}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
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
    <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
