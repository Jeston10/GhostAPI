"use client";

import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ApiPlayground } from "@/components/ui/api-playground";
import { GhostApiWorkflowBlock } from "@/components/ui/n8n-workflow-block-shadcnui";
import { ProductHighlightCard } from "@/components/ui/product-card";
import { HERO_GRID_BACKGROUND, HERO_SECTION_CLASS } from "@/lib/hero-theme";
import { Braces, Ghost, LayoutTemplate, Zap } from "lucide-react";
import { GhostApiLogo } from "@/components/ui/ghost-api-logo";
import Link from "next/link";
import React from "react";

export default function HeroSection() {
  return (
    <>
      <section
        className={HERO_SECTION_CLASS}
        style={{ backgroundImage: `url('${HERO_GRID_BACKGROUND}')` }}
      >
        <SiteNav currentPage="home" variant="hero" />

        <div className="mx-auto mt-40 flex w-max max-w-[calc(100%-2rem)] items-center gap-5 rounded-full border border-slate-400/80 bg-white/55 px-4 py-2 pr-2 shadow-sm backdrop-blur-sm transition hover:border-slate-500/80 hover:bg-white/70 md:mt-32 md:gap-8 md:px-5 md:py-2.5 md:pr-2.5">
          <span className="min-w-0 text-center text-xs font-semibold leading-snug text-slate-900 md:text-left md:text-sm">
            Mock APIs in seconds — Define a schema and get a live endpoint
          </span>
          <a
            href="#about"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white/90 md:gap-2 md:px-3.5 md:py-2 md:text-sm"
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

        <h1 className="mx-auto mt-8 max-w-[850px] px-4 text-center text-4xl font-extrabold leading-[1.08] tracking-tight text-[#050040] md:text-7xl md:leading-[1.06]">
          Working mock APIs without a Backend
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-sm font-medium leading-relaxed text-slate-800 max-md:px-2 md:text-lg">
          Define your JSON shape, every request returns fresh, realistic mocks.
          Ship the frontend against a live endpoint while the real backend
          catches up.
        </p>

        <div className="mx-auto mt-4 flex w-full flex-wrap items-center justify-center gap-3 px-4">
          <a
            href="#playground"
            className="rounded-full bg-slate-800 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white/90"
          >
            Get started
          </a>
          <a
            href="#about"
            className="flex items-center gap-2 rounded-full border border-slate-400/90 bg-white/40 px-6 py-3 font-semibold text-slate-900 shadow-sm backdrop-blur-sm transition hover:border-slate-500 hover:bg-white/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white/90"
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

      <div className="bg-slate-50 font-sans text-[#050040]">
        <section
          id="about"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 md:py-24"
        >
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#050040] md:text-4xl">
            Get to know more about GhostAPI
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base font-medium leading-relaxed text-slate-800 md:text-lg">
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
          <h2 className="text-center text-3xl font-bold tracking-tight text-[#050040] md:text-4xl">
            Get to know how GhostAPI works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center font-medium text-slate-800">
            Five steps from schema to live Mocks
          </p>
          <div className="mt-10">
            <GhostApiWorkflowBlock />
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
