"use client";

import { ApiHubTryPanel } from "@/components/api-hub/api-hub-try-panel";
import type { CuratedApiEntry } from "@/lib/api-hub-catalog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ApiHubDetail({ entry }: { entry: CuratedApiEntry }) {
  return (
    <main className="mx-auto max-w-6xl min-w-0 overflow-x-hidden px-4 py-6 md:px-6 md:py-8">
      <Link
        href="/api-hub"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#050040]/75 transition hover:text-[#050040]"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Back to catalog
      </Link>

      <div className="mt-5 border-b border-slate-200/90 pb-6">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#050040]/40">Endpoint</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#050040] md:text-[1.65rem]">{entry.name}</h1>
        <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-slate-600">{entry.description}</p>
        <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-slate-500">{entry.tagline}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#050040]/80">
            {entry.category}
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
            {entry.auth === "none" ? "No API key" : "API key may be required"}
          </span>
          <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
            Default {entry.defaultMethod}
          </span>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-slate-500">HTTP console</h2>
       
        <div className="mt-5">
          <ApiHubTryPanel entry={entry} />
        </div>
      </section>
    </main>
  );
}
