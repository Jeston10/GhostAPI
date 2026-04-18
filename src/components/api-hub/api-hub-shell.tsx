import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

type ApiHubShellProps = {
  children: React.ReactNode;
  /** Detail route: no shadow/bottom edge on the nav so it sits flush above content. */
  navVariant?: "catalog" | "detail";
};

/**
 * API Hub list + detail: same `SiteNav` as the homepage (links, logo sizes) but **no** hero grid image,
 * so there is no yellow gradient behind the navbar—clean white bar only.
 */
export function ApiHubShell({
  children,
  navVariant = "catalog",
}: ApiHubShellProps) {
  const navSectionClass =
    navVariant === "detail"
      ? "border-b border-slate-200/90 bg-white text-sm font-sans text-[#050040]"
      : "border-b border-slate-200/90 bg-white text-sm font-sans text-[#050040] shadow-sm";

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-[#050040]">
      <section className={navSectionClass}>
        <SiteNav currentPage="api-hub" variant="hero" />
      </section>
      <div className="relative z-10 px-0 pb-10 md:pb-6">{children}</div>
      <SiteFooter />
    </div>
  );
}
