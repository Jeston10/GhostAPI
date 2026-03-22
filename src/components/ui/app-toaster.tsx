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
            "font-sans text-sm shadow-lg border backdrop-blur-[2px]",
          success:
            "!bg-emerald-600 !text-white !border-emerald-700 [&_[data-icon]]:!text-white",
          error:
            "!bg-red-600 !text-white !border-red-700 [&_[data-icon]]:!text-white",
          title: "!text-inherit !font-semibold",
          description: "!text-inherit/90 !text-xs",
          closeButton:
            "!text-white/90 hover:!bg-white/15 !border-white/20",
        },
      }}
    />
  );
}
