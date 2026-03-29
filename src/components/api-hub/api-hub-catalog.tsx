"use client";

import { ApiHubListHighlight } from "@/components/api-hub/api-hub-list-highlight";
import { listCategories, type CuratedApiEntry } from "@/lib/api-hub-catalog";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ClipboardList,
  Layers,
  Network,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

const FEATURES = [
  {
    icon: ClipboardList,
    title: "Curated endpoints",
    body: "Weather, FX, geography, identity, and dev-utility APIs—documented with example URLs and response shapes so you know what to expect before you integrate.",
  },
  {
    icon: Network,
    title: "Live HTTP console",
    body: "Send real GET/POST requests through GhostAPI’s proxy: edit the URL, headers, and JSON body, then inspect status, timing, and payload—same workflow as Postman, in the browser.",
  },
  {
    icon: ShieldCheck,
    title: "Safe by design",
    body: "Private networks and localhost are blocked; requests are rate-limited. Ideal for quick validation—not a replacement for secrets in production clients.",
  },
  {
    icon: Layers,
    title: "500+ free APIs",
    body: "A large, always-growing set of vetted public HTTPS endpoints across many domains—so you can discover utilities, test data, and integration ideas without hunting forum threads. The catalog expands over time as we add more curated entries.",
  },
] as const;

export function ApiHubCatalog({ apis }: { apis: CuratedApiEntry[] }) {
  const router = useRouter();
  const categories = React.useMemo(() => listCategories(), []);
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState<string>("");

  const openDetail = React.useCallback(
    (slug: string) => {
      router.push(`/api-hub/${slug}`);
    },
    [router]
  );

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return apis.filter((a) => {
      if (cat && a.category !== cat) return false;
      if (!query) return true;
      const blob = `${a.name} ${a.tagline} ${a.description} ${a.category}`.toLowerCase();
      return blob.includes(query);
    });
  }, [apis, q, cat]);

  return (
    <>
      <section className="min-w-0 overflow-x-hidden bg-white">
        <div className="mx-auto max-w-6xl min-w-0 px-4 py-10 md:px-6 md:py-6">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#050040]/45">
            API Hub
          </p>
          <h1 className="mt-2 max-w-4xl text-3xl font-extrabold tracking-tight text-[#050040] md:text-[2.125rem] md:leading-tight">
            Explore <span className="text-yellow-500"> 500+ free APIs </span> with a launch-ready test console
          </h1>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-slate-600 md:text-base">
            Browse <span className="font-semibold text-[#050040]/90">500+</span> public HTTPS APIs in a catalog
            that&apos;s <span className="font-semibold text-[#050040]/90">always increasing</span>—we keep adding
            curated endpoints so the list stays useful. Open any entry for full context, then run
            authenticated-style tests from our server-side proxy: real status codes, latency, and bodies without
            installing a client. Use it to validate integrations, teach HTTP, or prototype fast.
          </p>

          <ul className="mt-10 grid list-none gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-5 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#050040]/[0.06] text-[#050040]">
                  <Icon className="size-4" strokeWidth={2} aria-hidden />
                </div>
                <h2 className="mt-4 text-sm font-bold text-[#050040]">{title}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mx-auto max-w-6xl min-w-0 overflow-x-hidden px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, category, or topic…"
              className="h-10 w-full rounded-lg border border-slate-200/90 bg-white py-0 pr-3 pl-9 text-[13px] text-[#050040] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#050040]/25 focus:ring-2 focus:ring-[#050040]/10"
            />
          </div>
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="h-10 shrink-0 rounded-lg border border-slate-200/90 bg-white px-3 text-[13px] font-medium text-[#050040] shadow-sm outline-none focus:border-[#050040]/25 focus:ring-2 focus:ring-[#050040]/10"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-4 text-[12px] font-medium text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{" "}
          <span className="font-semibold text-slate-700">{apis.length}</span> endpoints
        </p>

        <div className="mt-5">
          <ApiHubListHighlight
            categoryCount={categories.length}
            categorySample={categories.slice(0, 7).join(", ")}
          />
        </div>

        <div className="hidden min-w-0 max-w-full overflow-x-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm md:block">
          <table className="w-full table-fixed border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/95 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">
                <th className="w-[22%] px-4 py-3 font-semibold">Category</th>
                <th className="w-[33%] px-4 py-3 font-semibold">API</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell lg:w-[40%]">Summary</th>
                <th className="w-10 px-2 py-3" aria-hidden />
              </tr>
            </thead>
            <tbody>
              {filtered.map((api) => (
                <tr
                  key={api.slug}
                  tabIndex={0}
                  role="link"
                  aria-label={`Open ${api.name}`}
                  className="cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50/80 focus-visible:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/15 focus-visible:ring-inset"
                  onClick={() => openDetail(api.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDetail(api.slug);
                    }
                  }}
                >
                  <td className="min-w-0 px-4 py-3 align-middle">
                    <span className="inline-block max-w-full break-words rounded-md border border-slate-200/90 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#050040]/75">
                      {api.category}
                    </span>
                  </td>
                  <td className="min-w-0 px-4 py-3 align-middle font-semibold text-[#050040]">
                    <span className="break-words">{api.name}</span>
                  </td>
                  <td className="hidden min-w-0 px-4 py-3 align-middle text-slate-600 lg:table-cell">
                    <span className="line-clamp-2 break-words text-[13px]">{api.tagline}</span>
                  </td>
                  <td className="px-2 py-3 align-middle text-right text-slate-400">
                    <span className="inline-flex rounded-md p-1.5" aria-hidden>
                      <ChevronRight className="size-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-5 flex flex-col gap-3 md:hidden">
          {filtered.map((api) => (
            <li key={api.slug}>
              <Link
                href={`/api-hub/${api.slug}`}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm transition",
                  "active:bg-slate-50"
                )}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#050040]/45">
                    {api.category}
                  </span>
                  <p className="font-semibold leading-tight text-[#050040]">{api.name}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-slate-600">{api.tagline}</p>
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-slate-300" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        {filtered.length === 0 ? (
          <p className="mt-10 rounded-xl border border-dashed border-slate-200 bg-white py-10 text-center text-[13px] text-slate-600">
            No endpoints match your filters. Clear search or pick “All categories”.
          </p>
        ) : null}
      </div>
    </>
  );
}
