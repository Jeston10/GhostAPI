"use client";

import {
  PLAYGROUND_PREFILL_STORAGE_KEY,
  type PlaygroundPrefillPayload,
} from "@/lib/playground-prefill";
import {
  validateOptionalJsonDocument,
  validateRequiredJsonDocument,
} from "@/lib/mock-schema-validate";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Copy, Play, RotateCcw } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

function statusToneClass(code: number): string {
  if (code === 0) return "bg-slate-950/10 text-slate-700 border-slate-600/20";
  if (code >= 500) return "bg-red-950/10 text-red-800 border-red-800/15";
  if (code >= 400) return "bg-amber-950/10 text-amber-900 border-amber-800/20";
  if (code >= 300) return "bg-sky-950/10 text-sky-900 border-sky-800/20";
  return "bg-emerald-950/10 text-emerald-800 border-emerald-800/15";
}

const METHODS = ["GET", "POST"] as const;
export type HttpMethod = (typeof METHODS)[number];

const METHOD_TAB: Record<HttpMethod, string> = {
  GET: "bg-emerald-950/5 text-emerald-800 border-emerald-800/20",
  POST: "bg-amber-950/5 text-amber-900 border-amber-800/25",
};

function formatBodyText(raw: string): string {
  try {
    const j = JSON.parse(raw) as unknown;
    return JSON.stringify(j, null, 2);
  } catch {
    return raw;
  }
}

const DEFAULT_REQUEST = `{
  "query": {},
  "headers": {
    "Accept": "application/json"
  }
}`;

const DEFAULT_RESPONSE = `{
  "name": "string",
  "email": "string",
  "active": "boolean"
}`;

function errorFromResponseBody(text: string, status: number): string {
  try {
    const j = JSON.parse(text) as { detail?: string; error?: string };
    if (j.detail) return j.detail;
    if (j.error) return j.error.replace(/_/g, " ");
  } catch {
    /* ignore */
  }
  if (status === 405) {
    return "Wrong HTTP method for this mock (GET vs POST).";
  }
  if (status === 404) {
    return "Mock URL not found.";
  }
  return `Request failed (${status})`;
}

export type ApiPlaygroundProps = {
  /** When set (e.g. from API Hub), replaces the request/response editor contents. */
  initialRequestFormat?: string;
  initialResponseFormat?: string;
};

