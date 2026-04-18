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
      className="mb-5 rounded-xl border border-amber-200/50 bg-gradient-to-b from-amber-50/95 to-amber-50/40 px-4 py-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] sm:rounded-2xl md:px-5"
      role="region"
      aria-label="API Hub at a glance"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
       

  
      </div>
    </div>
  );
}
