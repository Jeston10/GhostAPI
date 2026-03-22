"use client";

import { ApiPlayground } from "@/components/ui/api-playground";
import { GhostApiLogo } from "@/components/ui/ghost-api-logo";
import { GhostApiWorkflowBlock } from "@/components/ui/n8n-workflow-block-shadcnui";
import { ProductHighlightCard } from "@/components/ui/product-card";
import { Poppins } from "next/font/google";
import { Braces, Ghost, LayoutTemplate, Zap } from "lucide-react";
import React from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const HERO_GRID_BG =
  "https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/gridBackground.png";

export default function HeroSection() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      setMenuOpen(false);
    }

    if (menuOpen) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("click", onClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClickOutside);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <section
        className={`${poppins.className} w-full bg-cover bg-center bg-no-repeat pb-44 text-sm`}
        style={{ backgroundImage: `url('${HERO_GRID_BG}')` }}
      >
        <nav className="flex w-full items-center justify-between p-4 md:px-16 md:py-6 lg:px-24 xl:px-32">
          <a
            href="#"
            aria-label="GhostAPI home"
            className="inline-flex shrink-0 items-center leading-none"
          >
            <GhostApiLogo priority heightClass="h-7 md:h-16 lg:h-20 xl:h-24" />
          </a>

          <div
            id="menu"
            ref={menuRef}
            className={[
              "max-md:absolute max-md:top-0 max-md:left-0 max-md:h-full max-md:overflow-hidden max-md:bg-white/50 max-md:backdrop-blur max-md:transition-all max-md:duration-300",
              "flex items-center gap-8 font-medium",
              "max-md:flex-col max-md:justify-center",
              menuOpen ? "max-md:w-full" : "max-md:w-0",
            ].join(" ")}
            aria-hidden={!menuOpen}
          >
            <a href="#" className="hover:text-gray-600">
              Home
            </a>
            <a href="#about" className="hover:text-gray-600">
              About
            </a>
            <a href="#playground" className="hover:text-gray-600">
              Playground
            </a>
            <a href="#flow" className="hover:text-gray-600">
              How it works
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="aspect-square rounded-md bg-gray-800 p-2 font-medium text-white transition hover:bg-black md:hidden"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <a
            href="#playground"
            className="hidden rounded-full bg-gray-800 px-6 py-3 font-medium text-white transition hover:bg-black md:inline-block"
          >
            Open playground
          </a>

          <button
            id="open-menu"
            type="button"
            onClick={() => setMenuOpen(true)}
            className="aspect-square rounded-md bg-gray-800 p-2 font-medium text-white transition hover:bg-black md:hidden"
            aria-label="Open menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 12h16" />
              <path d="M4 18h16" />
              <path d="M4 6h16" />
            </svg>
          </button>
        </nav>

        <div className="mx-auto mt-40 flex w-max max-w-[calc(100%-2rem)] items-center gap-5 rounded-full border border-slate-300 px-4 py-2 pr-2 hover:border-slate-400/70 md:mt-32 md:gap-8 md:px-5 md:py-2.5 md:pr-2.5">
          <span className="min-w-0 text-center text-xs leading-snug md:text-left md:text-sm">
            Mock APIs in seconds — Define a schema and get a live endpoint
          </span>
          <a
            href="#about"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-neutral-900 md:gap-2 md:px-3.5 md:py-2 md:text-sm"
          >
            <span>Read more</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 19 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              className="shrink-0"
            >
              <path
                d="M3.959 9.5h11.083m0 0L9.501 3.958M15.042 9.5l-5.541 5.54"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        <h1 className="mx-auto mt-8 max-w-[850px] px-4 text-center text-4xl font-medium text-[#050040] md:text-7xl">
          Working mock APIs without a Backend
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm max-md:px-2 md:text-base">
          Define your JSON shape; every request returns fresh, realistic mocks.
          Ship the frontend against a live endpoint while the real backend
          catches up.
        </p>

        <div className="mx-auto mt-4 flex w-full flex-wrap items-center justify-center gap-3 px-4">
          <a
            href="#playground"
            className="rounded-full bg-slate-800 px-6 py-3 font-medium text-white transition hover:bg-black"
          >
            Get started
          </a>
          <a
            href="#about"
            className="flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 hover:bg-slate-200/30"
          >
            <span>Learn more</span>
            <svg
              width="6"
              height="8"
              viewBox="0 0 6 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M1.25.5 4.75 4l-3.5 3.5"
                stroke="#050040"
                strokeOpacity=".4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>

      <div
        className={`${poppins.className} bg-slate-50 text-[#050040]`}
      >
        <section
          id="about"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:py-24"
        >
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#050040] md:text-4xl">
            Get to know more about GhostAPI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-slate-600 md:text-lg">
            Lightweight mock endpoints from schema. Realistic data on every call,
            so your UI can move before production APIs exist.
          </p>
          <div className="mt-10 grid w-full grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-5">
            <ProductHighlightCard
              category="What it is"
              categoryIcon={<LayoutTemplate className="h-5 w-5" aria-hidden />}
              title="Instant mock endpoints"
              description="A SaaS tool that turns a JSON response shape into a working GET endpoint. No database or server code required to start integrating your frontend."
              decoration={
                <Ghost
                  className="h-28 w-28 sm:h-32 sm:w-32"
                  strokeWidth={1}
                  aria-hidden
                />
              }
            />
            <ProductHighlightCard
              category="How it works"
              categoryIcon={<Braces className="h-5 w-5" aria-hidden />}
              title="Schema first"
              description="You define fields and types; we store the blueprint and issue a unique URL. Each request returns freshly generated values using rules and libraries like Faker."
              decoration={
                <Braces
                  className="h-28 w-28 sm:h-32 sm:w-32"
                  strokeWidth={1}
                  aria-hidden
                />
              }
            />
            <ProductHighlightCard
              category="Why teams use it"
              categoryIcon={<Zap className="h-5 w-5" aria-hidden />}
              title="Ship faster"
              description="Frontend and QA can hit a live-like API immediately while backend work catches up—fewer blockers, quicker iterations, easier scenario testing."
              decoration={
                <Zap
                  className="h-28 w-28 sm:h-32 sm:w-32"
                  strokeWidth={1}
                  aria-hidden
                />
              }
            />
          </div>
        </section>

        <section
          id="playground"
          className="scroll-mt-24 border-y border-slate-200 bg-white px-4 py-12 md:py-16"
        >
          <ApiPlayground />
        </section>

        <section
          id="flow"
          className="mx-auto max-w-[min(100%,1320px)] scroll-mt-24 overflow-x-hidden px-4 py-16 md:py-24"
        >
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#050040] md:text-4xl">
            Get to know how GhostAPI works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Five steps from schema to live Mocks
          </p>
          <div className="mt-10">
            <GhostApiWorkflowBlock />
          </div>
        </section>

        <footer className="border-t border-white/10 bg-black px-4 py-12 text-white">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
            <div>
              <GhostApiLogo heightClass="h-9 md:h-10" className="mx-auto md:mx-0" />
              <p className="mt-4 max-w-xs text-sm text-slate-300 md:mt-5">
                Instant mock APIs from schema — bridge frontend and backend
                workflows without waiting on the server.
              </p>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-slate-300 md:justify-end">
              <a href="#about" className="transition hover:text-white">
                About
              </a>
              <a href="#playground" className="transition hover:text-white">
                Playground
              </a>
              <a href="#flow" className="transition hover:text-white">
                Flow
              </a>
            </nav>
          </div>
          <p className="mx-auto mt-10 max-w-4xl border-t border-white/10 pt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} API Ghost. Lightweight SaaS for
            developer productivity.
          </p>
        </footer>
      </div>
    </>
  );
}
