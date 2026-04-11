"use client";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { Check, ChevronDown, ClipboardCopy, Terminal } from "lucide-react";
import * as React from "react";

type TabKey = "curl" | "fetch" | "axios" | "python";

type RequestConfig = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown | string | null;
};

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
const MAX_INPUT_CHARS = 200_000;

function escapeHtml(code: string) {
  return code
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlightCode(code: string, tab: TabKey) {
  let escaped = escapeHtml(code);
  if (tab === "curl") {
    escaped = escaped
      .replaceAll(/\bcurl\b/g, '<span class="text-indigo-500">curl</span>')
      .replaceAll(/\b(-X|-H|--data-raw|--data|--data-binary|--request)\b/g, '<span class="text-emerald-400">$1</span>');
  }
  if (tab === "fetch" || tab === "axios") {
    escaped = escaped
      .replaceAll(/\b(fetch|axios)\b/g, '<span class="text-indigo-500">$1</span>')
      .replaceAll(/\bconst\b/g, '<span class="text-indigo-500">const</span>')
      .replaceAll(/\b(method|headers|body|data)\b/g, '<span class="text-emerald-400">$1</span>');
  }
  if (tab === "python") {
    escaped = escaped
      .replaceAll(/\bimport\b/g, '<span class="text-indigo-500">import</span>')
      .replaceAll(/\brequests\b/g, '<span class="text-emerald-400">requests</span>')
      .replaceAll(/\bjson\b/g, '<span class="text-emerald-400">json</span>');
  }
  return escaped;
}

function normalizeHeaders(headers: Record<string, string>, body: unknown | string | null) {
  const normalized = { ...headers };
  if (body && !normalized["Content-Type"]) {
    if (typeof body === "object") {
      normalized["Content-Type"] = "application/json";
    }
  }
  return normalized;
}

function normalizeConfig(input: RequestConfig): RequestConfig {
  const method = input.method?.toUpperCase() || (input.body ? "POST" : "GET");
  const bodyAllowed = method !== "GET" && method !== "DELETE";
  const headers = normalizeHeaders(input.headers, bodyAllowed ? input.body : null);
  return {
    url: input.url.trim(),
    method,
    headers,
    body: bodyAllowed ? input.body : null,
  };
}

function formatObject(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function generateCurl(config: RequestConfig): string {
  const headers = Object.entries(config.headers)
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(" ");
  const method = config.method ? `-X ${config.method}` : "";
  let body = "";
  if (config.body !== null && config.body !== undefined) {
    const payload = typeof config.body === "string" ? config.body : formatObject(config.body);
    body = `--data-raw "${payload.replaceAll("\"", "\\\"")}"`;
  }
  const parts = ["curl", method, headers, body, `"${config.url}"`].filter(Boolean);
  return parts.join(" ");
}

function generateFetch(config: RequestConfig): string {
  const hasBody =
    config.body !== null &&
    config.body !== undefined &&
    ["POST", "PUT", "PATCH"].includes(config.method);
  const hasHeaders = Object.keys(config.headers).length > 0;
  const bodyValue =
    typeof config.body === "string"
      ? `"${config.body.replaceAll("\"", "\\\"")}"`
      : formatObject(config.body);

  const headersLine = hasHeaders
    ? `\n  headers: ${formatObject(config.headers)},`
    : "";
  const bodyLine = hasBody
    ? `\n  body: JSON.stringify(${bodyValue}),`
    : "";

  return `const response = await fetch("${config.url}", {
  method: "${config.method}",${headersLine}${bodyLine}
});

const data = await response.json();`;
}

function generateAxios(config: RequestConfig): string {
  const hasBody = config.body !== null && config.body !== undefined;
  const bodyValue =
    typeof config.body === "string" ? `"${config.body.replaceAll("\"", "\\\"")}"` : formatObject(config.body);
  const lower = config.method.toLowerCase();
  const withBody = ["post", "put", "patch"].includes(lower);
  if (withBody) {
    return `const response = await axios.${lower}(
  "${config.url}",
  ${hasBody ? bodyValue : "{}"},
  {
    headers: ${formatObject(config.headers)}
  }
);

const data = response.data;`;
  }
  return `const response = await axios.${lower}("${config.url}", {
  headers: ${formatObject(config.headers)}
});

const data = response.data;`;
}

function generatePython(config: RequestConfig): string {
  const hasBody = config.body !== null && config.body !== undefined;
  const bodyValue =
    typeof config.body === "string" ? `"""${config.body}"""` : formatObject(config.body);
  const bodyLine = hasBody
    ? typeof config.body === "string"
      ? `data = ${bodyValue}`
      : `data = ${bodyValue}`
    : "data = None";
  const bodyParam = hasBody
    ? typeof config.body === "string"
      ? "data=data"
      : "json=data"
    : "";
  return `import requests

${bodyLine}

response = requests.request(
  "${config.method}",
  "${config.url}",
  headers=${formatObject(config.headers)},${bodyParam ? `\n  ${bodyParam},` : ""}
)

print(response.json())`;
}

function tokenizeCurl(input: string): string[] {
  const tokens: string[] = [];
  const regex = /"(?:\\.|[^\\"])*"|'(?:\\.|[^\\'])*'|\S+/g;
  for (const match of input.matchAll(regex)) {
    const token = match[0];
    if (token.startsWith("\"") || token.startsWith("'")) {
      tokens.push(token.slice(1, -1));
    } else {
      tokens.push(token);
    }
  }
  return tokens;
}