export function ApiPlayground({
  initialRequestFormat,
  initialResponseFormat,
}: ApiPlaygroundProps) {
  const [method, setMethod] = React.useState<HttpMethod>("GET");
  const [requestFormat, setRequestFormat] = React.useState(
    () => initialRequestFormat ?? DEFAULT_REQUEST
  );
  const [responseFormat, setResponseFormat] = React.useState(
    () => initialResponseFormat ?? DEFAULT_RESPONSE
  );
  const [urlPhase, setUrlPhase] = React.useState<"idle" | "resolving" | "ready">(
    "idle"
  );
  const [displayUrl, setDisplayUrl] = React.useState("");
  /** Payload used only for Test / Retest (separate from generation request format). */
  const [testRequestBody, setTestRequestBody] = React.useState("");
  const [testRun, setTestRun] = React.useState<{
    status: number;
    durationMs: number;
    requestRaw: string;
    responseRaw: string;
  } | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PLAYGROUND_PREFILL_STORAGE_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PLAYGROUND_PREFILL_STORAGE_KEY);
      const parsed = JSON.parse(raw) as PlaygroundPrefillPayload;
      if (typeof parsed.request === "string" && parsed.request.length > 0) {
        setRequestFormat(parsed.request);
      }
      if (typeof parsed.response === "string" && parsed.response.length > 0) {
        setResponseFormat(parsed.response);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleSubmit = async () => {
    setTestRun(null);
    setCopied(false);

    const reqJsonErr = validateOptionalJsonDocument(
      requestFormat,
      "Request format"
    );
    if (reqJsonErr) {
      toast.error("Invalid JSON", { description: reqJsonErr });
      return;
    }

    const responseJsonErr = validateRequiredJsonDocument(
      responseFormat,
      "Response format"
    );
    if (responseJsonErr) {
      toast.error("Invalid response format", { description: responseJsonErr });
      return;
    }

    setUrlPhase("resolving");
    setDisplayUrl("");
    const snapshotRequestFormat = requestFormat;
    try {
      const r = await fetch("/api/mock/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          requestFormat: requestFormat.trim() || null,
          responseFormat,
        }),
      });
      const data = (await r.json().catch(() => ({}))) as {
        path?: string;
        error?: string;
        detail?: string;
      };
      if (!r.ok) {
        const msg =
          data.detail ??
          (data.error ? data.error.replace(/_/g, " ") : null) ??
          `Request failed (${r.status})`;
        throw new Error(msg);
      }
      if (!data.path) {
        throw new Error("Invalid server response");
      }
      const abs = new URL(data.path, window.location.origin).href;
      setDisplayUrl(abs);
      setTestRequestBody(snapshotRequestFormat);
      setUrlPhase("ready");
      toast.success("Mock API created", {
        description: `${method} endpoint saved — use Test to call it.`,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Provisioning failed";
      toast.error("Could not create mock", { description: msg });
      setUrlPhase("idle");
      setDisplayUrl("");
    }
  };

  const runTest = React.useCallback(async () => {
    if (!displayUrl) return;
    const started = performance.now();
    const isPost = method === "POST";
    const bodyPayload = testRequestBody.trim() || "{}";
    if (isPost) {
      try {
        JSON.parse(bodyPayload);
      } catch {
        toast.error("Invalid JSON", {
          description: "Test request body is not valid JSON.",
        });
        setTestRun({
          status: 0,
          durationMs: 0,
          requestRaw: `${method} ${displayUrl}\n(invalid body)`,
          responseRaw: "Test request body is not valid JSON.",
        });
        return;
      }
    }
    try {
      const r = await fetch(displayUrl, {
        method,
        cache: "no-store",
        headers: isPost ? { "Content-Type": "application/json" } : undefined,
        body: isPost ? bodyPayload : undefined,
      });
      const text = await r.text();
      const durationMs = Math.round(performance.now() - started);
      const requestRaw = isPost
        ? `${method} ${displayUrl}\nContent-Type: application/json\n\n${bodyPayload}`
        : `${method} ${displayUrl}\n(No request body)`;
      setTestRun({
        status: r.status,
        durationMs,
        requestRaw,
        responseRaw: formatBodyText(text),
      });
      if (r.ok) {
        toast.success("Test successful", {
          description: `${method} ${r.status} · ${durationMs} ms`,
        });
      } else {
        toast.error("Request failed", {
          description: errorFromResponseBody(text, r.status),
        });
      }
    } catch (e) {
      const durationMs = Math.round(performance.now() - started);
      const requestRaw = isPost
        ? `${method} ${displayUrl}\nContent-Type: application/json\n\n${bodyPayload}`
        : `${method} ${displayUrl}\n(No request body)`;
      const err = e instanceof Error ? e.message : String(e);
      toast.error("Network error", { description: err });
      setTestRun({
        status: 0,
        durationMs,
        requestRaw,
        responseRaw: err,
      });
    }
  }, [displayUrl, method, testRequestBody]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast.success("URL copied", {
        description: "Mock URL is on your clipboard.",
      });
    } catch {
      setCopied(false);
      toast.error("Copy failed", {
        description: "Could not access the clipboard.",
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      <h2 className="text-center text-3xl font-bold tracking-tight text-[#050040] md:text-4xl">
        Playground
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm font-medium leading-relaxed text-slate-700 md:text-base">
        Pick <span className="font-semibold text-[#050040]">GET</span> or{" "}
        <span className="font-semibold text-[#050040]">POST</span>,
        define formats, then Submit and Test. POST sends the test body and merges it into the
        generated response.
      </p>

      <div className="mt-8 border border-slate-300 bg-white shadow-sm md:mt-10">
        {/* Toolbar — Postman-style request line */}
        <div className="flex min-h-10 flex-wrap items-stretch border-b border-slate-300 bg-slate-50/90">
          <label className="relative flex items-center border-r border-slate-300">
            <span className="sr-only">HTTP method</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              disabled={urlPhase === "resolving" || urlPhase === "ready"}
              title={
                urlPhase === "ready"
                  ? "Method is fixed for this URL — use Start over to pick GET or POST again"
                  : undefined
              }
              className={cn(
                "h-10 min-w-[5.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pr-8 pl-3 text-sm font-semibold tracking-wide outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/25 focus-visible:ring-inset disabled:opacity-50",
                METHOD_TAB[method]
              )}
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
          </label>
          <div className="flex min-w-0 flex-1 items-center px-3 text-sm font-medium text-slate-600">
            <span className="truncate font-mono text-xs text-slate-500 md:text-sm">
              {urlPhase === "idle"
                ? "Submit to provision mock URL"
                : urlPhase === "resolving"
                  ? "Resolving endpoint…"
                  : displayUrl}
            </span>
          </div>
        </div>

        {/* Generation: values used when you Submit to provision the API */}
        <div className="border-b border-slate-200 bg-slate-100/80 px-3 py-1.5">
          <p className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-500 md:text-xs">
            API generation — request/response formats
          </p>
        </div>
        <div className="grid divide-y divide-slate-300 md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="flex min-h-0 flex-col bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#050040]">
                Request format
              </span>
              <span className="text-xs font-medium text-slate-500">Any valid JSON</span>
            </div>
            <textarea
              value={requestFormat}
              onChange={(e) => setRequestFormat(e.target.value)}
              spellCheck={false}
              className="min-h-[168px] w-full resize-y border-0 bg-[#fafafa] p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#050040]/20 md:min-h-[220px] md:p-3.5 md:text-sm"
              aria-label="Request format for API generation"
            />
          </div>
          <div className="flex min-h-0 flex-col bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#050040]">
                Response format
              </span>
              <span className="text-xs font-medium text-slate-500">Any valid JSON</span>
            </div>
            <textarea
              value={responseFormat}
              onChange={(e) => setResponseFormat(e.target.value)}
              spellCheck={false}
              className="min-h-[168px] w-full resize-y border-0 bg-[#fafafa] p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#050040]/20 md:min-h-[220px] md:p-3.5 md:text-sm"
              aria-label="Response format for API generation"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-300 bg-slate-50/80 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={urlPhase === "resolving"}
              className="rounded-sm bg-[#050040] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#070052] disabled:opacity-60"
            >
              {urlPhase === "resolving" ? "Provisioning…" : "Submit"}
            </button>
            <span className="text-xs font-medium text-slate-600 md:text-sm">
              Creates a public GET or POST mock on this app.
            </span>
          </div>
        </div>

        {urlPhase !== "idle" && (
          <div className="border-t border-slate-300 bg-white px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Your API
              </div>
              {urlPhase === "ready" ? (
                <button
                  type="button"
                  onClick={() => {
                    setUrlPhase("idle");
                    setDisplayUrl("");
                    setTestRun(null);
                    setCopied(false);
                  }}
                  className="text-xs font-medium text-[#050040] underline decoration-slate-400 underline-offset-2 hover:decoration-[#050040]"
                >
                  Start over
                </button>
              ) : null}
            </div>
            <div className="mt-2 flex min-h-9 flex-col overflow-hidden rounded-sm border border-slate-300 bg-white sm:flex-row sm:items-stretch">
              <div className="flex min-w-0 flex-1 items-center border-b border-slate-300 bg-slate-50 px-3 py-2 sm:border-b-0 sm:border-r sm:py-2">
                <span className="truncate font-mono text-xs text-[#050040] md:text-sm">
                  {displayUrl}
                </span>
              </div>
              <div className="flex shrink-0 items-stretch divide-x divide-slate-300">
                <button
                  type="button"
                  onClick={() => void runTest()}
                  disabled={urlPhase !== "ready"}
                  className="inline-flex items-center gap-1.5 bg-white px-3 text-xs font-medium text-[#050040] transition hover:bg-slate-50 disabled:opacity-50 md:text-sm"
                >
                  <Play className="size-3.5 text-[#050040]" aria-hidden />
                  Test
                </button>
                <button
                  type="button"
                  onClick={copyUrl}
                  disabled={urlPhase !== "ready"}
                  className="inline-flex size-9 shrink-0 items-center justify-center bg-white text-[#050040] transition hover:bg-slate-50 disabled:opacity-50 md:size-10"
                  aria-label="Copy URL"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-600" aria-hidden />
                  ) : (
                    <Copy className="size-4" aria-hidden />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 border border-slate-200 bg-slate-50/50">
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#050040]">
                  Test request body
                </span>
                <span className="text-xs font-medium text-slate-600">
                  {method === "GET"
                    ? "GET mocks do not send a body."
                    : "Any JSON value for Test. Objects are merged into generated object responses."}
                </span>
              </div>
              <textarea
                value={testRequestBody}
                onChange={(e) => setTestRequestBody(e.target.value)}
                spellCheck={false}
                disabled={urlPhase !== "ready" || method === "GET"}
                placeholder={
                  urlPhase === "ready"
                    ? method === "GET"
                      ? "Not used for GET"
                      : "{ }"
                    : "Available after the mock URL is ready…"
                }
                className="min-h-[120px] w-full resize-y border-0 bg-[#fafafa] p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#050040]/20 disabled:cursor-not-allowed disabled:opacity-60 md:min-h-[140px] md:text-sm"
                aria-label="Request body for this test"
              />
            </div>

            {copied && (
              <p className="mt-2 text-xs text-emerald-700 md:text-sm" role="status">
                Copied to clipboard
              </p>
            )}
          </div>
        )}

        {testRun && (
          <div className="border-t border-slate-300 bg-slate-50">
            <div className="border-b border-slate-200 px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Result
                </span>
                <span
                  className={cn(
                    "rounded-sm border px-2 py-0.5 font-mono text-sm font-semibold",
                    statusToneClass(testRun.status)
                  )}
                >
                  {testRun.status}
                </span>
                <span className="text-xs font-medium text-slate-600 md:text-sm">
                  {testRun.durationMs} ms
                </span>
                <button
                  type="button"
                  onClick={() => void runTest()}
                  disabled={urlPhase !== "ready"}
                  className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-slate-300 bg-white px-3 text-sm font-semibold text-[#050040] transition hover:bg-slate-50 disabled:opacity-50 md:ml-auto"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Retest
                </button>
              </div>
              <p className="mt-1.5 text-xs font-medium text-slate-600 md:text-sm">
                Live response from your mock URL — status and body come from the server
              </p>
            </div>
            <div className="grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="min-h-0">
                <div className="bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                  Request sent
                </div>
                <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all border-t border-slate-100 bg-[#fafafa] p-3 font-mono text-xs leading-relaxed text-slate-800 md:max-h-80 md:p-3.5 md:text-sm">
                  {testRun.requestRaw}
                </pre>
              </div>
              <div className="min-h-0">
                <div className="bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                  Response received
                </div>
                <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all border-t border-slate-100 bg-[#fafafa] p-3 font-mono text-xs leading-relaxed text-slate-800 md:max-h-80 md:p-3.5 md:text-sm">
                  {testRun.responseRaw}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
