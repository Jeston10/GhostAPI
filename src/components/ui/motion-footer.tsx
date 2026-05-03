"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { Boxes, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const STYLES = `
.cinematic-footer-wrapper {
  -webkit-font-smoothing: antialiased;

  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);

  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--primary) 12%, transparent) 0%,
    color-mix(in oklch, var(--ring) 18%, transparent) 42%,
    transparent 72%
  );
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 12%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

@media (max-width: 1023px) {
  .footer-giant-bg-text {
    font-size: min(42vw, 12rem);
    opacity: 0.35;
    -webkit-text-stroke-width: 0.5px;
  }
}

.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 42%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 12%, transparent));
}
`;

export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const element = localRef.current;
      if (!element) return;

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect();
          const h = rect.width / 2;
          const w = rect.height / 2;
          const x = e.clientX - rect.left - h;
          const y = e.clientY - rect.top - w;

          gsap.to(element, {
            x: x * 0.4,
            y: y * 0.4,
            rotationX: -y * 0.15,
            rotationY: x * 0.15,
            scale: 1.05,
            ease: "power2.out",
            duration: 0.4,
          });
        };

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2,
          });
        };

        element.addEventListener("mousemove", handleMouseMove);
        element.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          element.removeEventListener("mousemove", handleMouseMove);
          element.removeEventListener("mouseleave", handleMouseLeave);
        };
      }, element);

      return () => ctx.revert();
    }, []);

    return (
      <Component
        ref={(node: HTMLElement | null) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
MagneticButton.displayName = "MagneticButton";

const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Schema-first mocks</span> <span className="text-primary/60">✦</span>
    <span>API Hub catalog</span> <span className="text-secondary-foreground/50">✦</span>
    <span>Live playground</span> <span className="text-primary/60">✦</span>
    <span>TypeForge & Zod</span> <span className="text-secondary-foreground/50">✦</span>
    <span>Curlify snippets</span> <span className="text-primary/60">✦</span>
    <span>API testing suite</span> <span className="text-secondary-foreground/50">✦</span>
    <span>Speed & load checks</span> <span className="text-primary/60">✦</span>
  </div>
);

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const year = new Date().getFullYear();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      <div
        ref={wrapperRef}
        className="relative min-h-[100dvh] w-full lg:h-screen"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="cinematic-footer-wrapper relative flex min-h-[100dvh] w-full flex-col bg-background text-foreground lg:fixed lg:bottom-0 lg:h-[100dvh] lg:max-h-[100dvh] lg:justify-between lg:overflow-hidden">
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

          <div
            ref={giantTextRef}
            className="footer-giant-bg-text pointer-events-none absolute -bottom-[2vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap lg:-bottom-[5vh]"
            aria-hidden
          >
            GHOST
          </div>

          <div className="absolute left-0 top-8 z-10 w-full -rotate-1 overflow-hidden border-y border-border/50 bg-background/70 py-3 shadow-lg backdrop-blur-md sm:top-10 sm:py-4 lg:top-12 lg:-rotate-2 lg:scale-[1.06] lg:bg-background/60 lg:shadow-2xl">
            <div className="flex w-max animate-footer-scroll-marquee text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground md:text-sm">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-10 pt-[4.75rem] sm:px-6 sm:pb-12 sm:pt-[5.5rem] lg:mt-20 lg:min-h-0 lg:flex-1 lg:justify-center lg:overflow-visible lg:px-6 lg:pb-6 lg:pt-8">
            <h2
              ref={headingRef}
              className="footer-text-glow mb-6 max-w-[min(100%,20ch)] text-center text-[clamp(1.75rem,8vw,3.5rem)] font-black leading-[1.08] tracking-tighter sm:max-w-[min(100%,24ch)] md:mb-10 md:text-7xl lg:mb-12 lg:max-w-none lg:text-8xl"
            >
              Build on mocks. Ship with confidence.
            </h2>

            <div ref={linksRef} className="flex w-full max-w-2xl flex-col items-stretch gap-5 lg:max-w-none lg:items-center lg:gap-6">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
                <MagneticButton
                  as={Link}
                  href="/#playground"
                  className="footer-glass-pill group flex w-full shrink-0 items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-bold text-foreground sm:w-auto sm:px-10 sm:py-5 md:text-base"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground transition-colors group-hover:text-foreground">
                    <Code2 className="h-5 w-5" aria-hidden />
                  </span>
                  Open playground
                </MagneticButton>

                <MagneticButton
                  as={Link}
                  href="/api-hub"
                  className="footer-glass-pill group flex w-full shrink-0 items-center justify-center gap-3 rounded-full px-6 py-4 text-sm font-bold text-foreground sm:w-auto sm:px-10 sm:py-5 md:text-base"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground transition-colors group-hover:text-foreground">
                    <Boxes className="h-5 w-5" aria-hidden />
                  </span>
                  Browse API Hub
                </MagneticButton>
              </div>

              <MagneticButton
                as={Link}
                href="/tools"
                className="footer-glass-pill rounded-full px-5 py-3.5 text-center text-xs font-bold leading-snug text-foreground sm:px-10 sm:py-4 sm:text-sm md:text-base lg:px-12"
              >
                Developer tools → TypeForge · Curlify · Testing
              </MagneticButton>

              <div className="flex w-full flex-wrap justify-center gap-2 sm:gap-3 md:gap-5">
                <MagneticButton
                  as={Link}
                  href="/tools/api-testing"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  API testing
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/typeforge"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  TypeForge
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/curlify"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Curlify
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/tools/speed-test"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Speed test
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/tools/load-test"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Load test
                </MagneticButton>
              </div>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-6">
                <MagneticButton
                  as={Link}
                  href="/guides/software-testing"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Software testing guides
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/privacy-policy"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Privacy Policy
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/terms-and-conditions"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Terms &amp; Conditions
                </MagneticButton>
                <MagneticButton
                  as={Link}
                  href="/contact"
                  className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                >
                  Contact
                </MagneticButton>
              </div>
            </div>
          </div>

          <div className="relative z-20 mt-auto flex w-full shrink-0 flex-col items-center justify-between gap-4 border-t border-border/30 bg-background/95 px-4 py-5 backdrop-blur-md sm:gap-5 sm:px-6 md:flex-row md:gap-6 md:px-12 md:pb-8 lg:border-transparent lg:bg-transparent lg:backdrop-blur-none">
            <div className="order-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:order-1 md:text-xs">
              © {year} API Ghost. All rights reserved.
            </div>

            <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full border-border/50 px-6 py-3 md:order-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">
                Crafted with
              </span>
              <span className="animate-footer-heartbeat text-sm text-destructive md:text-base">❤</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">
                for developers
              </span>
            </div>

            <MagneticButton
              type="button"
              as="button"
              onClick={scrollToTop}
              className="footer-glass-pill group order-3 flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Back to top"
            >
              <svg
                className="h-5 w-5 transform transition-transform duration-300 group-hover:-translate-y-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