function parseCurlCommand(command: string): RequestConfig {
  const tokens = tokenizeCurl(command.trim());
  if (tokens.length === 0 || tokens[0] !== "curl") {
    throw new Error("cURL command must start with curl.");
  }

  let url = "";
  let method = "";
  const headers: Record<string, string> = {};
  let body: string | null = null;

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    const next = tokens[i + 1];

    if (token === "-X" || token === "--request") {
      method = (next || "").toUpperCase();
      i += 1;
      continue;
    }

    if (token === "-H" || token === "--header") {
      if (!next) continue;
      const [key, ...rest] = next.split(":");
      if (key && rest.length > 0) {
        headers[key.trim()] = rest.join(":").trim();
      }
      i += 1;
      continue;
    }

    if (
      token === "-d" ||
      token === "--data" ||
      token === "--data-raw" ||
      token === "--data-binary" ||
      token === "--data-urlencode"
    ) {
      body = next ?? "";
      i += 1;
      continue;
    }

    if (token.startsWith("http")) {
      url = token;
    }
  }

  if (!url) {
    const maybeUrl = tokens.find((value) => value.startsWith("http"));
    if (maybeUrl) url = maybeUrl;
  }

  if (!method) {
    method = body ? "POST" : "GET";
  }

  return { url, method, headers, body };
}

