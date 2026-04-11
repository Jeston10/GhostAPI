import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { Braces, ArrowRight, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-[#050040]">
      <section className="bg-white text-sm">
        <SiteNav currentPage="tools" variant="hero" />
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:pt-10">
        <div className="border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 md:px-6">
            <div>
              <div className="inline-flex items-center gap-2 border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                <Sparkles className="h-4 w-4 text-slate-500" aria-hidden />
                Developer Toolkit
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#050040] md:text-3xl">
                Production-grade tools for fast API workflows
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
                Compact, reliable utilities for shaping API responses into code you can ship.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                FREE
              </span>
              <span className="border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                2 tools
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-slate-200 px-4 py-4 md:border-b-0 md:border-r md:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-slate-100 text-[#050040]">
                    <Braces className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      New tool
                    </div>
                    <h2 className="text-xl font-bold text-[#050040]">TypeForge</h2>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    API → Types + Validation + Contracts
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Generate TypeScript types and Zod validation from any API response or JSON payload.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 text-sm font-medium text-slate-700 md:grid-cols-2">
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2">API URL or raw JSON</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2">TypeScript + Zod schema</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2">Instant inference</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2">Frontend teams</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 md:px-6">
                <h3 className="text-sm font-semibold text-slate-700">Highlights</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Clean type output, ready to paste</li>
                  <li>• Handles nested objects and arrays</li>
                  <li>• API response preview built-in</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/typeforge"
                    className="inline-flex items-center justify-center gap-2 border border-[#050040] bg-[#050040] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#070052]"
                  >
                    Try TypeForge
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/typeforge"
                      className="inline-flex items-center justify-center border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70"
                    >
                      View example
                    </Link>
                    <Link
                      href="/typeforge"
                      className="inline-flex items-center justify-center border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70"
                    >
                      Copy schema
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-slate-200 px-4 py-4 md:border-b-0 md:border-r md:px-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-slate-100 text-[#050040]">
                    <Terminal className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      New tool
                    </div>
                    <h2 className="text-xl font-bold text-[#050040]">Curlify</h2>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    API Request → Code Snippets
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Generate cURL, fetch, Axios, and Python requests from API details or a cURL import.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 text-sm font-medium text-slate-700 md:grid-cols-2">
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2">URL, headers, body, or cURL</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2">cURL, fetch, Axios, Python</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2">Instant generation</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2">API testers</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4 md:px-6">
                <h3 className="text-sm font-semibold text-slate-700">Highlights</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• cURL import with previews</li>
                  <li>• Clean code in fetch, Axios, Python</li>
                  <li>• Try request + response preview</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/curlify"
                    className="inline-flex items-center justify-center gap-2 border border-[#050040] bg-[#050040] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#070052]"
                  >
                    Try Curlify
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/curlify"
                      className="inline-flex items-center justify-center border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70"
                    >
                      Import cURL
                    </Link>
                    <Link
                      href="/curlify"
                      className="inline-flex items-center justify-center border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/70"
                    >
                      View example
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
