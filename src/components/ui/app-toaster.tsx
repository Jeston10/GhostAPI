"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      offset={{
        bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
        right: "max(1rem, env(safe-area-inset-right, 0px))",
      }}
      mobileOffset={{
        bottom: "calc(5.5rem + env(safe-area-inset-bottom, 0px))",
        right: "max(0.75rem, env(safe-area-inset-right, 0px))",
      }}
      gap={10}
      visibleToasts={4}
      closeButton
      toastOptions={{
        duration: 4200,
        classNames: {
          toast:
            "group relative overflow-hidden rounded-md border !border-[#d8c6a5] !bg-[linear-gradient(160deg,#fffaf1_0%,#f8efdf_52%,#f2e5d0_100%)] px-4 py-3 pr-12 font-sans text-sm !text-[#2f2a22] shadow-[0_12px_30px_rgba(41,31,18,0.18)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,255,0.6)_0,rgba(255,255,255,0)_38%),radial-gradient(circle_at_80%_70%,rgba(214,175,120,0.16)_0,rgba(214,175,120,0)_45%),url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")] before:opacity-90",
          success:
            "!border-[#95c9ad] before:bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,255,0.7)_0,rgba(255,255,255,0)_38%),radial-gradient(circle_at_80%_70%,rgba(92,176,133,0.18)_0,rgba(92,176,133,0)_45%),url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")] [&_[data-icon]]:!text-emerald-700",
          error:
            "!border-[#de9ea3] before:bg-[radial-gradient(circle_at_12%_16%,rgba(255,255,255,0.7)_0,rgba(255,255,255,0)_38%),radial-gradient(circle_at_80%_70%,rgba(211,111,122,0.16)_0,rgba(211,111,122,0)_45%),url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")] [&_[data-icon]]:!text-rose-700",
          title: "relative z-[1] text-inherit font-semibold tracking-tight",
          description: "relative z-[1] mt-0.5 text-xs !text-[#5e5344]",
          closeButton:
            "absolute right-3 top-3 left-auto z-[2] inline-flex h-7 w-7 items-center justify-center rounded-full border !border-[#cdb38b] !bg-[#fff7e9] !text-[#5a4a33] shadow-sm transition hover:!bg-[#f3e1c2] hover:!text-[#3d3223] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b79763]/50",
          actionButton:
            "relative z-[1] rounded-md border border-[#ccb48f] bg-[#fff6e7] px-2.5 py-1 text-xs font-medium text-[#4f4230] transition hover:bg-[#f3e5cd]",
          cancelButton:
            "relative z-[1] rounded-md border border-[#d7c3a3] bg-transparent px-2.5 py-1 text-xs font-medium text-[#665943] transition hover:bg-[#f7ecd8]",
        },
      }}
    />
  );
}
