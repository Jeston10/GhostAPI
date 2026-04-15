import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";
import { ArrowRight, Activity, Flame, Gauge } from "lucide-react";
import Link from "next/link";

const TEST_NAV = [
  { name: "Load Testing", href: "/tools/load-test", status: "active" },
  { name: "Stress Testing", href: "#", status: "coming" },
  { name: "Spike Testing", href: "#", status: "coming" },
  { name: "Endurance Testing", href: "#", status: "coming" },
] as const;

export default function ApiTestingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#050040]">
      <section className="bg-white text-sm">
        <SiteNav currentPage="api-testing" variant="hero" />
      </section>

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 md:pt-10">
        <section className=" bg-slate-50 px-5 py-6  md:px-8">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-500">
            API Testing
          </p>
          <h1 className="mt-2 max-w-5xl text-3xl font-extrabold tracking-tight text-[#050040] md:text-[2.125rem] md:leading-tight">
            Explore <span className="text-yellow-500">GhostAPI testing modes</span> for load, stress,
            spike, and endurance validation
          </h1>
          <p className="mt-5 max-w-5xl text-[15px] leading-relaxed text-slate-600 md:text-base">
            Configure virtual users, intensity, and duration in a beginner-first workflow. Monitor live
            throughput, latency, and error rates without touching a terminal.
          </p>
        </section>

        <section className="mt-10 border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 md:px-8">
            <div>
              <div className="inline-flex items-center gap-2 border border-blue-200 bg-gradient-to-r from-white to-blue-100 px-3 py-1 text-xs font-semibold text-slate-600">
                API Testing Suite
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#050040]">
                Choose your testing strategy
              </h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
                Start with Load Testing to simulate real traffic. Stress, Spike, and Endurance tests are
                coming soon with guided presets.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                LIVE
              </span>
              <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                1 mode available
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-slate-200 px-5 py-5 md:border-b-0 md:border-r md:px-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-blue-50 text-blue-700">
                    <Flame className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      Live mode
                    </div>
                    <h3 className="text-xl font-bold text-[#050040]">Load Testing</h3>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Virtual users + parallel requests
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Simulate real users hitting your API with controllable intensity and concurrency.
                    Reach 100–300+ RPS with clear guardrails.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 text-sm font-medium text-slate-700 md:grid-cols-2">
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2">URL, method, headers, body</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2">Live metrics + JSON report</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2">100–300+ RPS ready</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2">QA + backend teams</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 md:px-8">
                <h4 className="text-sm font-semibold text-slate-700">Highlights</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Real concurrency via virtual users</li>
                  <li>• Parallel request intensity controls</li>
                  <li>• Live p95/p99 tracking</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/tools/load-test"
                    className="inline-flex items-center justify-center gap-2 border border-[#050040] bg-[#050040] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#070052]"
                  >
                    Open Load Testing
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                      VUs + parallel intensity
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                      Live RPS + latency
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                      P95/P99 tracking
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                      JSON report export
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-slate-200 px-5 py-5 md:border-b-0 md:border-r md:px-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-slate-100 text-slate-500">
                    <Flame className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Coming soon
                    </div>
                    <h3 className="text-xl font-bold text-[#050040]">Stress Testing</h3>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Find breaking points
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Push beyond normal traffic to uncover limits and failure thresholds with guided
                    escalation steps.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 text-sm font-medium text-slate-700 md:grid-cols-2">
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2">URL, ramp plan, max load</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2">Breakpoint + failure curve</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2">Ramp to peak quickly</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2">SRE + platform teams</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 md:px-8">
                <h4 className="text-sm font-semibold text-slate-700">Highlights</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Step-wise traffic ramping</li>
                  <li>• Breakpoint discovery</li>
                  <li>• Failure curve summary</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <div className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
                    Coming soon
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Ramp profiles
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Failure threshold
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Error breakdown
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Summary export
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-slate-200 px-5 py-5 md:border-b-0 md:border-r md:px-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-slate-100 text-slate-500">
                    <Flame className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Coming soon
                    </div>
                    <h3 className="text-xl font-bold text-[#050040]">Spike Testing</h3>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Sudden traffic bursts
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Validate behavior during sudden, extreme load bursts and ensure recovery is smooth
                    after the spike.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 text-sm font-medium text-slate-700 md:grid-cols-2">
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2">Spike size + duration</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2">Stability + recovery</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2">Immediate load burst</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2">Launch events</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 md:px-8">
                <h4 className="text-sm font-semibold text-slate-700">Highlights</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Instant traffic spike</li>
                  <li>• Recovery monitoring</li>
                  <li>• Stability summary</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <div className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
                    Coming soon
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Burst profiles
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Recovery SLA
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Error surge
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Summary export
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b border-slate-200 px-5 py-5 md:border-b-0 md:border-r md:px-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center bg-slate-100 text-slate-500">
                    <Flame className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Coming soon
                    </div>
                    <h3 className="text-xl font-bold text-[#050040]">Endurance Testing</h3>
                  </div>
                </div>

                <div className="mt-4 border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Long-running reliability
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Run steady load over long durations to catch memory leaks, slowdowns, and throughput
                    decay.
                  </p>
                </div>

                <div className="mt-4 grid gap-3 text-sm font-medium text-slate-700 md:grid-cols-2">
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Inputs
                    </p>
                    <p className="mt-2">Duration + steady load</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Outputs
                    </p>
                    <p className="mt-2">Throughput stability</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Speed
                    </p>
                    <p className="mt-2">Sustained load</p>
                  </div>
                  <div className="border border-slate-200 bg-white px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Best for
                    </p>
                    <p className="mt-2">Reliability checks</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-5 md:px-8">
                <h4 className="text-sm font-semibold text-slate-700">Highlights</h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>• Long-duration soak runs</li>
                  <li>• Slow degradation alerts</li>
                  <li>• Stability report</li>
                </ul>
                <div className="mt-6 flex flex-col gap-2">
                  <div className="inline-flex items-center justify-center gap-2 border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
                    Coming soon
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Soak presets
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Drift detection
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Memory watch
                    </div>
                    <div className="inline-flex items-center justify-center border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                      Summary export
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
