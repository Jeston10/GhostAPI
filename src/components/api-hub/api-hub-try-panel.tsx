"use client";

import type { CuratedApiEntry } from "@/lib/api-hub-catalog";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Loader2,
  Play,
  RotateCcw,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

function formatMaybeJson(text: string): string {
  try {
    const j = JSON.parse(text) as unknown;
    return JSON.stringify(j, null, 2);
  } catch {
    return text;
  }
}

function isHtmlContentType(ct: string): boolean {
  return /text\/html/i.test(ct) || /application\/xhtml/i.test(ct);
}

function humanizeProxyError(
  status: number,
  error?: string,
  detail?: string
): { title: string; hint?: string } {
  const code = (error ?? "").toLowerCase();
  if (status === 429) {
    return {
      title: "Rate limited",
      hint: detail ?? "Too many requests from this session. Wait before sending again.",
    };
  }
  if (code === "host_not_allowed") {
    return {
      title: "Host not allowed",
      hint: "Only public HTTPS hosts are permitted. Private IPs, localhost, and internal names are blocked.",
    };
  }
  if (code === "fetch_failed") {
    return {
      title: "Upstream unreachable",
      hint: detail ?? "DNS, TLS, or network error while contacting the URL.",
    };
  }
  if (code === "invalid_url" || code === "url_required") {
    return { title: "Invalid request URL", hint: "Use a full https:// URL with a public hostname." };
  }
  if (code === "invalid_json") {
    return { title: "Invalid JSON", hint: "The proxy received malformed JSON." };
  }
  if (code === "method_not_allowed") {
    return { title: "Method not supported", hint: "Only GET and POST are allowed through this console." };
  }
  if (detail) return { title: detail };
  if (error) return { title: error.replace(/_/g, " ") };
  return { title: "Request failed" };
}

type EditorTab = "headers" | "body";

type TryResult = {
  status: number;
  contentType: string;
  body: string;
  error?: string;
  errorCode?: string;
  durationMs?: number;
  proxyHttpStatus?: number;
};

