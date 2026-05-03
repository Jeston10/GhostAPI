import { SoftwareTestingGuideSidebar } from "@/components/guides/software-testing-sidebar";
import { SiteNav } from "@/components/layout/site-nav";
import { CinematicFooter } from "@/components/ui/motion-footer";

export default function SoftwareTestingGuidesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-300 bg-white">
        <SiteNav currentPage="guides" variant="compact" />
      </header>

      {/* Desktop: sidebar is absolute inside the article strip so its scroll area matches article height, not the gap above the footer. */}
      <div className="flex min-h-0 w-full max-w-[100vw] flex-1 flex-col justify-between overflow-x-hidden">
        <div className="relative w-full md:pl-[272px]">
          <SoftwareTestingGuideSidebar />
          <div className="border-neutral-300 md:border-l md:border-neutral-300">{children}</div>
        </div>
        <CinematicFooter />
      </div>
    </div>
  );
}
