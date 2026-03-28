"use client";

import { ApiHub } from "@/components/ui/api-hub";
import { GhostApiLogo } from "@/components/ui/ghost-api-logo";
import { HERO_GRID_BACKGROUND } from "@/lib/hero-theme";
import {
  PLAYGROUND_PREFILL_STORAGE_KEY,
  type PlaygroundPrefillPayload,
} from "@/lib/playground-prefill";
import { Github } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApiHubPage() {
  const router = useRouter();

  const onApplyMockTemplate = (request: string, response: string) => {
    const payload: PlaygroundPrefillPayload = { request, response };
    try {
      sessionStorage.setItem(
        PLAYGROUND_PREFILL_STORAGE_KEY,
        JSON.stringify(payload)
      );
    } catch {
      /* quota / private mode */
    }
    router.push("/#playground");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#050040]">
      <section
        className="w-full bg-cover bg-center bg-no-repeat pb-10 md:pb-14"
        style={{ backgroundImage: `url('${HERO_GRID_BACKGROUND}')` }}
      >
        <nav className="flex w-full flex-wrap items-center justify-between gap-4 p-4 md:px-12 md:py-6 lg:px-20">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center leading-none"
            aria-label="GhostAPI home"
          >
            <GhostApiLogo priority heightClass="h-7 md:h-12" />
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-5 text-sm font-medium md:gap-8">
            <Link href="/" className="transition hover:text-gray-600">
              Home
            </Link>
            <Link href="/#about" className="transition hover:text-gray-600">
              About
            </Link>
            <span className="font-semibold text-[#050040]" aria-current="page">
              API Hub
            </span>
            <Link href="/#playground" className="transition hover:text-gray-600">
              Playground
            </Link>
            <Link href="/#flow" className="transition hover:text-gray-600">
              How it works
            </Link>
            <a
              href="https://github.com/public-apis/public-apis"
              target="_blank"
              rel="noreferrer"
              className="rounded-md p-1.5 text-[#050040]/80 transition hover:bg-black/5 hover:text-[#050040]"
              aria-label="Public APIs on GitHub"
            >
              <Github className="size-6" strokeWidth={2} aria-hidden />
            </a>
            <Link
              href="/#playground"
              className="hidden rounded-full bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black md:inline-block"
            >
              Open playground
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-4xl px-4 pt-6 text-center md:pt-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#050040] md:text-6xl md:leading-tight">
            Browse APIs
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-relaxed text-slate-700 md:text-base">
            Explore public APIs from the community catalog. Open docs, test through our proxy, or send
            metadata to the mock playground.
          </p>
        </div>
      </section>

      <main className="border-t border-slate-200 bg-slate-50 px-4 py-10 md:px-8 md:py-14">
        <ApiHub onApplyMockTemplate={onApplyMockTemplate} />
      </main>

      <footer className="border-t border-white/10 bg-black px-4 py-12 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div>
            <Link href="/" className="inline-block" aria-label="GhostAPI home">
              <GhostApiLogo heightClass="h-9 md:h-10" className="mx-auto md:mx-0" />
            </Link>
            <p className="mt-4 max-w-xs text-sm text-slate-300 md:mt-5">
              Instant mock APIs from schema. Bridge frontend and backend workflows without waiting on the
              server.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-slate-300 md:justify-end">
            <Link href="/#about" className="transition hover:text-white">
              About
            </Link>
            <span className="text-white">API Hub</span>
            <Link href="/#playground" className="transition hover:text-white">
              Playground
            </Link>
            <Link href="/#flow" className="transition hover:text-white">
              Flow
            </Link>
          </nav>
        </div>
        <p className="mx-auto mt-10 max-w-4xl border-t border-white/10 pt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} API Ghost. Lightweight SaaS for developer productivity.
        </p>
      </footer>
    </div>
  );
}