export default function CurlifyPage() {
  const [url, setUrl] = React.useState("");
  const [method, setMethod] = React.useState<(typeof METHODS)[number]>("GET");
  const [headers, setHeaders] = React.useState("{}");
  const [body, setBody] = React.useState("");
  const [headersError, setHeadersError] = React.useState<string | null>(null);
  const [bodyError, setBodyError] = React.useState<string | null>(null);
  const [output, setOutput] = React.useState<Record<TabKey, string> | null>(null);
  const [activeTab, setActiveTab] = React.useState<TabKey>("curl");
  const [copiedTab, setCopiedTab] = React.useState<TabKey | null>(null);
  const [lastConfig, setLastConfig] = React.useState<RequestConfig | null>(null);
  const [warning, setWarning] = React.useState<string | null>(null);
  const [tryResult, setTryResult] = React.useState<string | null>(null);
  const [tryError, setTryError] = React.useState<string | null>(null);
  const [tryLoading, setTryLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [curlInput, setCurlInput] = React.useState("");
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<RequestConfig | null>(null);

  React.useEffect(() => {
    setOutput(null);
    setLastConfig(null);
    setWarning(null);
    setTryResult(null);
    setTryError(null);
  }, [url, method, headers, body]);

  function formatJsonInput(value: string, setError: (msg: string | null) => void) {
    if (!value.trim()) {
      setError(null);
      return value;
    }
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "object" || Array.isArray(parsed)) {
        setError("Must be a JSON object.");
        return value;
      }
      setError(null);
      return JSON.stringify(parsed, null, 2);
    } catch {
      setError("Invalid JSON.");
      return value;
    }
  }

  function parseBodyInput(value: string): { parsed: unknown | string | null; error: string | null } {
    if (!value.trim()) return { parsed: null, error: null };
    if (value.length > MAX_INPUT_CHARS) return { parsed: null, error: "Body is too large." };
    const trimmed = value.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return { parsed: JSON.parse(trimmed), error: null };
      } catch {
        return { parsed: null, error: "Invalid JSON body." };
      }
    }
    return { parsed: trimmed, error: null };
  }

  function buildConfig(): RequestConfig | null {
    const headersFormatted = formatJsonInput(headers, setHeadersError);
    const parsedHeaders = headersFormatted.trim() ? JSON.parse(headersFormatted) : {};
    if (headersFormatted !== headers) setHeaders(headersFormatted);

    const { parsed, error } = parseBodyInput(body);
    setBodyError(error);
    if (error) return null;

    if (method === "GET" && parsed) {
      setWarning("Body is ignored for GET requests.");
    } else {
      setWarning(null);
    }

    const normalized = normalizeConfig({
      url,
      method,
      headers: parsedHeaders,
      body: parsed,
    });

    return normalized;
  }

  function handleGenerate() {
    setHeadersError(null);
    setBodyError(null);
    setWarning(null);

    if (!url.trim()) {
      setHeadersError("API URL is required.");
      return;
    }

    let config: RequestConfig | null = null;
    try {
      config = buildConfig();
    } catch {
      setHeadersError("Headers JSON is invalid.");
      return;
    }

    if (!config) return;

    const outputs: Record<TabKey, string> = {
      curl: generateCurl(config),
      fetch: generateFetch(config),
      axios: generateAxios(config),
      python: generatePython(config),
    };
    setLastConfig(config);
    setOutput(outputs);
  }
  async function handleTryRequest() {
    setTryError(null);
    setTryResult(null);
    const config = buildConfig();
    if (!config) return;

    setTryLoading(true);
    try {
      const hasBody = config.body !== null && config.body !== undefined;
      const payload =
        typeof config.body === "string"
          ? config.body
          : hasBody
            ? JSON.stringify(config.body)
            : undefined;
      const res = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.method === "GET" ? undefined : payload,
      });
      const text = await res.text();
      let formatted = text;
      try {
        formatted = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        /* keep raw */
      }
      setTryResult(`Status: ${res.status}\n\n${formatted}`);
    } catch (error) {
      setTryError(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setTryLoading(false);
    }
  }

  async function handleCopy(tab: TabKey) {
    const value = output?.[tab];
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 1600);
  }

  function openModal() {
    setCurlInput("");
    setPreview(null);
    setParseError(null);
    setShowModal(true);
  }

  function handleParseCurl() {
    try {
      const parsed = parseCurlCommand(curlInput);
      if (!parsed.url) {
        throw new Error("Could not detect URL.");
      }
      setPreview(parsed);
      setParseError(null);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Could not parse cURL.");
      setPreview(null);
    }
  }

  function applyCurl() {
    let parsed = preview;
    if (!parsed) {
      try {
        parsed = parseCurlCommand(curlInput);
        if (!parsed.url) {
          throw new Error("Could not detect URL.");
        }
        setPreview(parsed);
        setParseError(null);
      } catch (error) {
        setParseError(error instanceof Error ? error.message : "Could not parse cURL.");
        setPreview(null);
        return;
      }
    }

    setUrl(parsed.url);
    setMethod((parsed.method.toUpperCase() as (typeof METHODS)[number]) || "GET");
    setHeaders(JSON.stringify(parsed.headers ?? {}, null, 2));
    setBody(parsed.body ? String(parsed.body) : "");
    setShowModal(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#050040]">
      <section className="bg-white text-sm">
        <SiteNav currentPage="tools" variant="hero" />
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
       
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#050040] md:text-5xl">
            Generate cURL, fetch, Axios, and Python requests instantly
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-700 md:text-lg">
            Paste request details or import a cURL command. Get clean code in every language you need.
          </p>
        </div>

        <section className="mt-10 border border-slate-300 bg-white shadow-sm">
          <div className="flex min-h-10 flex-wrap items-stretch border-b border-slate-300 bg-slate-50/90">
            <label className="relative flex items-center border-r border-slate-300">
              <span className="sr-only">HTTP method</span>
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value as (typeof METHODS)[number])}
                className="h-10 min-w-[5.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pr-8 pl-3 text-sm font-semibold tracking-wide text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/25 focus-visible:ring-inset"
              >
                {METHODS.map((methodValue) => (
                  <option key={methodValue} value={methodValue}>
                    {methodValue}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
            </label>
            <div className="flex min-w-0 flex-1 items-center px-3 text-sm font-medium text-slate-600">
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://api.example.com/users"
                className="w-full border-0 bg-transparent font-mono text-xs text-slate-600 outline-none md:text-sm"
              />
            </div>
            <div className="flex items-center border-l border-slate-300 bg-white px-2">
              <button
                type="button"
                onClick={openModal}
                className="text-xs font-semibold text-[#050040] underline decoration-slate-300 underline-offset-2 hover:decoration-[#050040]"
              >
                Import from cURL
              </button>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-100/80 px-3 py-1.5">
            <p className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-500 md:text-xs">
              Input — headers and body
            </p>
          </div>

          <div className="grid divide-y divide-slate-300 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="flex min-h-0 flex-col bg-[#fafafa]">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#050040]">
                  Headers (JSON)
                </span>
                <span className="text-xs font-medium text-slate-500">Optional</span>
              </div>
              <textarea
                value={headers}
                onChange={(event) => setHeaders(event.target.value)}
                onBlur={(event) => setHeaders(formatJsonInput(event.target.value, setHeadersError))}
                placeholder='{"Authorization": "Bearer token"}'
                rows={8}
                spellCheck={false}
                className="min-h-[200px] w-full flex-1 resize-y border-0 bg-transparent p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#050040]/20 md:min-h-[240px] md:p-3.5 md:text-sm"
              />
              {headersError ? (
                <div className="border-t border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                  {headersError}
                </div>
              ) : null}
            </div>

            <div className="flex min-h-0 flex-col bg-[#fafafa]">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#050040]">
                  Body (JSON or text)
                </span>
                <span className="text-xs font-medium text-slate-500">Optional</span>
              </div>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder='{"name": "Ada"}'
                rows={8}
                spellCheck={false}
                className="min-h-[200px] w-full flex-1 resize-y border-0 bg-transparent p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#050040]/20 md:min-h-[240px] md:p-3.5 md:text-sm"
              />
              {bodyError ? (
                <div className="border-t border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                  {bodyError}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-300 bg-slate-50/80 px-3 py-2.5">
            {warning ? (
              <div className="border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                {warning}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-sm bg-[#050040] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#070052]"
              >
                Generate Code
              </button>
              <button
                type="button"
                onClick={handleTryRequest}
                className="rounded-sm border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {tryLoading ? "Trying…" : "Try this request"}
              </button>
              <span className="text-xs font-medium text-slate-600 md:text-sm">
                Auto-formats JSON, validates input, and outputs ready-to-use snippets.
              </span>
            </div>
          </div>

          <div className="border-t border-slate-300 bg-white">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
              {(["curl", "fetch", "axios", "python"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition md:text-sm ${
                    activeTab === tab
                      ? "bg-[#050040] text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab === "curl" ? "cURL" : tab === "fetch" ? "JavaScript" : tab === "axios" ? "Axios" : "Python"}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleCopy(activeTab)}
                disabled={!output}
                className="ml-auto inline-flex items-center gap-2 rounded-sm border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
              >
                {copiedTab === activeTab ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden /> Copied
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="h-4 w-4" aria-hidden /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="min-h-[220px] border-t border-slate-200 bg-slate-950/95 p-3 text-sm text-slate-100 md:min-h-[260px] md:p-3.5">
              {output ? (
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed md:text-sm">
                  <code
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(output[activeTab], activeTab),
                    }}
                  />
                </pre>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
                  <span>Generate code to see output here.</span>
                  <span className="text-xs">Supports cURL, fetch, Axios, and Python.</span>
                </div>
              )}
            </div>
            {tryResult || tryError ? (
              <div className="border-t border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Response
                </div>
                {tryError ? (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{tryError}</p>
                ) : (
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-slate-700">
{tryResult}
                  </pre>
                )}
              </div>
            ) : null}
            {lastConfig ? (
              <div className="border-t border-slate-200 bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Parsed config
                  <span className="text-[0.7rem] font-medium text-slate-500">Debug</span>
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-slate-700">
{JSON.stringify(lastConfig, null, 2)}
                </pre>
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <SiteFooter />

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">Import from cURL</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
            </div>
            <div className="px-4 py-4">
              <textarea
                value={curlInput}
                onChange={(event) => setCurlInput(event.target.value)}
                placeholder={`curl -X POST https://api.example.com -H 'Authorization: Bearer token' -d '{"name": "Ada"}'`}
                rows={5}
                className="w-full resize-y border border-slate-200 bg-[#fafafa] p-3 font-mono text-xs text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/20 md:text-sm"
              />
              {parseError ? (
                <p className="mt-2 text-xs font-semibold text-rose-600">{parseError}</p>
              ) : null}
              {preview ? (
                <div className="mt-4 border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-700">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-slate-500">URL</p>
                      <p className="mt-1 break-all">{preview.url}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-500">Method</p>
                      <p className="mt-1">{preview.method}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-semibold text-slate-500">Headers</p>
                      <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(preview.headers ?? {}, null, 2)}</pre>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-semibold text-slate-500">Body</p>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {preview.body === null || preview.body === undefined
                          ? "(empty)"
                          : typeof preview.body === "string"
                            ? preview.body
                            : JSON.stringify(preview.body, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParseCurl}
                className="border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Parse
              </button>
              <button
                type="button"
                onClick={applyCurl}
                disabled={!preview}
                className="bg-[#050040] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
