"use client";

/**
 * Animated platform bento — spotlight grid + staggered motion (21st.dev-style patterns).
 * Reference: https://21st.dev/community/components/s/bento-features
 */

import Link from "next/link";
import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  Braces,
  Check,
  Code2,
  Gauge,
  LineChart,
  Terminal,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Tile = {
  href: string;
  title: string;
  description: string;
  bullets: readonly string[];
  icon: LucideIcon;
  span: string;
  badge?: string;
  featured?: boolean;
  /** Monospace line inside the card */
  codeSnippet?: string;
};

const TILES: Tile[] = [
  {
    href: "/#playground",
    title: "Mock playground",
    description:
      "A unique GET URL from your JSON blueprint — use it while the real API is still in flight.",
    bullets: [
      "Schema-driven payloads; fresh values each request",
      "Share one link with QA and designers",
    ],
    icon: Code2,
    span: "lg:col-span-2 lg:row-span-2 lg:min-h-[340px]",
    badge: "Core product",
    featured: true,
    codeSnippet: "GET /api/mock/<slug>  →  dynamic JSON from your schema",
  },
  {
    href: "/api-hub",
    title: "API Hub",
    description:
      "Browse public APIs, try requests in the browser, and inspect shapes before you integrate.",
    bullets: ["Curated catalog with try-it panels", "Jump from discovery to implementation"],
    icon: Boxes,
    span: "lg:col-span-2 lg:min-h-[168px]",
    badge: "Discovery",
  },
  {
    href: "/tools",
    title: "Developer tools",
    description:
      "TypeForge, Curlify, and testers — types, snippets, and checks beside your mocks.",
    bullets: ["Copy-paste outputs for repos and docs", "Same UI patterns across GhostAPI"],
    icon: Wrench,
    span: "lg:col-span-2 lg:min-h-[168px]",
    badge: "Toolkit",
  },
  {
    href: "/tools/api-testing",
    title: "API testing",
    description:
      "Fire structured requests and read status, headers, and bodies in one place.",
    bullets: ["One panel for method, URL, headers, body", "Smoke-test gateways and mocks"],
    icon: Activity,
    span: "lg:col-span-1 min-h-[220px]",
    badge: "QA-ready",
  },
  {
    href: "/typeforge",
    title: "TypeForge",
    description:
      "Infer TypeScript and Zod from JSON samples — tighten contracts before wiring fetch.",
    bullets: ["Nested objects and arrays supported"],
    icon: Braces,
    span: "lg:col-span-1 min-h-[220px]",
    badge: "Types",
  },
  {
    href: "/curlify",
    title: "Curlify",
    description:
      "Build or import a request; export cURL, fetch, Axios, or Python.",
    bullets: ["cURL import supported"],
    icon: Terminal,
    span: "lg:col-span-1 min-h-[220px]",
    badge: "Snippets",
  },
  {
    href: "/tools/speed-test",
    title: "Speed test",
    description:
      "Measure latency to a URL from our infra — catch slow regions early.",
    bullets: ["Readable timings for before/after checks"],
    icon: Gauge,
    span: "lg:col-span-1 min-h-[220px]",
    badge: "Perf",
  },
  {
    href: "/tools/load-test",
    title: "Load test",
    description:
      "Configurable concurrency against mocks or live URLs — spot timeouts before launch.",
    bullets: ["No local runner script required"],
    icon: LineChart,
    span: "lg:col-span-4 lg:min-h-[200px]",
    badge: "Scale check",
  },
];

