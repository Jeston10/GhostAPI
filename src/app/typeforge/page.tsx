"use client";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { Check, ChevronDown, ClipboardCopy } from "lucide-react";
import * as React from "react";

const SAMPLE_API_URL = "https://jsonplaceholder.typicode.com/users/1";
const MAX_INPUT_CHARS = 200_000;
const MAX_ARRAY_SAMPLE = 25;

type OutputPayload = {
  typescript: string;
  zod: string;
};

type TabKey = "typescript" | "zod" | "response";

type PrimitiveKind = "string" | "number" | "boolean" | "any";

type TypeNode =
  | { kind: PrimitiveKind }
  | { kind: "array"; element: TypeNode }
  | { kind: "object"; fields: Record<string, { type: TypeNode; optional: boolean }> }
  | { kind: "union"; options: TypeNode[] };

function indent(level: number) {
  return "  ".repeat(level);
}

function inferType(value: unknown): TypeNode {
  if (value === null || value === undefined) return { kind: "any" };
  if (Array.isArray(value)) {
    if (value.length === 0) return { kind: "array", element: { kind: "any" } };
    const sample = value.slice(0, MAX_ARRAY_SAMPLE);
    const elementTypes = sample.map((entry) => inferType(entry));
    return { kind: "array", element: mergeTypes(elementTypes) };
  }
  if (typeof value === "string") return { kind: "string" };
  if (typeof value === "number") return { kind: "number" };
  if (typeof value === "boolean") return { kind: "boolean" };
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    const fields: Record<string, { type: TypeNode; optional: boolean }> = {};
    entries.forEach(([key, val]) => {
      fields[key] = { type: inferType(val), optional: false };
    });
    return { kind: "object", fields };
  }
  return { kind: "any" };
}

function typeSignature(node: TypeNode): string {
  switch (node.kind) {
    case "string":
    case "number":
    case "boolean":
    case "any":
      return node.kind;
    case "array":
      return `array<${typeSignature(node.element)}>`;
    case "union":
      return `union<${node.options.map(typeSignature).sort().join("|")}>`;
    case "object": {
      const keys = Object.keys(node.fields).sort();
      return `object<${keys
        .map((key) => {
          const field = node.fields[key];
          return `${key}${field.optional ? "?" : ""}:${typeSignature(field.type)}`;
        })
        .join(",")}>`;
    }
  }
}

function mergeTypes(types: TypeNode[]): TypeNode {
  const flattened = types.flatMap((type) =>
    type.kind === "union" ? type.options : [type]
  );
  if (flattened.some((type) => type.kind === "any")) {
    return { kind: "any" };
  }

  const allObjects = flattened.every((type) => type.kind === "object");
  if (allObjects) {
    return mergeObjectTypes(flattened as Array<Extract<TypeNode, { kind: "object" }>>);
  }

  const allArrays = flattened.every((type) => type.kind === "array");
  if (allArrays) {
    const elements = (flattened as Array<Extract<TypeNode, { kind: "array" }>>).map(
      (node) => node.element
    );
    return { kind: "array", element: mergeTypes(elements) };
  }

  const unique = new Map<string, TypeNode>();
  flattened.forEach((node) => {
    unique.set(typeSignature(node), node);
  });
  const options = Array.from(unique.values());
  if (options.length === 1) return options[0];
  return { kind: "union", options };
}

function mergeObjectTypes(objects: Array<Extract<TypeNode, { kind: "object" }>>): TypeNode {
  const fieldNames = new Set<string>();
  objects.forEach((obj) => {
    Object.keys(obj.fields).forEach((key) => fieldNames.add(key));
  });

  const fields: Record<string, { type: TypeNode; optional: boolean }> = {};
  fieldNames.forEach((key) => {
    const present = objects.filter((obj) => key in obj.fields);
    const optional = present.length !== objects.length;
    const merged = mergeTypes(present.map((obj) => obj.fields[key].type));
    fields[key] = { type: merged, optional };
  });

  if (Object.keys(fields).length === 0) {
    return { kind: "any" };
  }

  return { kind: "object", fields };
}

function tsFromType(node: TypeNode, level: number): string {
  switch (node.kind) {
    case "string":
    case "number":
    case "boolean":
    case "any":
      return node.kind === "any" ? "any" : node.kind;
    case "array": {
      const inner = tsFromType(node.element, level);
      const arrayInner = node.element.kind === "union" ? `(${inner})` : inner;
      return `${arrayInner}[]`;
    }
    case "union":
      return node.options.map((option) => tsFromType(option, level)).join(" | ");
    case "object": {
      const entries = Object.entries(node.fields);
      if (entries.length === 0) return "Record<string, any>";
      const body = entries
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, field]) =>
          `${indent(level)}${key}${field.optional ? "?" : ""}: ${tsFromType(
            field.type,
            level + 1
          )};`
        )
        .join("\n");
      return `{
${body}
${indent(level - 1)}}`;
    }
  }
}

