"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

import { cn } from "@/lib/utils";

/** Input range for tilt; center = no rotation and no hover glow. */
const TILT_MAX = 320;
const TILT_CENTER = TILT_MAX / 2;

export interface ProductHighlightCardProps {
  categoryIcon: React.ReactNode;
  category: string;
  /** Ignored when `titleSlot` is set. */
  title?: string;
  /** Renders instead of `title` (e.g. wordmark image). */
  titleSlot?: React.ReactNode;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  decoration?: React.ReactNode;
  className?: string;
}

export const ProductHighlightCard = React.forwardRef<
  HTMLDivElement,
  ProductHighlightCardProps
>(
  (
    {
      className,
      categoryIcon,
      category,
      title,
      titleSlot,
      description,
      imageSrc,
      imageAlt,
      decoration,
    },
    ref
  ) => {
    const mouseX = useMotionValue(TILT_CENTER);
    const mouseY = useMotionValue(TILT_CENTER);

    const handleMouseMove = ({
      clientX,
      clientY,
      currentTarget,
    }: React.MouseEvent) => {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    };

    const rotateX = useTransform(mouseY, [0, TILT_MAX], [5, -5]);
    const rotateY = useTransform(mouseX, [0, TILT_MAX], [-5, 5]);

    const springConfig = { stiffness: 280, damping: 24 };
    const springRotateX = useSpring(rotateX, springConfig);
    const springRotateY = useSpring(rotateY, springConfig);

    const glowX = useTransform(mouseX, [0, TILT_MAX], [0, 100]);
    const glowY = useTransform(mouseY, [0, TILT_MAX], [0, 100]);
    const glowOpacity = useTransform(mouseX, [0, TILT_MAX], [0, 0.3]);

    const glowBackground = useMotionTemplate`radial-gradient(100px at ${glowX}% ${glowY}%, rgb(5 0 64 / 0.1), transparent 50%)`;

    return (
      <div className="flex h-full min-h-0 w-full min-w-0 justify-center">
        <div className="flex h-full min-h-0 w-full max-w-[22rem] flex-col [perspective:900px] sm:max-w-[24rem]">
          <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              mouseX.set(TILT_CENTER);
              mouseY.set(TILT_CENTER);
            }}
            style={{
              rotateX: springRotateX,
              rotateY: springRotateY,
              transformStyle: "preserve-3d",
            }}
            className={cn(
              "relative isolate flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/95 bg-white shadow-md ring-1 ring-black/[0.04] transition-shadow duration-300 hover:shadow-lg",
              className
            )}
          >
            <div
              className="relative m-3 flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200/70 bg-slate-50/60 shadow-inner md:m-4"
              style={{ transform: "translateZ(12px)", transformStyle: "preserve-3d" }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(to_right,#0500400a_1px,transparent_1px),linear-gradient(to_bottom,#0500400a_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_55%_55%_at_50%_45%,#000_65%,transparent_100%)]"
                aria-hidden
              />

              <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{
                  opacity: glowOpacity,
                  background: glowBackground,
                }}
              />

              <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-start gap-3 p-5 pb-16 md:p-6 md:pb-20">
                <div className="flex items-center gap-2 text-[#050040]">
                  <span className="shrink-0 text-[#050040]">{categoryIcon}</span>
                  <span className="text-xs font-bold tracking-wide uppercase md:text-sm">
                    {category}
                  </span>
                </div>

                <div className="text-[#050040]">
                  {titleSlot != null ? (
                    titleSlot
                  ) : (
                    <h3 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                      {title}
                    </h3>
                  )}
                  <p className="mt-2 text-xs font-medium leading-relaxed text-slate-800 md:text-sm">
                    {description}
                  </p>
                </div>
              </div>

              {imageSrc ? (
                <motion.img
                  src={imageSrc}
                  alt={imageAlt ?? ""}
                  style={{ transform: "translateZ(40px)" }}
                  whileHover={{ scale: 1.06, y: -8, x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="pointer-events-none absolute -right-8 -bottom-8 h-44 w-44 object-contain md:h-52 md:w-52"
                />
              ) : decoration ? (
                <div
                  className="pointer-events-none absolute -right-4 -bottom-4 text-[#050040]/12"
                  style={{ transform: "translateZ(32px)" }}
                >
                  {decoration}
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
);

ProductHighlightCard.displayName = "ProductHighlightCard";
