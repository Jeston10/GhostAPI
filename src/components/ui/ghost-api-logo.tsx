import Image from "next/image";

import { cn } from "@/lib/utils";

const LOGO_PATH = "/GhostAPI%20Test.png";

export type GhostApiLogoProps = {
  className?: string;
  /** Tailwind height class; width follows aspect ratio. */
  heightClass?: string;
  priority?: boolean;
};

export function GhostApiLogo({
  className,
  heightClass = "h-8",
  priority = false,
}: GhostApiLogoProps) {
  return (
    <Image
      src={LOGO_PATH}
      alt="GhostAPI"
      width={220}
      height={64}
      priority={priority}
      className={cn("w-auto object-contain object-left", heightClass, className)}
    />
  );
}
