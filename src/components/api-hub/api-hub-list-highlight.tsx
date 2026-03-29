import { Sparkles } from "lucide-react";

type ApiHubListHighlightProps = {
  categoryCount: number;
  /** Comma-separated sample of category names for the secondary line */
  categorySample: string;
};

/**
 * Compact value strip above the catalog table—warm tint, calm typography (similar to product “included” callouts).
 */
export function ApiHubListHighlight({
  categoryCount,
  categorySample,
}: ApiHubListHighlightProps) {
  return (
    <div
      className="mb-5 rounded-xl border border-amber-200/50 bg-gradient-to-b from-amber-50/95 to-amber-50/40 px-4 py-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] md:px-5"
      role="region"
      aria-label="API Hub at a glance"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/70 text-amber-800 shadow-sm ring-1 ring-amber-200/60"
            aria-hidden
          >
            <Sparkles className="size-4 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-amber-900/50">
              At a glance
            </p>
            <p className="mt-1 text-[13px] font-medium leading-snug text-amber-950/90 md:text-[13.5px]">
              Free HTTPS endpoints for integration testing—utility, dev, finance, weather, and more—with
              copy-ready URLs and a live console.
            </p>
          </div>
        </div>

        <dl className="flex shrink-0 flex-col gap-2 border-t border-amber-200/40 pt-3 sm:border-t-0 sm:border-l sm:pl-5 sm:pt-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <dt className="sr-only">Categories</dt>
            <dd className="text-[12px] tabular-nums text-amber-900/75">
              <span className="font-semibold text-amber-950">{categoryCount}</span> categories
            </dd>
          </div>
          <div>
            <dt className="sr-only">Examples</dt>
            <dd
              className="text-[11px] leading-relaxed text-amber-900/65 md:text-[12px]"
              title={categorySample}
            >
              e.g. {categorySample}
              {categoryCount > 7 ? "…" : ""}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
