"use client";

import type { FreeApiEntry } from "@/lib/parse-public-apis-readme";
import { cn } from "@/lib/utils";
import { Braces, Ghost, Star, Zap } from "lucide-react";

/** Uniform compact height — grid rows align; content is clamped so gaps stay small */
const CARD_BOX =
  "h-[240px] min-h-[240px] w-full max-w-full sm:h-[248px] sm:min-h-[248px]";

/** Cycle ghost / braces / lightning across the grid */
export const API_HUB_CARD_DECORATION_COUNT = 3;

function statusDot(className: string) {
  return (
    <span
      className={cn("size-2.5 shrink-0 rounded-full shadow-sm ring-1 ring-black/5", className)}
      aria-hidden
    />
  );
}

function authLabel(auth: string): { text: string; tone: "ok" | "key" | "other" } {
  const a = auth.trim();
  if (a === "No" || a.toLowerCase() === "no") {
    return { text: "No authorization", tone: "ok" };
  }
  if (/apikey|oauth|api key/i.test(a)) {
    return { text: `${a} authorization`, tone: "key" };
  }
  return { text: a || "Unknown", tone: "other" };
}

function httpsLabel(https: string): { ok: boolean; text: string } {
  const yes = https === "Yes" || https === "true";
  return { ok: yes, text: yes ? "HTTPS available" : "HTTPS unavailable" };
}

function corsLabel(cors: string): { ok: boolean | null; text: string } {
  const c = cors.trim();
  if (c.toLowerCase() === "yes") return { ok: true, text: "CORS available" };
  if (c.toLowerCase() === "no") return { ok: false, text: "CORS unavailable" };
  return { ok: null, text: `CORS ${c || "unknown"}` };
}

function authDotClass(tone: "ok" | "key" | "other"): string {
  if (tone === "ok") return "bg-emerald-500";
  return "bg-red-500";
}

function httpsDotClass(ok: boolean): string {
  return ok ? "bg-emerald-500" : "bg-red-500";
}

function corsDotClass(ok: boolean | null): string {
  if (ok === true) return "bg-emerald-500";
  if (ok === false) return "bg-red-500";
  return "bg-red-400";
}

const DECORATION_ICONS = [Ghost, Braces, Zap] as const;

export type ApiHubApiCardProps = {
  entry: FreeApiEntry;
  selected: boolean;
  favorite?: boolean;
  onToggleFavorite?: () => void;
  onUse: () => void;
  /** 0 = ghost, 1 = braces, 2 = lightning — cycles in the hub grid */
  decorationVariant: number;
};

export function ApiHubApiCard({
  entry,
  selected,
  favorite = false,
  onToggleFavorite,
  onUse,
  decorationVariant,
}: ApiHubApiCardProps) {
  const auth = authLabel(entry.Auth);
  const https = httpsLabel(entry.HTTPS);
  const cors = corsLabel(entry.Cors);

  const DecorIcon = DECORATION_ICONS[decorationVariant % DECORATION_ICONS.length]!;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-md transition-all duration-300",
        CARD_BOX,
        "hover:border-slate-300 hover:shadow-lg",
        selected && "ring-2 ring-[#050040]/90 ring-offset-2 ring-offset-slate-50"
      )}
    >
      {onToggleFavorite ? (
        <button
          type="button"
          className="absolute top-2 right-2 z-20 rounded-full border border-slate-200/80 bg-white/95 p-1.5 text-amber-500 shadow-sm transition hover:bg-amber-50 hover:text-amber-600"
          aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={favorite}
          data-testid="api-hub-favorite-toggle"
          onClick={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            onToggleFavorite();
          }}
        >
          <Star
            className={cn("size-4", favorite && "fill-amber-400 text-amber-600")}
            aria-hidden
          />
        </button>
      ) : null}
      <button
        type="button"
        data-testid="api-hub-catalog-card"
        onClick={onUse}
        aria-label={`Select ${entry.API}`}
        className="flex min-h-0 flex-1 flex-col p-2 text-left sm:p-2.5"
      >
      <div
        className={cn(
          "relative isolate flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-3 shadow-inner sm:p-3.5"
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(to_right,#0500400a_1px,transparent_1px),linear-gradient(to_bottom,#0500400a_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_55%_55%_at_50%_45%,#000_65%,transparent_100%)]"
          aria-hidden
        />

        <DecorIcon
          className="pointer-events-none absolute -right-1 -bottom-1 size-16 text-[#050040]/12 transition-transform duration-500 group-hover:scale-[1.03] sm:size-[4.5rem]"
          strokeWidth={1}
          aria-hidden
        />

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-1.5">
          <span className="line-clamp-1 shrink-0 text-left text-[0.6rem] font-extrabold uppercase tracking-[0.16em] text-[#050040]">
            {entry.Category}
          </span>

          <h3 className="line-clamp-2 shrink-0 text-base font-bold leading-snug tracking-tight text-[#050040] md:text-[1.05rem]">
            {entry.API}
          </h3>

          <p className="line-clamp-3 shrink-0 text-xs font-medium leading-snug text-slate-700 md:text-sm">
            {entry.Description || "No description provided."}
          </p>

          <div className="mt-1.5 shrink-0 space-y-1 border-t border-slate-200/90 pt-2 text-[0.65rem] font-medium leading-tight text-slate-800 sm:text-[0.7rem]">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 flex-1 truncate">{auth.text}</span>
              {statusDot(authDotClass(auth.tone))}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 flex-1 truncate">{https.text}</span>
              {statusDot(httpsDotClass(https.ok))}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 flex-1 truncate">{cors.text}</span>
              {statusDot(corsDotClass(cors.ok))}
            </div>
          </div>
        </div>
      </div>
    </button>
    </div>
  );
}