function generateTS(root: unknown): string {
  const typeBody = tsFromType(inferType(root), 1);
  return `type Root = ${typeBody};`;
}

function zodFromType(node: TypeNode, level: number): string {
  switch (node.kind) {
    case "string":
      return "z.string()";
    case "number":
      return "z.number()";
    case "boolean":
      return "z.boolean()";
    case "any":
      return "z.any()";
    case "array":
      return `z.array(${zodFromType(node.element, level)})`;
    case "union":
      return `z.union([${node.options
        .map((option) => zodFromType(option, level))
        .join(", ")}])`;
    case "object": {
      const entries = Object.entries(node.fields);
      if (entries.length === 0) return "z.record(z.any())";
      const body = entries
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, field]) => {
          const base = zodFromType(field.type, level + 1);
          return `${indent(level)}${key}: ${base}${field.optional ? ".optional()" : ""},`;
        })
        .join("\n");
      return `z.object({
${body}
${indent(level - 1)}})`;
    }
  }
}

function generateZod(root: unknown): string {
  const zodBody = zodFromType(inferType(root), 1);
  return `import { z } from "zod";

const RootSchema = ${zodBody};`;
}

function escapeHtml(code: string) {
  return code
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function highlightCode(code: string, tab: TabKey) {
  let escaped = escapeHtml(code);
  if (tab === "typescript") {
    escaped = escaped
      .replaceAll(/\btype\b/g, '<span class="text-indigo-500">type</span>')
      .replaceAll(
        /\b(string|number|boolean|any)\b/g,
        '<span class="text-emerald-600">$1</span>'
      );
  }
  if (tab === "zod") {
    escaped = escaped
      .replaceAll(/\bz\./g, '<span class="text-indigo-500">z.</span>')
      .replaceAll(/\b(object|array|string|number|boolean|any|record)\b/g, '<span class="text-emerald-600">$1</span>')
      .replaceAll(/\bconst\b/g, '<span class="text-indigo-500">const</span>')
      .replaceAll(/\bimport\b/g, '<span class="text-indigo-500">import</span>');
  }
  return escaped;
}

export default function TypeForgePage() {
  const [apiUrl, setApiUrl] = React.useState("");
  const [rawJson, setRawJson] = React.useState("");
  const [method, setMethod] = React.useState<"GET" | "POST">("GET");
  const [activeTab, setActiveTab] = React.useState<TabKey>("typescript");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [output, setOutput] = React.useState<OutputPayload | null>(null);
  const [copiedTab, setCopiedTab] = React.useState<TabKey | null>(null);
  const [apiResponseRaw, setApiResponseRaw] = React.useState("");

  function downloadFile(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleGenerate() {
    setError(null);
    setLoading(true);
    setApiResponseRaw("");

    try {
      let data: unknown = null;
      if (rawJson.length > MAX_INPUT_CHARS) {
        throw new Error("Input JSON is too large.");
      }

      if (apiUrl.trim()) {
        const bodyPayload = rawJson.trim();
        if (method === "POST" && bodyPayload) {
          try {
            JSON.parse(bodyPayload);
          } catch {
            throw new Error("POST body must be valid JSON.");
          }
        }

        const res = await fetch("/api/typeforge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: apiUrl.trim(),
            method,
            body: method === "POST" && bodyPayload ? bodyPayload : null,
          }),
        });

        const payload = (await res.json().catch(() => null)) as
          | { raw?: string; data?: unknown; error?: string }
          | null;

        if (!res.ok || !payload || payload.error) {
          throw new Error(payload?.error ?? "Failed to fetch API response.");
        }

        if (!payload.raw || payload.data === undefined) {
          throw new Error("Invalid API response payload.");
        }

        data = payload.data;
        setApiResponseRaw(payload.raw);
      } else if (rawJson.trim()) {
        data = JSON.parse(rawJson);
        setApiResponseRaw(JSON.stringify(data, null, 2));
      } else {
        throw new Error("Provide an API URL or raw JSON to generate types.");
      }

      if (Array.isArray(data) && data.length === 0) {
        throw new Error("Cannot infer type from empty array.");
      }

      const typescript = generateTS(data);
      const zod = generateZod(data);

      setOutput({ typescript, zod });
      setActiveTab("typescript");
    } catch (err) {
      setOutput(null);
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(tab: TabKey) {
    const value =
      tab === "response"
        ? apiResponseRaw
        : tab === "typescript"
          ? output?.typescript
          : output?.zod;
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 1600);
  }

  function handleDownload(tab: "typescript" | "zod") {
    if (!output) return;
    if (tab === "typescript") {
      downloadFile("typeforge.types.ts", output.typescript);
    } else {
      downloadFile("typeforge.schema.ts", output.zod);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#050040]">
      <section className="bg-white text-sm">
        <SiteNav currentPage="tools" variant="hero" />
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
         
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#050040] md:text-5xl">
            Generate TypeScript types & validation from any API
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-700 md:text-lg">
            Paste an API URL or raw JSON. Get copy-ready TypeScript and Zod
            schemas instantly.
          </p>
        </div>

        <section className="mt-10 border border-slate-300 bg-white shadow-sm">
          <div className="flex min-h-10 flex-wrap items-stretch border-b border-slate-300 bg-slate-50/90">
            <label className="relative flex items-center border-r border-slate-300">
              <span className="sr-only">HTTP method</span>
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value as "GET" | "POST")}
                className="h-10 min-w-[5.5rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pr-8 pl-3 text-sm font-semibold tracking-wide text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/25 focus-visible:ring-inset"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
            </label>
            <div className="flex min-w-0 flex-1 items-center px-3 text-sm font-medium text-slate-600">
              <input
                type="url"
                value={apiUrl}
                onChange={(event) => setApiUrl(event.target.value)}
                placeholder="https://api.example.com/users"
                className="w-full border-0 bg-transparent font-mono text-xs text-slate-600 outline-none md:text-sm"
              />
            </div>
            <div className="flex items-center border-l border-slate-300 bg-white px-2">
              <button
                type="button"
                onClick={() => setApiUrl(SAMPLE_API_URL)}
                className="text-xs font-semibold text-[#050040] underline decoration-slate-300 underline-offset-2 hover:decoration-[#050040]"
              >
                Use sample API
              </button>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-100/80 px-3 py-1.5">
            <p className="text-[0.7rem] font-medium uppercase tracking-wide text-slate-500 md:text-xs">
              Input — API URL or raw JSON
            </p>
          </div>

          <div className="grid divide-y divide-slate-300 md:grid-cols-2 md:divide-x md:divide-y-0">
            <div className="flex min-h-0 flex-col bg-[#fafafa]">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#050040]">
                  Raw JSON
                </span>
                <span className="text-xs font-medium text-slate-500">Optional if API URL</span>
              </div>
              <textarea
                value={rawJson}
                onChange={(event) => setRawJson(event.target.value)}
                placeholder='{"name": "Ada", "age": 28}'
                rows={8}
                spellCheck={false}
                className="min-h-[200px] w-full flex-1 resize-y border-0 bg-transparent p-3 font-mono text-xs leading-relaxed text-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#050040]/20 md:min-h-[240px] md:p-3.5 md:text-sm"
              />
            </div>

            <div className="flex min-h-0 flex-col bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#050040]">
                  Output
                </span>
                {output ? (
                  <span className="text-xs font-medium text-slate-500">Ready to copy</span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("typescript")}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition md:text-sm ${
                    activeTab === "typescript"
                      ? "bg-[#050040] text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  TypeScript
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("zod")}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition md:text-sm ${
                    activeTab === "zod"
                      ? "bg-[#050040] text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Zod Schema
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("response")}
                  className={`rounded-sm px-3 py-1.5 text-xs font-semibold transition md:text-sm ${
                    activeTab === "response"
                      ? "bg-[#050040] text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  API Response
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(activeTab)}
                  disabled={activeTab === "response" ? !apiResponseRaw : !output}
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
              <div className="min-h-[200px] flex-1 border-t border-slate-200 bg-slate-950/95 p-3 text-sm text-slate-100 md:min-h-[240px] md:p-3.5">
                {output || apiResponseRaw ? (
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed md:text-sm">
                    {activeTab === "response" ? (
                      apiResponseRaw || "Response will appear here after Generate."
                    ) : (
                      <code
                        dangerouslySetInnerHTML={{
                          __html: highlightCode(
                            activeTab === "typescript"
                              ? output?.typescript ?? ""
                              : output?.zod ?? "",
                            activeTab === "typescript" ? "typescript" : "zod"
                          ),
                        }}
                      />
                    )}
                  </pre>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
                    <span>Generate types to see output here.</span>
                    <span className="text-xs">
                      Supports API URLs or raw JSON payloads.
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 bg-white px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Downloads
                </span>
                <button
                  type="button"
                  onClick={() => handleDownload("typescript")}
                  disabled={!output}
                  className="ml-auto inline-flex items-center rounded-sm border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
                >
                  Download .ts
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("zod")}
                  disabled={!output}
                  className="inline-flex items-center rounded-sm border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
                >
                  Download schema
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-300 bg-slate-50/80 px-3 py-2.5">
            {error ? (
              <div className="rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 md:text-sm">
                {error}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-sm bg-[#050040] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-[#070052] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generating…" : "Generate Types"}
              </button>
              <span className="text-xs font-medium text-slate-600 md:text-sm">
                Fetches the API response or parses JSON, then generates types.
              </span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
