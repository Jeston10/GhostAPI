import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#050040]">
      <section className="bg-white text-sm">
        <SiteNav currentPage="tools" variant="hero" />
      </section>

      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-5 sm:pb-14 sm:pt-9 md:px-16 md:pb-16 md:pt-10 lg:px-24 xl:px-32">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-5 md:px-6">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-blue-500">
              Privacy Policy
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#050040] md:text-3xl">
              GhostAPI Privacy Policy
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-6 px-4 py-5 text-sm text-slate-700 sm:px-5 md:px-6">
            <section>
              <h2 className="text-sm font-bold text-[#050040]">Overview</h2>
              <p className="mt-2 leading-relaxed">
                GhostAPI provides developer tools such as TypeForge and Curlify. This policy explains what
                data we collect, how we use it, and how you can control your information. We aim to keep
                data collection minimal and transparent to support performance, security, and product
                improvements.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Information we collect</h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>
                  <span className="font-semibold">Usage analytics:</span> We use Google Analytics to
                  understand traffic, page views, and feature usage. Analytics data is aggregated and does
                  not include sensitive request payloads.
                </li>
                <li>
                  <span className="font-semibold">Tool inputs:</span> When you use TypeForge or Curlify,
                  your inputs are processed in your browser. If you run API tests or use the proxy-based
                  features, the request details are sent to our servers to perform the action.
                </li>
                <li>
                  <span className="font-semibold">Server logs:</span> We log basic technical metadata
                  (IP address, user agent, timestamps, status codes) to keep the service reliable and
                  secure.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">How we use information</h2>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                <li>Provide and operate the GhostAPI tools and API hub.</li>
                <li>Improve performance, reliability, and usability.</li>
                <li>Prevent abuse, detect anomalies, and enforce rate limits.</li>
                <li>Measure adoption and guide product improvements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Third-party services</h2>
              <p className="mt-2 leading-relaxed">
                GhostAPI integrates with third-party public APIs when you test endpoints. Requests are
                sent to the target API you specify. We are not responsible for third-party privacy
                practices. Please review their policies before sending sensitive data.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Cookies and analytics</h2>
              <p className="mt-2 leading-relaxed">
                Google Analytics may set cookies to measure usage and improve the product. You can control
                cookies through your browser settings. If you are in the EEA, configure consent mode to
                meet local requirements.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Data retention</h2>
              <p className="mt-2 leading-relaxed">
                We retain analytics and server logs for a limited period necessary for security and
                product analysis. We do not sell personal data or use it for advertising.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Security</h2>
              <p className="mt-2 leading-relaxed">
                We apply technical and organizational measures to protect data. However, no method of
                transmission over the internet is 100% secure. Avoid sending secrets, tokens, or sensitive
                personal data in request payloads.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Your choices</h2>
              <p className="mt-2 leading-relaxed">
                You can opt out of analytics by using browser controls and blocking tracking scripts. You
                can also avoid submitting sensitive data to our tools.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-[#050040]">Contact</h2>
              <p className="mt-2 leading-relaxed">
                Questions about privacy can be sent to: support@ghostapi.io
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
