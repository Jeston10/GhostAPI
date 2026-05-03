"use client";

import { cn } from "@/lib/utils";
import {
  lessonHref,
  SOFTWARE_TESTING_NAV_SECTIONS,
} from "@/lib/guides/software-testing-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

function TopicNavList({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string | null;
}) {
  return (
    <>
      {SOFTWARE_TESTING_NAV_SECTIONS.map((section) => (
        <div key={section.id} className="border-b border-neutral-200">
          <p className="bg-neutral-100 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-600">
            {section.label}
          </p>
          <ul className="py-0">
            {section.items.map((item) => {
              const href = lessonHref(item.slug);
              const active = pathname === href;
              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "block border-l-[3px] px-3 py-2 text-[13px] leading-snug transition-colors",
                      active
                        ? "border-[#050040] bg-white font-semibold text-[#050040]"
                        : "border-transparent text-neutral-800 hover:bg-neutral-100 hover:text-[#050040]"
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

export function SoftwareTestingGuideSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex w-full shrink-0 flex-col border-neutral-300 md:absolute md:bottom-0 md:left-0 md:top-0 md:w-[272px] md:border-r md:bg-neutral-50">
      <div className="flex items-center gap-2 border-b border-neutral-300 bg-neutral-100 px-3 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-none border border-neutral-400 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900"
        >
          All topics
        </button>
        <span className="text-xs font-medium text-neutral-600">Software testing guide</span>
      </div>

      <aside className="relative hidden min-h-0 flex-1 flex-col overflow-hidden md:flex">
        <div className="shrink-0 border-b border-neutral-300 bg-white px-3 py-3">
          <Link href="/guides/software-testing" className="text-[13px] font-bold uppercase tracking-wide text-neutral-700 hover:text-[#050040]">
            Software Testing
          </Link>
          <p className="mt-1 text-[11px] font-medium leading-snug text-neutral-500">
            Tutorial-style index · GhostAPI
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8 pt-0">
          <TopicNavList pathname={pathname} />
        </div>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close topics menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-full max-w-[20rem] flex-col border-r border-neutral-300 bg-neutral-50 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-300 bg-white px-3 py-2">
              <span className="text-sm font-bold text-[#050040]">Topics</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-none border border-neutral-400 bg-white px-2 py-1 text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6">
              <TopicNavList pathname={pathname} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
