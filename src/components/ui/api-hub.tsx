"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  ApiHubApiCard,
  API_HUB_CARD_DECORATION_COUNT,
} from "@/components/ui/api-hub-api-card";
import { ApiHubCategorySelect } from "@/components/ui/api-hub-category-select";
import type { FreeApiEntry } from "@/lib/parse-public-apis-readme";
import {
  loadFavoriteKeys,
  loadRecentKeys,
  recordRecentKey,
  toggleFavoriteKey,
} from "@/lib/api-hub-storage";
import { cn } from "@/lib/utils";
import {
  Copy,
  ExternalLink,
  Loader2,
  Network,
  RotateCcw,
  Send,
  Shuffle,
  Star,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

type CatalogPayload = {
  entries: FreeApiEntry[];
  categories: string[];
  source: string;
  error?: string;
};

type SortBy = "alphabetical" | "category" | "random";

function shuffleArray<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildMockTemplates(entry: FreeApiEntry): {
  requestFormat: string;
  responseFormat: string;
} {
  const requestFormat = JSON.stringify(
    {
      target: {
        name: entry.API,
        documentationUrl: entry.Link,
        category: entry.Category,
      },
      notes: "Describe the call you plan to make (metadata only).",
    },
    null,
    2
  );
  const responseFormat = JSON.stringify(
    {
      provider: entry.API,
      message: "string",
      result: {
        ok: "boolean",
        sample: "string",
      },
    },
    null,
    2
  );
  return { requestFormat, responseFormat };
}

function isHtmlResponseContentType(ct: string): boolean {
  return /text\/html/i.test(ct) || /application\/xhtml/i.test(ct);
}

export type ApiHubProps = {
  onApplyMockTemplate: (requestFormat: string, responseFormat: string) => void;
};

export function ApiHub({ onApplyMockTemplate }: ApiHubProps) {
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [payload, setPayload] = React.useState<CatalogPayload | null>(null);
  const [category, setCategory] = React.useState<string>("");
  const [query, setQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortBy>("alphabetical");
  const [shuffleTick, setShuffleTick] = React.useState(0);
  const [selected, setSelected] = React.useState<FreeApiEntry | null>(null);
  /** Which card is currently running the proxy GET (matches `entryKey`). */
  const [tryingKey, setTryingKey] = React.useState<string | null>(null);
  const [tryResult, setTryResult] = React.useState<{
    status: number;
    contentType: string;
    body: string;
    error?: string;
  } | null>(null);
  const [tryOverrideUrl, setTryOverrideUrl] = React.useState("");
  const [favorites, setFavorites] = React.useState<Set<string>>(() => new Set());
  const [favoritesOnly, setFavoritesOnly] = React.useState(false);
  const [recentKeys, setRecentKeys] = React.useState<string[]>([]);

  const entryKey = React.useCallback(
    (e: FreeApiEntry) => `${e.API}::${e.Link}`,
    []
  );

  React.useEffect(() => {
    setFavorites(loadFavoriteKeys());
    setRecentKeys(loadRecentKeys());
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const r = await fetch("/api/free-apis", { cache: "no-store" });
        const data = (await r.json()) as CatalogPayload;
        if (cancelled) return;
        if (!r.ok && data.error) {
          setLoadError(data.error);
          setPayload(data);
        } else {
          setPayload(data);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load catalog");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = React.useMemo(() => {
    const entries = payload?.entries ?? [];
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (category && e.Category !== category) return false;
      if (!q) return true;
      const blob = `${e.API} ${e.Description} ${e.Category}`.toLowerCase();
      return blob.includes(q);
    });
  }, [payload, category, query]);

  const displayList = React.useMemo(() => {
    let list = [...filtered];
    if (favoritesOnly) {
      list = list.filter((e) => favorites.has(entryKey(e)));
    }
    if (sortBy === "alphabetical") {
      list.sort((a, b) => a.API.localeCompare(b.API));
      return list;
    }
    if (sortBy === "category") {
      list.sort(
        (a, b) =>
          a.Category.localeCompare(b.Category) || a.API.localeCompare(b.API)
      );
      return list;
    }
    return shuffleArray(list);
  }, [filtered, sortBy, shuffleTick, favoritesOnly, favorites, entryKey]);

  const entryByKey = React.useMemo(() => {
    const m = new Map<string, FreeApiEntry>();
    for (const e of payload?.entries ?? []) {
      m.set(entryKey(e), e);
    }
    return m;
  }, [payload?.entries, entryKey]);

  const recentEntries = React.useMemo(() => {
    return recentKeys
      .map((k) => entryByKey.get(k))
      .filter((e): e is FreeApiEntry => e != null);
  }, [recentKeys, entryByKey]);

  /** Card click: select only — no proxy request, no scroll (detail sits above the grid). */
  const selectEntry = React.useCallback(
    (entry: FreeApiEntry) => {
      setSelected(entry);
      setTryResult(null);
      setTryingKey(null);
      setTryOverrideUrl("");
      setRecentKeys(recordRecentKey(entryKey(entry)));
    },
    [entryKey]
  );

  const runTryForEntry = React.useCallback(
    async (entry: FreeApiEntry) => {
      const url = (tryOverrideUrl.trim() || entry.Link).trim();
      if (!url) {
        toast.error("No URL to test", {
          description: "Paste a Try URL or ensure the catalog entry has a link.",
        });
        return;
      }
      setTryResult(null);
      setTryingKey(entryKey(entry));
      try {
        const r = await fetch("/api/free-apis/try", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, method: "GET" }),
        });
        const data = (await r.json()) as {
          status?: number;
          contentType?: string;
          body?: string;
          error?: string;
          detail?: string;
        };
        if (r.status === 429) {
          toast.error("Too many requests", {
            description: data.detail ?? "Please wait and try again.",
          });
        }
        if (!r.ok) {
          setTryResult({
            status: r.status,
            contentType: "",
            body: "",
            error: data.detail ?? data.error ?? `Request failed (${r.status})`,
          });
          return;
        }
        setTryResult({
          status: data.status ?? 0,
          contentType: data.contentType ?? "",
          body: data.body ?? "",
        });
      } catch (e) {
        setTryResult({
          status: 0,
          contentType: "",
          body: "",
          error: e instanceof Error ? e.message : String(e),
        });
      } finally {
        setTryingKey(null);
      }
    },
    [entryKey, tryOverrideUrl]
  );

  const applyMock = () => {
    if (!selected) return;
    const { requestFormat, responseFormat } = buildMockTemplates(selected);
    onApplyMockTemplate(requestFormat, responseFormat);
  };

  const openApiSite = React.useCallback(
    (href?: string) => {
      const target = (href ?? selected?.Link ?? "").trim();
      if (!target) return;
      window.open(target, "_blank", "noopener,noreferrer");
    },
    [selected?.Link]
  );

  const copyApiUrl = React.useCallback(async () => {
    if (!selected?.Link) return;
    try {
      await navigator.clipboard.writeText(selected.Link);
      toast.success("URL copied", {
        description: "Paste into your client, terminal, or API tool.",
      });
    } catch {
      toast.error("Could not copy", {
        description: "Select the link above and copy manually.",
      });
    }
  }, [selected]);

  const handleShuffle = () => {
    setSortBy("random");
    setShuffleTick((t) => t + 1);
  };

  const handleReset = () => {
    setQuery("");
    setCategory("");
    setSortBy("alphabetical");
    setShuffleTick(0);
    setSelected(null);
    setTryResult(null);
    setTryingKey(null);
    setTryOverrideUrl("");
    setFavoritesOnly(false);
  };

  const closeDetail = React.useCallback(() => {
    setSelected(null);
    setTryResult(null);
    setTryingKey(null);
    setTryOverrideUrl("");
  }, []);

  const handleToggleFavorite = React.useCallback(
    (e: FreeApiEntry) => {
      setFavorites((prev) => toggleFavoriteKey(entryKey(e), prev));
    },
    [entryKey]
  );

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-5">
          <label className="sr-only" htmlFor="api-hub-search">
            Search APIs
          </label>
          <input
            id="api-hub-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search APIs by name, description, or category…"
            className="min-h-12 w-full min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:font-normal placeholder:text-slate-500 focus:border-[#050040]/35 focus:ring-2 focus:ring-[#050040]/15"
          />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <span className="whitespace-nowrap">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="min-h-11 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#050040] shadow-sm outline-none transition focus:border-[#050040]/35 focus:ring-2 focus:ring-[#050040]/15"
              >
                <option value="alphabetical">Alphabetical</option>
                <option value="category">Category</option>
                <option value="random">Random</option>
              </select>
            </label>
            <button
              type="button"
              onClick={handleShuffle}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200/30"
            >
              <Shuffle className="size-4" aria-hidden />
              Shuffle
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-200/30"
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset
            </button>
            <button
              type="button"
              onClick={() => setFavoritesOnly((v) => !v)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                favoritesOnly
                  ? "border-[#050040] bg-[#050040]/10 text-[#050040]"
                  : "border-slate-300 bg-white text-slate-800 hover:bg-slate-200/30"
              )}
              aria-pressed={favoritesOnly}
            >
              <Star
                className={cn("size-4", favoritesOnly && "fill-amber-400 text-amber-600")}
                aria-hidden
              />
              Favorites only
            </button>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          <label
            id="api-hub-category-label"
            htmlFor="api-hub-category"
            className="flex w-full flex-col gap-2 text-xs font-bold uppercase tracking-wide text-slate-600"
          >
            Filter by category
            <ApiHubCategorySelect
              id="api-hub-category"
              labelId="api-hub-category-label"
              categories={payload?.categories ?? []}
              value={category}
              onValueChange={setCategory}
            />
          </label>
        </div>

        {payload?.source === "local-fixture" && !loading ? (
          <div
            role="status"
            className="mt-5 rounded-xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          >
            <span className="font-semibold">Offline catalog.</span> Live sources were unavailable,
            so this page is using a bundled snapshot. Reconnect to the internet to load the latest
            list.
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-12 flex flex-col items-center justify-center gap-3 py-20 text-slate-700">
          <Loader2 className="size-8 animate-spin text-[#050040]" aria-hidden />
          <p className="text-sm font-medium">Loading API catalog…</p>
        </div>
      ) : loadError && !(payload?.entries?.length) ? (
        <div className="mt-10 rounded-2xl border border-red-200/80 bg-red-50/90 px-6 py-12 text-center text-sm text-red-900">
          {loadError}
        </div>
      ) : (
        <>
          {recentEntries.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Recent
              </span>
              {recentEntries.map((e) => (
                <button
                  key={entryKey(e)}
                  type="button"
                  onClick={() => selectEntry(e)}
                  className="max-w-[14rem] truncate rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-[#050040] shadow-sm transition hover:border-[#050040]/30 hover:bg-[#050040]/5"
                >
                  {e.API}
                </button>
              ))}
            </div>
          ) : null}

          <Dialog.Root
            open={selected !== null}
            onOpenChange={(open) => {
              if (!open) closeDetail();
            }}
            modal
          >
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-[200] bg-slate-900/45 backdrop-blur-[3px] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
              <Dialog.Popup className="fixed top-1/2 left-1/2 z-[201] flex max-h-[min(90vh,56rem)] w-[min(calc(100vw-1.5rem),56rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_80px_-12px_rgba(5,0,64,0.18)] outline-none data-[ending-style]:scale-95 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0">
                {selected ? (
                  <>
                    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-[linear-gradient(to_right,#0500400a_1px,transparent_1px),linear-gradient(to_bottom,#0500400a_1px,transparent_1px)] bg-[size:24px_24px] px-5 py-4 md:px-6">
                      <div className="min-w-0 flex-1">
                        <Dialog.Title className="text-xl font-bold tracking-tight text-[#050040] md:text-2xl">
                          {selected.API}
                        </Dialog.Title>
                        <Dialog.Description className="sr-only">
                          Actions and details for {selected.API}. Use Test API to run a proxied request, or open
                          the documentation link in a new tab.
                        </Dialog.Description>
                      </div>
                      <Dialog.Close
                        type="button"
                        className="shrink-0 rounded-full bg-gray-800 p-2 text-white transition hover:bg-black"
                        aria-label="Close"
                      >
                        <X className="size-5" aria-hidden />
                      </Dialog.Close>
                    </div>
                    <div
                      id="api-hub-detail"
                      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 md:px-6 md:py-5"
                    >
                      <p className="text-sm font-medium leading-relaxed text-slate-700">
                        {selected.Description}
                      </p>

                      <a
                        href={selected.Link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-block break-all text-sm font-medium text-[#050040] underline decoration-slate-400 underline-offset-2 hover:decoration-[#050040]"
                      >
                        {selected.Link}
                      </a>

                      <div className="mt-5 rounded-xl border border-[#050040]/15 bg-[#050040]/[0.05] px-4 py-3">
                        <p className="text-sm font-bold text-[#050040]">About Test API (proxy)</p>
                        <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-700">
                          Catalog links are often <span className="font-semibold">documentation sites</span>, not JSON
                          endpoints. The proxy returns{" "}
                          <span className="font-semibold">raw HTTP</span> — you may see HTML or plain text. Paste a
                          direct API URL below to test JSON instead.
                        </p>
                      </div>

                      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-4">
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Auth
                          </dt>
                          <dd className="mt-0.5 font-mono text-xs">{selected.Auth}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            HTTPS
                          </dt>
                          <dd className="mt-0.5">{selected.HTTPS}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            CORS
                          </dt>
                          <dd className="mt-0.5">{selected.Cors}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Category
                          </dt>
                          <dd className="mt-0.5">{selected.Category}</dd>
                        </div>
                      </dl>

                      <label
                        htmlFor="api-hub-try-url"
                        className="mt-6 flex w-full flex-col gap-2 text-xs font-bold uppercase tracking-wide text-slate-600"
                      >
                        Try URL (optional)
                        <input
                          id="api-hub-try-url"
                          type="url"
                          name="tryUrl"
                          value={tryOverrideUrl}
                          onChange={(e) => setTryOverrideUrl(e.target.value)}
                          placeholder="https://api.example.com/v1/resource"
                          autoComplete="off"
                          className="min-h-11 w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium normal-case text-[#050040] shadow-sm outline-none transition placeholder:font-normal placeholder:normal-case placeholder:text-slate-400 focus:border-[#050040]/35 focus:ring-2 focus:ring-[#050040]/15"
                        />
                        <span className="text-[0.7rem] font-medium normal-case leading-snug text-slate-600">
                          Overrides the catalog link for the proxy test only. Use when the catalog URL points at docs
                          but you know a JSON endpoint.
                        </span>
                      </label>

                      <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3 min-[480px]:flex-nowrap">
                        <button
                          type="button"
                          onClick={() => void runTryForEntry(selected)}
                          disabled={tryingKey !== null}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:opacity-60"
                        >
                          {tryingKey !== null ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                          ) : (
                            <Send className="size-4" aria-hidden />
                          )}
                          Test API (proxy)
                        </button>
                        <button
                          type="button"
                          onClick={() => openApiSite()}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#050040] transition hover:bg-slate-200/30"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                          Open API site
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyApiUrl()}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-200/30"
                        >
                          <Copy className="size-4" aria-hidden />
                          Copy URL
                        </button>
                        <button
                          type="button"
                          onClick={applyMock}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-[#050040] transition hover:bg-slate-200/30"
                        >
                          <Network className="size-4" aria-hidden />
                          Fill mock playground
                        </button>
                      </div>

                      <p className="mt-4 text-xs font-medium leading-relaxed text-slate-700">
                        <span className="font-semibold text-[#050040]">Test</span> uses the Try URL if set;
                        otherwise the catalog link. <span className="font-semibold text-[#050040]">Open API site</span>{" "}
                        always opens the catalog link in your browser.
                      </p>

                      {tryResult &&
                      !tryResult.error &&
                      isHtmlResponseContentType(tryResult.contentType) ? (
                        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-amber-950">
                            Response looks like HTML (often a docs page), not JSON.
                          </p>
                          <button
                            type="button"
                            onClick={() => openApiSite(tryOverrideUrl.trim() || selected.Link)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-amber-300/80 bg-white px-4 py-2 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-100/80"
                          >
                            <ExternalLink className="size-4" aria-hidden />
                            Open in browser
                          </button>
                        </div>
                      ) : null}

                      {tryResult ? (
                        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          <div className="border-b border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                            {tryResult.error ? "Error" : "Response"} ·{" "}
                            {tryResult.error ? "—" : tryResult.status}{" "}
                            {!tryResult.error && tryResult.contentType
                              ? `· ${tryResult.contentType}`
                              : ""}
                          </div>
                          <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-all p-4 font-mono text-[0.75rem] leading-relaxed text-slate-800 md:text-xs">
                            {tryResult.error ?? tryResult.body}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>

          <ul
            className="mt-8 grid list-none grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            role="list"
          >
            {displayList.map((e, idx) => {
              const isSelected =
                selected?.API === e.API && selected?.Link === e.Link;
              return (
                <li
                  key={`${e.Link}-${e.API}-${idx}`}
                  className="flex min-h-0"
                >
                  <ApiHubApiCard
                    entry={e}
                    selected={isSelected}
                    favorite={favorites.has(entryKey(e))}
                    onToggleFavorite={() => handleToggleFavorite(e)}
                    decorationVariant={idx % API_HUB_CARD_DECORATION_COUNT}
                    onUse={() => selectEntry(e)}
                  />
                </li>
              );
            })}
          </ul>
        </>
      )}

    </div>
  );
}
