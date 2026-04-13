import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#050040]">
      <section className="bg-white text-sm">
        <SiteNav currentPage="tools" variant="hero" />
      </section>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 md:pt-12">
        <div className="border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4 md:px-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-500">
              Terms and Conditions
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#050040] md:text-3xl">
              GhostAPI Terms and Conditions
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-6 px-4 py-5 text-sm text-slate-700 md:px-6">
            <section>
              <h2 className="text-sm font-bold text-[#050040]">Agreement to terms</h2>
              <p className="mt-2 leading-relaxed">
                By accessing or using GhostAPI, including the TypeForge and Curlify tools, you agree to
                these Terms and Conditions. If you do not agree, do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Service description</h2>
              <p className="mt-2 leading-relaxed">
                GhostAPI provides browser-based developer utilities for API testing, request generation,
                and mock API workflows. Features may change or be discontinued at any time.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Acceptable use</h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Do not use the service for unlawful activity or to violate any third-party rights.</li>
                <li>Do not attempt to bypass rate limits, security controls, or access restrictions.</li>
                <li>Do not submit sensitive personal data, secrets, or credentials in request payloads.</li>
                <li>Respect the terms of any third-party API you access through GhostAPI tools.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Third-party APIs and content</h2>
              <p className="mt-2 leading-relaxed">
                When you use GhostAPI to call external APIs, you are responsible for the requests you send
                and the data you receive. We do not control, endorse, or guarantee third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">No warranties</h2>
              <p className="mt-2 leading-relaxed">
                GhostAPI is provided “as is” without warranties of any kind. We do not guarantee that the
                service will be uninterrupted, error-free, or suitable for a specific purpose.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Limitation of liability</h2>
              <p className="mt-2 leading-relaxed">
                To the maximum extent permitted by law, GhostAPI is not liable for any indirect,
                incidental, special, or consequential damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Changes to these terms</h2>
              <p className="mt-2 leading-relaxed">
                We may update these Terms and Conditions from time to time. Continued use of GhostAPI
                after changes means you accept the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Contact</h2>
              <p className="mt-2 leading-relaxed">
                Questions about these terms can be sent to: support@ghostapi.io
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
