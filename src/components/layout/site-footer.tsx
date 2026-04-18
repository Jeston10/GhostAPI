import { GhostApiLogo } from "@/components/ui/ghost-api-logo";
import Link from "next/link";

const linkClass =
  "text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm";

function FooterHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      {children}
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:px-10 md:py-12 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-0">
          <div className="flex min-w-0 w-full flex-col items-start text-left lg:col-span-5">
            <Link
              href="/"
              className="inline-block shrink-0 rounded-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              aria-label="GhostAPI home"
            >
              <GhostApiLogo heightClass="h-8 md:h-9" />
            </Link>
            <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-slate-300 lg:max-w-sm">
              <span className="block">Instant mock APIs from schema.</span>
              <span className="mt-1 block">
                Bridge frontend and backend workflows without waiting on the server.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-left sm:grid-cols-3 lg:col-span-7 lg:pl-4">
            <nav className="min-w-0" aria-labelledby="footer-product-heading">
              <FooterHeading id="footer-product-heading">Product</FooterHeading>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link href="/#about" className={linkClass}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/#playground" className={linkClass}>
                    Playground
                  </Link>
                </li>
                <li>
                  <Link href="/#flow" className={linkClass}>
                    Flow
                  </Link>
                </li>
                <li>
                  <Link href="/api-hub" className={linkClass}>
                    API Hub
                  </Link>
                </li>
              </ul>
            </nav>

            <nav className="min-w-0" aria-labelledby="footer-tools-heading">
              <FooterHeading id="footer-tools-heading">Tools</FooterHeading>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link href="/tools" className={linkClass}>
                    Tools
                  </Link>
                </li>
                <li>
                  <Link href="/tools/api-testing" className={linkClass}>
                    API Testing
                  </Link>
                </li>
              </ul>
            </nav>

            <nav
              className="col-span-2 min-w-0 sm:col-span-1"
              aria-labelledby="footer-legal-heading"
            >
              <FooterHeading id="footer-legal-heading">Legal</FooterHeading>
              <ul className="mt-3 space-y-2.5">
                <li>
                  <Link href="/privacy-policy" className={linkClass}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className={linkClass}>
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 border-t border-white/10 pt-8 text-xs text-slate-400">
          <p className="w-full text-center">
            © {new Date().getFullYear()} API Ghost. Lightweight SaaS for developer productivity.
          </p>
        </div>
      </div>
    </footer>
  );
}
