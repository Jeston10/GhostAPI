"use client";

import { GhostApiLogo } from "@/components/ui/ghost-api-logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

const navLinkClass =
  "whitespace-nowrap px-1.5 py-2 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:px-1.5 lg:py-1 lg:text-[15px]";

export type SiteNavProps = {
  currentPage: "home" | "api-hub" | "tools" | "api-testing" | "contact" | "guides";
  /** `hero` matches the landing hero bar; `compact` matches API Hub / inner pages. */
  variant?: "hero" | "compact";
};

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

  const isHero = variant === "hero";
  const navClass = isHero
    ? "flex w-full min-w-0 flex-nowrap items-center justify-between gap-2 px-4 pt-4 pb-4 text-slate-800 max-lg:gap-3 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 md:px-16 md:py-6 lg:px-24 xl:px-32"
    : "flex w-full min-w-0 flex-nowrap items-center justify-between gap-2 px-4 pt-4 pb-4 text-slate-800 max-lg:gap-3 max-lg:pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 md:px-12 md:py-4 lg:px-16";
  const logoClass = isHero
    ? "h-7 md:h-16 lg:h-20 xl:h-24"
    : "h-7 md:h-10";

  const linkBase = (active: boolean) =>
    cn(
      navLinkClass,
      "-mx-0.5 max-lg:w-full max-lg:max-w-none max-lg:rounded-none max-lg:px-5 max-lg:py-3 max-lg:text-base",
      active ? "text-[#050040]" : "text-slate-700 hover:text-[#050040]"
    );

  const navLinks = (
    <>
      <Link
        href="/"
        className={linkBase(currentPage === "home")}
        aria-current={currentPage === "home" ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        href="/guides/software-testing"
        className={linkBase(currentPage === "guides")}
        aria-current={currentPage === "guides" ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        Guides
      </Link>
      <Link
        href="/tools"
        className={linkBase(currentPage === "tools")}
        aria-current={currentPage === "tools" ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        Tools
      </Link>
      <Link
        href="/tools/api-testing"
        className={linkBase(currentPage === "api-testing")}
        aria-current={currentPage === "api-testing" ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        API Testing
      </Link>
      <Link
        href="/api-hub"
        className={linkBase(currentPage === "api-hub")}
        aria-current={currentPage === "api-hub" ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        API Hub
      </Link>
      <Link
        href="/contact"
        className={linkBase(currentPage === "contact")}
        aria-current={currentPage === "contact" ? "page" : undefined}
        onClick={() => setMenuOpen(false)}
      >
        Contact
      </Link>
    </>
  );

  return (
    <nav className={navClass} aria-label="Primary">
      <Link
        href="/"
        aria-label="GhostAPI home"
        className="inline-flex min-w-0 shrink-0 items-center leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <GhostApiLogo priority={isHero} heightClass={logoClass} />
      </Link>

      {/* lg+: single-row links (no wrapping); &lt; lg: drawer only */}
      <div className="hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-4 font-semibold lg:flex lg:gap-6 xl:gap-8">
        {navLinks}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Compact CTA next to menu on phones / tablets */}
        <Link
          href="/contact"
          className={
            isHero
              ? "inline-flex shrink-0 rounded-none bg-[#050040] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#050040]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-4 sm:text-sm lg:hidden"
              : "inline-flex shrink-0 rounded-none bg-[#050040] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#050040]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:text-sm lg:hidden"
          }
        >
          Contact us
        </Link>

        <Link
          href="/contact"
          className={
            isHero
              ? "hidden rounded-none bg-[#050040] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#050040]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-6 sm:py-3 lg:inline-block"
              : "hidden shrink-0 rounded-none bg-[#050040] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#050040]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-4 sm:text-sm lg:inline-block"
          }
        >
          Contact us
        </Link>

        {/* Drawer: screens &lt; lg */}
        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex aspect-square min-h-11 min-w-11 touch-manipulation items-center justify-center bg-gray-800 p-2 font-medium text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-expanded={menuOpen}
            aria-controls="site-menu-drawer"
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

          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40 bg-black/40"
                aria-label="Close menu backdrop"
                onClick={() => setMenuOpen(false)}
              />
              <div
                id="site-menu-drawer"
                ref={menuRef}
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw-3rem,20rem)] flex-col border-l border-neutral-200 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                  <span className="text-sm font-bold text-[#050040]">Menu</span>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="flex aspect-square min-h-10 min-w-10 items-center justify-center bg-gray-800 p-2 text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#050040]/30"
                    aria-label="Close menu"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
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
                <nav className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto overscroll-contain py-2 font-semibold">
                  {navLinks}
                </nav>
                <div className="border-t border-neutral-200 p-4">
                  <Link
                    href="/contact"
                    onClick={() => setMenuOpen(false)}
                    className="block w-full rounded-none bg-[#050040] py-3 text-center text-sm font-semibold text-white hover:bg-[#050040]/90"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

    </nav>
  );
}