export function ApiHubTryPanel({ entry }: { entry: CuratedApiEntry }) {
  const [method, setMethod] = React.useState<"GET" | "POST">(entry.defaultMethod);
  const [url, setUrl] = React.useState(entry.exampleUrl);
  const [headersText, setHeadersText] = React.useState(() =>
    JSON.stringify(
      entry.defaultHeaders ?? { Accept: "application/json, text/plain, */*" },
      null,
      2
    )
  );
  const [body, setBody] = React.useState(entry.defaultBody ?? "{\n  \n}");
  const [editorTab, setEditorTab] = React.useState<EditorTab>("headers");
  const [refOpen, setRefOpen] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [loadStep, setLoadStep] = React.useState(0);
  const [result, setResult] = React.useState<TryResult | null>(null);

  React.useEffect(() => {
    if (method === "GET" && editorTab === "body") setEditorTab("headers");
  }, [method, editorTab]);

  React.useEffect(() => {
    if (!loading) return;
    const id = window.setInterval(() => {
      setLoadStep((s) => (s + 1) % 3);
    }, 650);
    return () => window.clearInterval(id);
  }, [loading]);

  const loadMessages = [
    "Routing through GhostAPI proxy…",
    "Waiting for upstream response…",
    "Receiving payload…",
  ];

  const copyText = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error("Could not copy");
    }
  };

  const send = React.useCallback(async () => {
    let headersObj: Record<string, string> = {};
    try {
      const parsed = JSON.parse(headersText) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        headersObj = parsed as Record<string, string>;
      } else {
        throw new Error("headers_must_be_object");
      }
    } catch {
      toast.error("Headers must be valid JSON", {
        description: 'Use an object, e.g. { "Accept": "application/json" }.',
      });
      return;
    }

    const t0 = performance.now();
    setLoading(true);
    setLoadStep(0);
    setResult(null);
    try {
      const payload: Record<string, unknown> = {
        url: url.trim(),
        method,
        headers: headersObj,
      };
      if (method === "POST") {
        payload.body = body;
      }

      const r = await fetch("/api/free-apis/try", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await r.json()) as {
        error?: string;
        detail?: string;
        status?: number;
        contentType?: string;
        body?: string;
      };

      const durationMs = Math.round(performance.now() - t0);

      if (r.status === 429) {
        toast.error("Rate limited", {
          description: "Wait briefly before sending another test request.",
        });
        setResult({
          status: 429,
          contentType: "",
          body: "",
          error: data.detail ?? "rate_limited",
          errorCode: "rate_limited",
          durationMs,
          proxyHttpStatus: r.status,
        });
        return;
      }

      if (!r.ok && data.error) {
        setResult({
          status: data.status ?? r.status,
          contentType: "",
          body: "",
          error: data.detail ?? data.error,
          errorCode: typeof data.error === "string" ? data.error : undefined,
          durationMs,
          proxyHttpStatus: r.status,
        });
        return;
      }

      setResult({
        status: data.status ?? r.status,
        contentType: data.contentType ?? "",
        body: data.body ?? "",
        durationMs,
        proxyHttpStatus: r.status,
      });
    } catch (e) {
      const durationMs = Math.round(performance.now() - t0);
      setResult({
        status: 0,
        contentType: "",
        body: "",
        error: e instanceof Error ? e.message : "unknown_error",
        durationMs,
      });
    } finally {
      setLoading(false);
    }
  }, [body, headersText, method, url]);

  const reset = React.useCallback(() => {
    setMethod(entry.defaultMethod);
    setUrl(entry.exampleUrl);
    setHeadersText(
      JSON.stringify(
        entry.defaultHeaders ?? { Accept: "application/json, text/plain, */*" },
        null,
        2
      )
    );
    setBody(entry.defaultBody ?? "{\n  \n}");
    setEditorTab("headers");
    setResult(null);
  }, [entry]);

  const bodyBytes = result?.body ? new TextEncoder().encode(result.body).length : 0;

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden rounded-xl border border-slate-200/95 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_40px_-16px_rgba(5,0,64,0.1)] [word-break:break-word]">
      {/* Reference — same surface as the console (Beeceptor-style technical density) */}
      <div className="border-b border-slate-200 bg-slate-50/90">
        <button
          type="button"
          onClick={() => setRefOpen((o) => !o)}
          className="flex w-full min-w-0 items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-100/80"
        >
          <div className="min-w-0 pr-2">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">
              Endpoint reference
            </span>
            <p className="mt-0.5 text-[13px] font-semibold text-[#050040]">Documentation &amp; examples</p>
          </div>
          {refOpen ? (
            <ChevronUp className="size-4 shrink-0 text-slate-400" aria-hidden />
          ) : (
            <ChevronDown className="size-4 shrink-0 text-slate-400" aria-hidden />
          )}
        </button>
        {refOpen ? (
          <div className="min-w-0 space-y-4 border-t border-slate-200/80 px-4 pb-4 pt-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
                  Example URL
                </span>
                <button
                  type="button"
                  onClick={() => copyText(entry.exampleUrl, "URL copied")}
                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-[#050040] transition hover:bg-slate-50"
                >
                  <Copy className="size-3" aria-hidden />
                  Copy
                </button>
              </div>
              <code className="mt-1.5 block break-all rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-800 md:text-[12px]">
                {entry.exampleUrl}
              </code>
              {entry.docsUrl ? (
                <a
                  href={entry.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#050040] hover:underline"
                >
                  <BookOpen className="size-3.5" aria-hidden />
                  Provider documentation
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              ) : null}
            </div>

            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <div className="min-w-0">
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
                  Request
                </span>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{entry.requestNotes}</p>
                <pre className="mt-2 max-h-40 overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-[10px] leading-relaxed text-slate-800 [overflow-wrap:anywhere] md:text-[11px]">
                  {entry.requestExample}
                </pre>
              </div>
              <div className="min-w-0">
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-slate-500">
                  Response
                </span>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{entry.responseShape}</p>
                <pre className="mt-2 max-h-48 overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-2.5 font-mono text-[10px] leading-relaxed text-slate-800 [overflow-wrap:anywhere] md:text-[11px]">
                  {entry.responseExample}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Request builder — light theme, production UI */}
      <div className="min-w-0 border-b border-slate-200 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">
            Outbound request
          </span>
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            Proxy
          </span>
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-slate-600">
          Executes on the server with rate limits and host rules. Edit the URL and payload to match your
          scenario—responses show real upstream status and body (truncated if very large).
        </p>

        <div className="mt-4 flex min-w-0 flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/90 p-1 sm:flex-row sm:items-stretch">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as "GET" | "POST")}
            className="shrink-0 cursor-pointer rounded-md border border-slate-200 bg-white px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-[#050040] shadow-sm outline-none focus:ring-2 focus:ring-[#050040]/15"
            aria-label="HTTP method"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/…"
            className="min-h-[42px] min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-[12px] text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-[#050040]/25 focus:ring-2 focus:ring-[#050040]/10 md:text-[13px]"
            spellCheck={false}
          />
          <div className="flex gap-1.5 sm:shrink-0">
            <button
              type="button"
              onClick={send}
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#050040] px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#050040]/92 disabled:opacity-55 sm:flex-initial"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Play className="size-3.5" aria-hidden />
              )}
              Send
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              title="Restore example defaults"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="flex h-9 items-end gap-0 px-2 pt-1">
          <button
            type="button"
            onClick={() => setEditorTab("headers")}
            className={cn(
              "rounded-t-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition",
              editorTab === "headers"
                ? "bg-slate-100 text-[#050040] ring-1 ring-slate-200/90"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            Headers
          </button>
          {method === "POST" ? (
            <button
              type="button"
              onClick={() => setEditorTab("body")}
              className={cn(
                "rounded-t-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition",
                editorTab === "body"
                  ? "bg-slate-100 text-[#050040] ring-1 ring-slate-200/90"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Body
            </button>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 bg-white">
        {editorTab === "headers" ? (
          <textarea
            value={headersText}
            onChange={(e) => setHeadersText(e.target.value)}
            spellCheck={false}
            className="box-border h-[180px] w-full max-w-full min-w-0 resize-y overflow-x-hidden border-0 px-4 py-3 font-mono text-[11px] leading-relaxed break-words text-slate-800 outline-none focus:bg-slate-50/50 md:h-[200px] md:text-[12px]"
            aria-label="Request headers JSON"
          />
        ) : method === "POST" ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck={false}
            className="box-border h-[220px] w-full max-w-full min-w-0 resize-y overflow-x-hidden border-0 px-4 py-3 font-mono text-[11px] leading-relaxed break-words text-slate-800 outline-none focus:bg-slate-50/50 md:h-[260px] md:text-[12px]"
            aria-label="Request body"
          />
        ) : null}
      </div>

      {/* Response */}
      <div className="min-w-0 border-t border-slate-200 bg-slate-50/70">
        <div className="relative min-w-0">
          {loading ? (
            <div className="absolute top-0 right-0 left-0 h-0.5 overflow-hidden bg-slate-200" aria-hidden>
              <div className="h-full w-2/5 animate-pulse bg-[#050040]/30" />
            </div>
          ) : null}

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200/90 bg-white px-4 py-2.5">
            <span className="min-w-0 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">
              Upstream response
            </span>
            <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
              {result?.durationMs != null ? (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-600">
                  {result.durationMs} ms
                </span>
              ) : null}
              {result && !loading ? (
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold",
                    result.error
                      ? "bg-red-100 text-red-900"
                      : result.status >= 400
                        ? "bg-amber-100 text-amber-950"
                        : "bg-emerald-100 text-emerald-900"
                  )}
                >
                  {result.error ? "FAILED" : `HTTP ${result.status}`}
                </span>
              ) : null}
            </div>
          </div>

          <div className="min-h-[140px] min-w-0 px-4 py-4">
            {!result && !loading ? (
              <p className="text-[13px] leading-relaxed text-slate-500">
                Ready. Click <strong className="font-semibold text-slate-700">Send</strong> to execute the
                request. Status, latency, content type, and body appear here—formatted when the payload is
                JSON.
              </p>
            ) : null}

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <Loader2 className="size-8 animate-spin text-[#050040]/70" aria-hidden />
                <p className="max-w-md text-center text-[13px] font-medium text-slate-600">
                  {loadMessages[loadStep]}
                </p>
                <p className="text-center text-[11px] text-slate-400">
                  Request runs server-side; keep this page open until it completes.
                </p>
              </div>
            ) : null}

            {result && !loading ? (
              <div className="space-y-3">
                {result.error && !result.body ? (
                  <div
                    className={cn(
                      "rounded-lg border px-3 py-2.5",
                      result.status === 0 || (result.proxyHttpStatus ?? 0) >= 500
                        ? "border-red-200 bg-red-50/95"
                        : "border-amber-200 bg-amber-50/95"
                    )}
                  >
                    {(() => {
                      const { title, hint } = humanizeProxyError(
                        result.proxyHttpStatus ?? result.status,
                        result.errorCode,
                        result.error
                      );
                      return (
                        <>
                          <p
                            className={cn(
                              "text-[13px] font-semibold",
                              result.status === 0 || (result.proxyHttpStatus ?? 0) >= 500
                                ? "text-red-950"
                                : "text-amber-950"
                            )}
                          >
                            {title}
                          </p>
                          {hint ? (
                            <p
                              className={cn(
                                "mt-1 text-[12px] leading-relaxed",
                                result.status === 0 || (result.proxyHttpStatus ?? 0) >= 500
                                  ? "text-red-900/90"
                                  : "text-amber-950/95"
                              )}
                            >
                              {hint}
                            </p>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                ) : null}

                {result.contentType && result.body ? (
                  <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    <span className="shrink-0 font-semibold text-slate-500">Content-Type</span>
                    <code className="min-w-0 max-w-full break-all rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-800">
                      {result.contentType}
                    </code>
                    {bodyBytes > 0 ? (
                      <span className="text-slate-400">· {bodyBytes.toLocaleString()} bytes (preview)</span>
                    ) : null}
                  </div>
                ) : null}

                {result.body && !result.error && isHtmlContentType(result.contentType) ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-950">
                    Body looks like HTML (documentation or an error page), not JSON. Open the URL in a
                    browser if you expected a JSON API.
                  </p>
                ) : null}

                {result.body && !result.error ? (
                  <pre className="max-h-[min(48vh,380px)] max-w-full min-w-0 overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-3 font-mono text-[11px] leading-relaxed text-slate-800 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] [overflow-wrap:anywhere] md:text-[12px]">
                    {formatMaybeJson(result.body)}
                  </pre>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
