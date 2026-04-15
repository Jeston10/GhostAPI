"use client";

import { GhostApiLogo } from "@/components/ui/ghost-api-logo";
import Link from "next/link";
import * as React from "react";

export type SiteNavProps = {
  currentPage: "home" | "api-hub" | "tools" | "api-testing";
  /** `hero` matches the landing hero bar; `compact` matches API Hub / inner pages. */
  variant?: "hero" | "compact";
};

function sectionHref(currentPage: SiteNavProps["currentPage"], hash: string): string {
  return currentPage === "api-hub" ? `/${hash}` : hash;
}

export function SiteNav({ currentPage, variant = "hero" }: SiteNavProps) {
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

  const about = sectionHref(currentPage, "#about");
  const playground = sectionHref(currentPage, "#playground");
  const flow = sectionHref(currentPage, "#flow");

  const isHero = variant === "hero";
  const navClass = isHero
    ? "flex w-full items-center justify-between p-4 text-slate-800 md:px-16 md:py-6 lg:px-24 xl:px-32"
    : "flex w-full items-center justify-between gap-3 p-4 text-slate-800 md:px-12 md:py-4 lg:px-16";
  const logoClass = isHero
    ? "h-7 md:h-16 lg:h-20 xl:h-24"
    : "h-7 md:h-10";

  return (
    <nav className={navClass}>
      <Link
        href="/"
        aria-label="GhostAPI home"
        className="inline-flex shrink-0 items-center leading-none"
      >
        <GhostApiLogo priority={isHero} heightClass={logoClass} />
      </Link>

      <div
        id="site-menu"
        ref={menuRef}
        className={[
          "max-md:absolute max-md:top-0 max-md:left-0 max-md:z-50 max-md:h-full max-md:overflow-hidden max-md:bg-white/50 max-md:backdrop-blur max-md:transition-all max-md:duration-300",
          "flex items-center gap-6 font-semibold md:gap-8",
          "max-md:flex-col max-md:justify-center",
          menuOpen ? "max-md:w-full" : "max-md:w-0",
        ].join(" ")}
        aria-hidden={!menuOpen}
      >
        <Link
          href="/"
          className={
            currentPage === "home"
              ? "text-[#050040]"
              : "transition-colors hover:text-gray-600"
          }
          aria-current={currentPage === "home" ? "page" : undefined}
        >
          Home
        </Link>
        <a href={about} className="transition-colors hover:text-gray-600">
          About
        </a>
        <Link
          href="/tools"
          className={
            currentPage === "tools"
              ? "text-[#050040]"
              : "transition-colors hover:text-gray-600"
          }
          aria-current={currentPage === "tools" ? "page" : undefined}
        >
          Tools
        </Link>
        <Link
          href="/tools/api-testing"
          className={
            currentPage === "api-testing"
              ? "text-[#050040]"
              : "transition-colors hover:text-gray-600"
          }
          aria-current={currentPage === "api-testing" ? "page" : undefined}
        >
          API Testing
        </Link>
        <Link
          href="/api-hub"
          className={
            currentPage === "api-hub"
              ? "text-[#050040]"
              : "transition-colors hover:text-gray-600"
          }
          aria-current={currentPage === "api-hub" ? "page" : undefined}
        >
          API Hub
        </Link>
        <a href={playground} className="transition-colors hover:text-gray-600">
          Playground
        </a>
        <a href={flow} className="transition-colors hover:text-gray-600">
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
        href={playground}
        className={
          isHero
            ? "hidden rounded-full bg-gray-800 px-6 py-3 font-medium text-white transition hover:bg-black md:inline-block"
            : "hidden shrink-0 rounded-full bg-gray-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-black md:inline-block"
        }
      >
        Open playground
      </a>

      <button
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
  );
}
