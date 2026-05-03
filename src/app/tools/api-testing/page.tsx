import { CinematicFooter } from "@/components/ui/motion-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { ArrowRight, Flame, Zap } from "lucide-react";
import Link from "next/link";

export default function ApiTestingPage() {
  return (
    <div className="min-h-screen max-w-[100vw] overflow-x-hidden bg-slate-50 font-sans text-[#050040]">
      <section className="bg-white text-sm">
        <SiteNav currentPage="api-testing" variant="compact" />
      </section>

      <main className="min-w-0 w-full max-w-full overflow-x-hidden px-4 pb-16 pt-6 sm:px-5 sm:pt-8 md:px-16 md:pt-10 lg:px-24 xl:px-32">
        <section className="min-w-0 bg-slate-50 py-5 md:py-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-500">
            API Testing
          </p>
          <h1 className="mt-2 w-full min-w-0 text-[1.55rem] font-extrabold leading-snug tracking-tight text-[#050040] [overflow-wrap:anywhere] sm:text-3xl md:text-[2.125rem] md:leading-tight lg:text-[2.25rem]">
            Explore <span className="text-yellow-500">GhostAPI testing modes</span> for load, stress,
            spike, and endurance validation
          </h1>
          <p className="mt-4 w-full min-w-0 text-[14px] leading-relaxed text-slate-600 [overflow-wrap:anywhere] sm:mt-5 sm:text-[15px] md:text-base">
            Configure virtual users, intensity, and duration in a beginner-first workflow. Monitor live
            throughput, latency, and error rates without touching a terminal.
          </p>
        </section>

        <section className="mt-6 min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:mt-8 md:mt-9">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4 md:px-8 lg:px-10">
            <div className="min-w-0 w-full flex-1 md:max-w-none md:pr-6">
              <div className="inline-flex max-w-full flex-wrap items-center gap-2 border border-slate-200 bg-gradient-to-r from-white to-blue-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:px-4">
                API Testing Suite
              </div>
              <h2 className="mt-3 break-words text-2xl font-bold tracking-tight text-[#050040] lg:text-[1.75rem]">
                Choose your testing strategy
              </h2>
              <p className="mt-2 w-full break-words text-sm font-medium leading-relaxed text-slate-600 md:text-[15px]">
                Load testing for sustained traffic; server-side speed tools for quick checks and detailed sessions.
                Stress, spike, and endurance presets are planned next.
              </p>
            </div>
            <div className="flex w-full min-w-0 shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
              <span className="border border-slate-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                LIVE
              </span>
              <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                2 modes available
              </span>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-x-0 gap-y-0 md:grid-cols-2 md:gap-y-8">
            <div className="grid min-w-0 grid-cols-1 gap-0 border-b border-slate-200 md:grid-cols-[1.35fr_0.95fr] md:border-r md:border-slate-200 lg:grid-cols-[1.4fr_1fr] md:[&:nth-child(even)]:border-r-0">
              <div className="min-w-0 border-b border-slate-200 px-4 py-5 md:border-b-0 md:border-r md:px-10 lg:px-12">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-blue-50 text-blue-700">
                    <Flame className="h-5 w-5 shrink-0" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      Live mode
                    </div>
                    <h3 className="break-words text-xl font-bold text-[#050040]">Load Testing</h3>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Virtual users + parallel requests
                  </p>
                  <p className="mt-2 break-words text-sm font-medium leading-snug text-slate-700">
                    Simulate real users hitting your API with controllable intensity and concurrency.
                    Reach 100–300+ RPS with clear guardrails.
                  </p>
                </div>

                <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2 break-words leading-snug">URL, method, headers, body</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2 break-words leading-snug">Live metrics + JSON report</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2 break-words leading-snug">100–300+ RPS ready</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2 break-words leading-snug">QA + backend teams</p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 px-4 py-5 md:px-10 lg:px-12">
                <h4 className="text-sm font-semibold text-slate-700">Highlights</h4>
                <ul className="mt-3 space-y-2 break-words text-sm text-slate-600">
                  <li>• Real concurrency via virtual users</li>
                  <li>• Parallel request intensity controls</li>
                  <li>• Live p95/p99 tracking</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/tools/load-test"
                    className="flex w-full min-w-0 items-center justify-center gap-2 break-words border border-[#050040] bg-[#050040] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#070052]"
                  >
                    Open Load Testing
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-600">
                      VUs + parallel intensity
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-600">
                      Live RPS + latency
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-600">
                      P95/P99 tracking
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-600">
                      JSON report export
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-0 border-b border-slate-200 md:grid-cols-[1.35fr_0.95fr] md:border-r md:border-slate-200 lg:grid-cols-[1.4fr_1fr] md:[&:nth-child(even)]:border-r-0">
              <div className="min-w-0 border-b border-slate-200 px-6 py-5 md:border-b-0 md:border-r md:px-10 lg:px-12">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-emerald-50 text-emerald-800">
                    <Zap className="h-5 w-5 shrink-0" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                      Live mode
                    </div>
                    <h3 className="break-words text-xl font-bold leading-snug text-emerald-950 [overflow-wrap:anywhere]">
                      API speed · quick & detailed
                    </h3>
                  </div>
                </div>

                <div className="mt-4 border border-emerald-100 bg-emerald-50/40 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/90">
                    Quick check or detailed session
                  </p>
                  <p className="mt-2 break-words text-sm font-medium leading-snug text-emerald-950/85">
                    One-shot timing or a bounded worker session with live percentiles, HTTP status groups,
                    transport split, and JSON export — measured from GhostAPI egress, not your browser.
                  </p>
                </div>

                <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 text-sm font-medium sm:grid-cols-2">
                  <div className="min-w-0 overflow-hidden border border-emerald-100 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/85">Inputs</p>
                    <p className="mt-2 break-words leading-snug text-slate-800">URL, method, concurrency, duration, timeout</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-emerald-100 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/85">Outputs</p>
                    <p className="mt-2 break-words leading-snug text-slate-800">p50–p99, TTFB vs download, JSON export</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-emerald-100 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/85">Engine</p>
                    <p className="mt-2 break-words leading-snug text-slate-800">Node fetch + in-memory metrics (no DB)</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-emerald-100 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800/85">Best for</p>
                    <p className="mt-2 break-words leading-snug text-slate-800">Latency checks from server egress</p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 px-4 py-5 md:px-10 lg:px-12">
                <h4 className="text-sm font-semibold text-emerald-900">Highlights</h4>
                <ul className="mt-3 space-y-2 break-words text-sm text-emerald-950/80">
                  <li>• Worker pool (bounded concurrency)</li>
                  <li>• TTFB vs download per response</li>
                  <li>• Five-second RPS / p95 buckets</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/tools/speed-test"
                    className="flex w-full min-w-0 items-center justify-center gap-2 break-words border border-emerald-700 bg-emerald-700 px-4 py-2 text-center text-sm font-semibold text-white transition hover:border-emerald-800 hover:bg-emerald-800"
                  >
                    Open speed tools
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </Link>
                  <div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-emerald-200/80 bg-emerald-50/70 px-2 py-2 text-center text-xs font-semibold leading-snug text-emerald-900">
                      Concurrency cap
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-emerald-200/80 bg-emerald-50/70 px-2 py-2 text-center text-xs font-semibold leading-snug text-emerald-900">
                      Server clock
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-emerald-200/80 bg-emerald-50/70 px-2 py-2 text-center text-xs font-semibold leading-snug text-emerald-900">
                      Ephemeral runs
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-emerald-200/80 bg-emerald-50/70 px-2 py-2 text-center text-xs font-semibold leading-snug text-emerald-900">
                      docs/systems
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-0 border-b border-slate-200 md:grid-cols-[1.35fr_0.95fr] md:border-r md:border-slate-200 lg:grid-cols-[1.4fr_1fr] md:[&:nth-child(even)]:border-r-0">
              <div className="min-w-0 border-b border-slate-200 px-6 py-5 md:border-b-0 md:border-r md:px-10 lg:px-12">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-100 text-slate-500">
                    <Flame className="h-5 w-5 shrink-0" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Coming soon
                    </div>
                    <h3 className="break-words text-xl font-bold text-[#050040]">Stress Testing</h3>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Find breaking points
                  </p>
                  <p className="mt-2 break-words text-sm font-medium leading-snug text-slate-700">
                    Push beyond normal traffic to uncover limits and failure thresholds with guided
                    escalation steps.
                  </p>
                </div>

                <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2 break-words leading-snug">URL, ramp plan, max load</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2 break-words leading-snug">Breakpoint + failure curve</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2 break-words leading-snug">Ramp to peak quickly</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2 break-words leading-snug">SRE + platform teams</p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 px-4 py-5 md:px-10 lg:px-12">
                <h4 className="text-sm font-semibold text-slate-700">Highlights</h4>
                <ul className="mt-3 space-y-2 break-words text-sm text-slate-600">
                  <li>• Step-wise traffic ramping</li>
                  <li>• Breakpoint discovery</li>
                  <li>• Failure curve summary</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center gap-2 break-words border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm font-semibold leading-snug text-slate-500">
                    Coming soon
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Ramp profiles
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Failure threshold
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Error breakdown
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Summary export
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-0 border-b border-slate-200 md:grid-cols-[1.35fr_0.95fr] md:border-r md:border-slate-200 lg:grid-cols-[1.4fr_1fr] md:[&:nth-child(even)]:border-r-0">
              <div className="min-w-0 border-b border-slate-200 px-6 py-5 md:border-b-0 md:border-r md:px-10 lg:px-12">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-100 text-slate-500">
                    <Flame className="h-5 w-5 shrink-0" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Coming soon
                    </div>
                    <h3 className="break-words text-xl font-bold text-[#050040]">Spike Testing</h3>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Sudden traffic bursts
                  </p>
                  <p className="mt-2 break-words text-sm font-medium leading-snug text-slate-700">
                    Validate behavior during sudden, extreme load bursts and ensure recovery is smooth
                    after the spike.
                  </p>
                </div>

                <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2 break-words leading-snug">Spike size + duration</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2 break-words leading-snug">Stability + recovery</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2 break-words leading-snug">Immediate load burst</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2 break-words leading-snug">Launch events</p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 px-4 py-5 md:px-10 lg:px-12">
                <h4 className="text-sm font-semibold text-slate-700">Highlights</h4>
                <ul className="mt-3 space-y-2 break-words text-sm text-slate-600">
                  <li>• Instant traffic spike</li>
                  <li>• Recovery monitoring</li>
                  <li>• Stability summary</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center gap-2 break-words border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm font-semibold leading-snug text-slate-500">
                    Coming soon
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Burst profiles
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Recovery SLA
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Error surge
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Summary export
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-0 border-b border-slate-200 md:col-span-2 md:grid-cols-[1.35fr_0.95fr] lg:grid-cols-[1.4fr_1fr] last:border-b-0">
              <div className="min-w-0 border-b border-slate-200 px-6 py-5 md:border-b-0 md:border-r md:px-10 lg:px-12">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-slate-100 text-slate-500">
                    <Flame className="h-5 w-5 shrink-0" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Coming soon
                    </div>
                    <h3 className="break-words text-xl font-bold text-[#050040]">Endurance Testing</h3>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Long-running reliability
                  </p>
                  <p className="mt-2 break-words text-sm font-medium leading-snug text-slate-700">
                    Run steady load over long durations to catch memory leaks, slowdowns, and throughput
                    decay.
                  </p>
                </div>

                <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 text-sm font-medium text-slate-700 sm:grid-cols-2">
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2 break-words leading-snug">Duration + steady load</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2 break-words leading-snug">Throughput stability</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2 break-words leading-snug">Sustained load</p>
                  </div>
                  <div className="min-w-0 overflow-hidden border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2 break-words leading-snug">Reliability checks</p>
                  </div>
                </div>
              </div>

              <div className="min-w-0 px-4 py-5 md:px-10 lg:px-12">
                <h4 className="text-sm font-semibold text-slate-700">Highlights</h4>
                <ul className="mt-3 space-y-2 break-words text-sm text-slate-600">
                  <li>• Long-duration soak runs</li>
                  <li>• Slow degradation alerts</li>
                  <li>• Stability report</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center gap-2 break-words border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm font-semibold leading-snug text-slate-500">
                    Coming soon
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Soak presets
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Drift detection
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Memory watch
                    </div>
                    <div className="flex min-h-[2.75rem] w-full min-w-0 items-center justify-center border border-slate-200 bg-slate-50 px-2 py-2 text-center text-xs font-semibold leading-snug text-slate-500">
                      Summary export
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CinematicFooter />
    </div>
  );
}
