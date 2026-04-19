"use client";

import { GhostApiLogo } from "@/components/ui/ghost-api-logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

const navLinkClass =
  "rounded-md px-1.5 py-1 -mx-0.5 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white max-md:min-h-11 max-md:px-4 max-md:py-2.5 max-md:text-base";

export type SiteNavProps = {
  currentPage: "home" | "api-hub" | "tools" | "api-testing" | "contact";
  /** `hero` matches the landing hero bar; `compact` matches API Hub / inner pages. */
  variant?: "hero" | "compact";
};

function sectionHref(currentPage: SiteNavProps["currentPage"], hash: string): string {
  return currentPage === "api-hub" ? `/${hash}` : hash;
}

function useMaxMd() {
  const [maxMd, setMaxMd] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMaxMd(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return maxMd;
}

export function SiteNav({ currentPage, variant = "hero" }: SiteNavProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const maxMd = useMaxMd();

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

  const about = sectionHref(currentPage, "#about");
  const playground = sectionHref(currentPage, "#playground");
  const flow = sectionHref(currentPage, "#flow");

  const isHero = variant === "hero";
  const navClass = isHero
    ? "flex w-full items-center justify-between gap-3 px-4 pt-4 pb-4 text-slate-800 max-md:pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 md:px-16 md:py-6 lg:px-24 xl:px-32"
    : "flex w-full items-center justify-between gap-3 px-4 pt-4 pb-4 text-slate-800 max-md:pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 md:px-12 md:py-4 lg:px-16";
  const logoClass = isHero
    ? "h-7 md:h-16 lg:h-20 xl:h-24"
    : "h-7 md:h-10";

  return (
    <nav className={navClass}>
      <Link
        href="/"
        aria-label="GhostAPI home"
        className="inline-flex shrink-0 items-center leading-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <GhostApiLogo priority={isHero} heightClass={logoClass} />
      </Link>

      <div
        id="site-menu"
        ref={menuRef}
        className={[
          "max-md:absolute max-md:top-0 max-md:left-0 max-md:z-50 max-md:h-[100dvh] max-md:overflow-y-auto max-md:overscroll-contain max-md:bg-white/92 max-md:backdrop-blur-md max-md:backdrop-saturate-150 max-md:ring-1 max-md:ring-black/[0.06] max-md:transition-all max-md:duration-300 max-md:pt-[env(safe-area-inset-top)] max-md:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          "flex items-center gap-6 font-semibold md:gap-8",
          "max-md:flex-col max-md:justify-center",
          menuOpen ? "max-md:w-full" : "max-md:w-0 max-md:pointer-events-none max-md:invisible",
        ].join(" ")}
        aria-hidden={maxMd && !menuOpen ? true : undefined}
        inert={maxMd && !menuOpen ? true : undefined}
      >
        <Link
          href="/"
          className={cn(
            navLinkClass,
            currentPage === "home" ? "text-[#050040]" : "text-slate-700 hover:text-[#050040]"
          )}
          aria-current={currentPage === "home" ? "page" : undefined}
        >
          Home
        </Link>
        <a href={about} className={cn(navLinkClass, "text-slate-700 hover:text-[#050040]")}>
          About
        </a>
        <Link
          href="/tools"
          className={cn(
            navLinkClass,
            currentPage === "tools" ? "text-[#050040]" : "text-slate-700 hover:text-[#050040]"
          )}
          aria-current={currentPage === "tools" ? "page" : undefined}
        >
          Tools
        </Link>
        <Link
          href="/tools/api-testing"
          className={cn(
            navLinkClass,
            currentPage === "api-testing" ? "text-[#050040]" : "text-slate-700 hover:text-[#050040]"
          )}
          aria-current={currentPage === "api-testing" ? "page" : undefined}
        >
          API Testing
        </Link>
        <Link
          href="/api-hub"
          className={cn(
            navLinkClass,
            currentPage === "api-hub" ? "text-[#050040]" : "text-slate-700 hover:text-[#050040]"
          )}
          aria-current={currentPage === "api-hub" ? "page" : undefined}
        >
          API Hub
        </Link>
        <a href={playground} className={cn(navLinkClass, "text-slate-700 hover:text-[#050040]")}>
          Playground
        </a>
        <Link
          href="/contact"
          className={cn(
            navLinkClass,
            currentPage === "contact" ? "text-[#050040]" : "text-slate-700 hover:text-[#050040]"
          )}
          aria-current={currentPage === "contact" ? "page" : undefined}
        >
          Contact
        </Link>
        <a href={flow} className={cn(navLinkClass, "text-slate-700 hover:text-[#050040]")}>
          How it works
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="aspect-square min-h-11 min-w-11 touch-manipulation rounded-md bg-gray-800 p-2 font-medium text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:hidden"
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

      <Link
        href="/contact"
        className={
          isHero
            ? "hidden rounded-full bg-[#050040] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#050040]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:inline-block"
            : "hidden shrink-0 rounded-full bg-[#050040] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#050040]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:inline-block"
        }
      >
        Contact us
      </Link>

      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="aspect-square min-h-11 min-w-11 touch-manipulation rounded-md bg-gray-800 p-2 font-medium text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:hidden"
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
  );
}