export function LandingEcosystemSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);

  const spotlightBackground = useMotionTemplate`
    radial-gradient(620px circle at ${mx}px ${my}px,
      oklch(0.88 0.09 85 / 0.085),
      oklch(0.62 0.06 270 / 0.042) 40%,
      transparent 58%)
  `;

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!sectionRef.current || reduceMotion) return;
      const r = sectionRef.current.getBoundingClientRect();
      mx.set(e.clientX - r.left);
      my.set(e.clientY - r.top);
    },
    [mx, my, reduceMotion]
  );

  const onPointerLeave = React.useCallback(() => {
    mx.set(-400);
    my.set(-400);
  }, [mx, my]);

  const containerVariants = React.useMemo(
    () => ({
      hidden: {},
      show: {
        transition: {
          staggerChildren: reduceMotion ? 0 : 0.06,
          delayChildren: reduceMotion ? 0 : 0.06,
        },
      },
    }),
    [reduceMotion]
  );

  const itemVariants = React.useMemo(
    () =>
      reduceMotion
        ? {
            hidden: { opacity: 1, y: 0, scale: 1 },
            show: { opacity: 1, y: 0, scale: 1 },
          }
        : {
            hidden: { opacity: 0, y: 28, scale: 0.98 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: "spring" as const, stiffness: 380, damping: 32 },
            },
          },
    [reduceMotion]
  );

  return (
    <section
      ref={sectionRef}
      id="ecosystem"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative isolate scroll-mt-20 overflow-hidden border-t border-amber-100/60 bg-gradient-to-b from-amber-50/35 via-white to-slate-50/55 px-4 py-14 sm:scroll-mt-24 sm:px-5 sm:py-16 md:px-16 md:py-20 lg:px-24 xl:px-32"
    >
      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#050040]/[0.04] blur-3xl"
            animate={{
              x: [0, 24, 0],
              y: [0, 16, 0],
              opacity: [0.35, 0.5, 0.35],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-20 bottom-40 h-80 w-80 rounded-full bg-amber-200/45 blur-3xl"
            animate={{
              x: [0, -18, 0],
              y: [0, -22, 0],
              opacity: [0.28, 0.42, 0.28],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.85]"
          style={{ background: spotlightBackground }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#05004003_1px,transparent_1px),linear-gradient(to_bottom,#05004003_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black_12%,black_78%,transparent)]"
        aria-hidden
      />

      <motion.header
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-4 text-center sm:px-6 md:px-10 lg:px-14 xl:px-20"
      >
        <span className="inline-flex items-center justify-center rounded-full border border-amber-200/80 bg-gradient-to-b from-amber-50 to-white px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-amber-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)]">
          GhostAPI platform
        </span>
        <h2 className="mx-auto mt-4 max-w-none text-balance text-2xl font-bold tracking-tight text-[#050040] sm:text-3xl md:text-4xl lg:text-[2.5rem] lg:leading-[1.15]">
          From schema to requests — mocks,{" "}
          <span className="text-yellow-600">catalogs, and tooling</span> in one grid
        </h2>
        <p className="mx-auto mt-4 max-w-none text-pretty text-base font-medium leading-relaxed text-slate-600 md:text-lg">
          Working endpoints first: mocks from JSON shapes, third-party APIs in the hub, then TypeForge, Curlify, and testers — each card opens the tool.
        </p>
        <p className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[13px] font-semibold tracking-wide text-slate-600">
          <span className="text-slate-500">Includes</span>
          <span className="rounded-full border border-amber-200/70 bg-amber-50/90 px-3 py-1 text-amber-950 shadow-sm">
            Mocks
          </span>
          <span className="text-amber-300/90">·</span>
          <span className="rounded-full border border-amber-200/70 bg-amber-50/90 px-3 py-1 text-amber-950 shadow-sm">
            Hub
          </span>
          <span className="text-amber-300/90">·</span>
          <span className="rounded-full border border-amber-200/70 bg-amber-50/90 px-3 py-1 text-amber-950 shadow-sm">
            TypeForge
          </span>
          <span className="text-amber-300/90">·</span>
          <span className="rounded-full border border-amber-200/70 bg-amber-50/90 px-3 py-1 text-amber-950 shadow-sm">
            Curlify
          </span>
          <span className="text-amber-300/90">·</span>
          <span className="rounded-full border border-amber-200/70 bg-amber-50/90 px-3 py-1 text-amber-950 shadow-sm">
            Testing
          </span>
        </p>
      </motion.header>

      {/* Light “finished” grid shell */}
      <div className="relative mx-auto mt-10 max-w-6xl rounded-[1.75rem] border border-amber-100/90 bg-white/95 p-4 shadow-[0_20px_80px_-24px_rgba(180,83,9,0.06)] ring-1 ring-amber-100/50 md:mt-12 md:p-6 lg:p-8">
        <div className="mb-4 rounded-xl border border-amber-100/80 bg-gradient-to-r from-amber-50/50 to-transparent px-3 py-3 text-left md:px-4">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-amber-800/80">
            Surface map
          </p>
          <p className="mt-1 text-base font-bold text-[#050040] md:text-lg">
            Tap a tile — mocks and hub are largest; bottom row is generators & perf.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial={reduceMotion ? "show" : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, margin: "-48px", amount: 0.08 }}
          className="grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-4 lg:auto-rows-fr"
        >
          {TILES.map((tile) => (
            <motion.div
              key={tile.href}
              variants={itemVariants}
              className={cn("min-h-0", tile.span)}
            >
              <Link
                href={tile.href}
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/90 p-4 shadow-sm ring-1 ring-slate-100/90 transition-[box-shadow,transform,border-color] duration-300 md:p-5",
                  "hover:z-[1] hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md hover:shadow-slate-200/80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  tile.featured &&
                    "from-white via-amber-50/20 to-slate-50/75 ring-amber-100/60 lg:p-6"
                )}
              >
                <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
                  <span
                    aria-hidden
                    className="ecosystem-card-shine-trail absolute left-0 top-0 h-full w-[48%] bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 group-hover:opacity-100"
                  />
                </span>

                <div className="relative flex flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-[#050040] shadow-sm transition-transform duration-300 group-hover:scale-[1.03]",
                        tile.featured && "h-11 w-11 rounded-2xl md:h-12 md:w-12"
                      )}
                    >
                      <tile.icon
                        className={cn("h-[1.15rem] w-[1.15rem]", tile.featured && "md:h-6 md:w-6")}
                        strokeWidth={2}
                        aria-hidden
                      />
                    </span>
                    {tile.badge ? (
                      <span className="rounded-full border border-amber-200/85 bg-amber-50/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950">
                        {tile.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "font-bold tracking-tight text-[#050040]",
                        tile.featured ? "text-lg md:text-xl" : "text-base md:text-[1.0625rem]"
                      )}
                    >
                      {tile.title}
                    </span>
                    <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-600 md:text-sm">
                      {tile.description}
                    </p>
                    {tile.codeSnippet ? (
                      <code className="mt-3 block rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 font-mono text-[11px] leading-snug text-amber-950 md:text-xs">
                        {tile.codeSnippet}
                      </code>
                    ) : null}
                    <ul className="mt-3 space-y-1.5 border-t border-slate-100/90 pt-3">
                      {tile.bullets.map((line) => (
                        <li
                          key={line}
                          className="flex gap-2 text-[12px] font-medium leading-snug text-slate-600 md:text-[13px]"
                        >
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600"
                            strokeWidth={2.5}
                            aria-hidden
                          />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-800 transition-transform duration-300 group-hover:translate-x-0.5 md:text-xs">
                    Go to {tile.title.toLowerCase()}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.p
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        whileInView={reduceMotion ? undefined : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="relative mx-auto mt-8 max-w-3xl text-center text-sm font-medium text-slate-600 md:mt-10"
      >
        <Link href="/#playground" className="font-semibold text-yellow-700 underline decoration-amber-200 underline-offset-2 hover:text-amber-900 hover:decoration-amber-400/70">
          Playground
        </Link>
        {" · "}
        <Link href="/api-hub" className="font-semibold text-yellow-700 underline decoration-amber-200 underline-offset-2 hover:text-amber-900 hover:decoration-amber-400/70">
          API Hub
        </Link>
        {" · "}
        <Link href="/tools" className="font-semibold text-yellow-700 underline decoration-amber-200 underline-offset-2 hover:text-amber-900 hover:decoration-amber-400/70">
          Tools
        </Link>
        {" · "}
        <Link href="/guides/software-testing" className="font-semibold text-yellow-700 underline decoration-amber-200 underline-offset-2 hover:text-amber-900 hover:decoration-amber-400/70">
          Guides
        </Link>
        <span className="text-slate-500"> — footer repeats shortcuts too.</span>
      </motion.p>
    </section>
  );
}
