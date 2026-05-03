import Link from "next/link";

export function IntroductionToSoftwareTestingLesson() {
  return (
    <article className="w-full border-0 bg-white px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <header className="border-b border-neutral-300 pb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">Basics</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#050040] md:text-4xl">
          Introduction to Software Testing
        </h1>
        <p className="mt-3 max-w-4xl text-base font-medium leading-relaxed text-neutral-600 md:text-lg">
          Independent educational notes from GhostAPI. This page explains why testing exists, what it tries to prevent, and
          how teams usually organise work—without replacing your organisation’s standards or certified coursework.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          Reading time ~12 minutes · Last updated{" "}
          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </header>

      <div className="mx-auto max-w-none space-y-8 pt-10 text-[15px] leading-relaxed text-neutral-800 md:text-[16px] md:leading-[1.75]">
        <section id="purpose">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">What software testing is meant to do</h2>
          <p className="mt-4">
            Software testing is structured experimentation on a product before or after release. Teams execute planned
            checks—manual or automated—to surface mismatches between expected behaviour and observed behaviour. The aim is not
            “proving absence of bugs,” which is impossible for non-trivial systems, but to reduce uncertainty enough that
            stakeholders can ship, operate, or certify software with acceptable risk.
          </p>
          <p className="mt-4">
            Good testing shifts failures left: problems cost less when caught before production. That economic fact, more
            than any single technique, explains why testing budgets persist even when schedules slip.
          </p>
        </section>

        <section id="fault-chain">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Errors, defects, and failures</h2>
          <p className="mt-4">
            Practitioners distinguish causes from symptoms. A person may introduce an <strong>error</strong> while designing or
            coding. If that mistake survives review, it becomes a <strong>defect</strong> (fault) in the artifact—wrong logic,
            missing validation, incorrect configuration. When execution reaches that defect under specific conditions, users
            see a <strong>failure</strong>: an outage, wrong balance, corrupted export, or degraded latency.
          </p>
          <p className="mt-4">
            Tests hunt defects before failures harm customers. Some defects never fail in production because live data never
            triggers them; others lie dormant until traffic mixes change. That is why coverage discussions focus on risk and
            usage patterns, not only line counts.
          </p>
        </section>

        <section id="objectives">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Typical objectives teams publish</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
            <li>
              <strong className="text-neutral-900">Confidence:</strong> evidence that critical journeys behave within agreed
              bounds under representative data.
            </li>
            <li>
              <strong className="text-neutral-900">Regression control:</strong> ensure new changes do not break old behaviour
              unintentionally.
            </li>
            <li>
              <strong className="text-neutral-900">Compliance:</strong> satisfy contractual, regulatory, or internal audit
              expectations with traceable records.
            </li>
            <li>
              <strong className="text-neutral-900">Design feedback:</strong> ambiguous specifications surface early when
              testers attempt concrete scenarios.
            </li>
          </ul>
        </section>

        <section id="verification-validation">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Verification vs validation (plain language)</h2>
          <p className="mt-4">
            <strong className="text-neutral-900">Verification</strong> asks whether the product was built correctly against
            its specification—syntax of APIs, field constraints, wireframes.{" "}
            <strong className="text-neutral-900">Validation</strong> asks whether the right product was built for user and
            business goals—even perfect code can validate poorly if requirements missed the market.
          </p>
          <p className="mt-4">
            Both angles matter: exhaustive verification cannot substitute conversations with real users, while user delight
            cannot excuse unstable foundations.
          </p>
        </section>

        <section id="psychology">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Tester mindset and independence</h2>
          <p className="mt-4">
            Effective testers combine scepticism with curiosity. They question implicit assumptions (“nobody would enter
            Unicode here”) and document reproducible steps so developers spend minutes—not days—on triage. Independence reduces
            confirmation bias: builders naturally optimise for happy paths they already understand.
          </p>
          <p className="mt-4">
            Modern Agile teams often blend roles—developers write automated checks, testers coach exploratory sessions, product
            owners define acceptance scenarios. Independence becomes a spectrum enforced through culture and review, not only
            reporting lines.
          </p>
        </section>

        <section id="testing-vs-qc">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Testing, quality assurance, and quality control</h2>
          <p className="mt-4">
            Colloquially people say “QA” when they mean testers. Strictly,{" "}
            <strong className="text-neutral-900">quality assurance</strong> spans prevention—process design, training,
            architecture reviews—while <strong className="text-neutral-900">quality control</strong> measures outputs against
            standards. Testing belongs primarily to control activities but informs assurance when defects reveal systemic gaps
            (missing code review gates, unclear acceptance criteria).
          </p>
        </section>

        <section id="when-to-start">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">When testing starts (and why earlier helps)</h2>
          <p className="mt-4">
            Reviewing requirements for testability, drafting scenarios during design, and pairing on unit checks while coding
            each compress feedback loops. Waiting until a “testing phase” after feature freeze creates queues, encourages
            rushed sign-offs, and hides integration surprises.
          </p>
          <p className="mt-4">
            Continuous integration pipelines exemplify early automation: every merge runs a battery of fast checks so the
            trunk stays releasable—or failures signal immediately who broke what.
          </p>
        </section>

        <section id="oracle">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Oracles: how you decide pass vs fail</h2>
          <p className="mt-4">
            An <strong className="text-neutral-900">oracle</strong> is any source of expected outcome—requirements text,
            golden files, regulatory clauses, statistical bounds, or another trusted implementation. Automated suites encode
            oracles as assertions; exploratory testers carry mental oracles from domain expertise. Weak oracles produce false
            confidence (“green build” while user journeys remain broken).
          </p>
        </section>

        <section id="limits">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Limits you should acknowledge upfront</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
            <li>Exhaustive enumeration of inputs is rarely feasible; sampling and risk prioritisation are mandatory.</li>
            <li>
              Tests inherit specification flaws—garbage requirements yield misleading pass signals unless validation catches
              them.
            </li>
            <li>
              Environmental drift (clock skew, flaky networks, shared state) can cause intermittent failures needing isolation
              fixes.
            </li>
          </ul>
        </section>

        <section id="ghostapi-tools">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Where GhostAPI intersects this lesson</h2>
          <p className="mt-4">
            HTTP-heavy systems rely on stable contracts between clients and services. GhostAPI provides utilities—mock
            endpoints, API catalog exploration, request helpers, and performance-oriented runners—to rehearse scenarios before
            production integrations settle. Those tools complement disciplined testing; they do not replace test strategy or
            governance you define internally.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm font-semibold">
            <Link
              className="text-[#050040] underline decoration-neutral-300 underline-offset-2 hover:decoration-[#050040]"
              href="/tools/api-testing"
            >
              API testing hub
            </Link>
          </p>
        </section>

        <section id="next-topics" className="border-t border-neutral-300 pt-8">
          <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Continue the Basics track</h2>
          <p className="mt-4 text-neutral-700">
            Use the sidebar for the full curriculum—every topic opens its own URL with the same layout, suited to deep,
            ad-supported publishing.
          </p>
          <p className="mt-4">
            <Link
              href="/guides/software-testing"
              className="font-semibold text-[#050040] underline decoration-neutral-300 underline-offset-2 hover:decoration-[#050040]"
            >
              Back to guide index
            </Link>{" "}
            <span className="text-neutral-500">(redirects to this introduction)</span>
          </p>
        </section>
      </div>
    </article>
  );
}
