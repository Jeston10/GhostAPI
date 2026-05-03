import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  sectionLabel: string;
  title: string;
  description: string;
  readingMinutes: number;
  children: ReactNode;
};

export function SoftwareTestingLesson({
  sectionLabel,
  title,
  description,
  readingMinutes,
  children,
}: Props) {
  const updated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="w-full border-0 bg-white px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <header className="border-b border-neutral-300 pb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">{sectionLabel}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#050040] md:text-4xl">{title}</h1>
        <p className="mt-3 max-w-4xl text-base font-medium leading-relaxed text-neutral-600 md:text-lg">
          {description}
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Reading time ~{readingMinutes} minutes · Last updated {updated}
        </p>
      </header>

      <div className="mx-auto max-w-none space-y-8 pt-10 text-[15px] leading-relaxed text-neutral-800 md:text-[16px] md:leading-[1.75]">
        {children}
      </div>

      <footer className="mt-14 border-t border-neutral-300 pt-8">
        <Link
          href="/guides/software-testing"
          className="text-sm font-semibold text-[#050040] underline decoration-neutral-300 underline-offset-2 hover:decoration-[#050040]"
        >
          Back to guide index
        </Link>
        <span className="text-sm text-neutral-500"> · opens the software testing sidebar index</span>
      </footer>
    </article>
  );
}
