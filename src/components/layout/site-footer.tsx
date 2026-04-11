import { GhostApiLogo } from "@/components/ui/ghost-api-logo";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-4 py-10 text-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
        <div>
          <Link href="/" className="inline-block" aria-label="GhostAPI home">
            <GhostApiLogo heightClass="h-9 md:h-10" className="mx-auto md:mx-0" />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-slate-300 md:mt-4">
            Instant mock APIs from schema. Bridge frontend and backend workflows without waiting on the
            server.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-slate-300 md:justify-end">
          <Link href="/#about" className="transition hover:text-white">
            About
          </Link>
          <Link href="/tools" className="transition hover:text-white">
            Tools
          </Link>
          <Link href="/api-hub" className="transition hover:text-white">
            API Hub
          </Link>
          <Link href="/#playground" className="transition hover:text-white">
            Playground
          </Link>
          <Link href="/#flow" className="transition hover:text-white">
            Flow
          </Link>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-5xl border-t border-white/10 pt-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} API Ghost. Lightweight SaaS for developer productivity.
      </p>
    </footer>
  );
}
