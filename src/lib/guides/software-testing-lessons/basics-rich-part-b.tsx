import { SoftwareTestingLesson } from "@/components/guides/software-testing-lesson";

export function TypesOfSoftwareTestingRichLesson() {
  return (
    <SoftwareTestingLesson
      sectionLabel="Basics"
      title="Types of Software Testing"
      description="There are many names for testing approaches. This lesson sorts them into friendly buckets, adds memorable examples, then shows how practitioners combine types instead of picking only one."
      readingMinutes={14}
    >
      <section id="simple-sorting">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Start simple: sorting your toy box</h2>
        <p className="mt-4">
          Some toys need batteries (interactive features). Others must survive outdoor mud (durability). Sorting by job to be
          done mirrors testing: different question → different technique. Categories overlap—just like a remote-control car is both
          “motorised” and “outdoor-safe.”
        </p>
      </section>

      <section id="functional-vs-nonfunctional">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Functional vs non-functional</h2>
        <p className="mt-4">
          <strong className="text-neutral-900">Functional testing</strong> asks, “Does the feature do what users expect?”{" "}
          <em>Example:</em> transferring money updates balances and writes an audit row.
        </p>
        <p className="mt-4">
          <strong className="text-neutral-900">Non-functional testing</strong> asks, “How well does it behave under quality
          attributes?”—speed, reliability, usability, security resilience. <em>Example:</em> same transfer completes within 800 ms at
          peak load while masking PAN digits in logs.
        </p>
      </section>

      <section id="manual-vs-automation">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Manual vs automation</h2>
        <p className="mt-4">
          <strong className="text-neutral-900">Manual testing</strong> relies on humans steering scenarios—great for UX nuance,
          exploratory missions, and volatile prototypes.
        </p>
        <p className="mt-4">
          <strong className="text-neutral-900">Automation</strong> executes scripted checks via frameworks—ideal for regression,
          APIs with stable contracts, and data-heavy combinations humans cannot repeat flawlessly.
        </p>
        <p className="mt-4 rounded-none border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
          <strong className="text-neutral-900">Reality check:</strong> automation still demands human design, maintenance, and
          interpretation—robots do not invent intent.
        </p>
      </section>

      <section id="static-dynamic">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Static vs dynamic testing</h2>
        <p className="mt-4">
          <strong className="text-neutral-900">Static</strong> examines artefacts without running the program—reviews, walkthroughs,
          linters reading source. <em>Example:</em> architects spot a missing index before deployment stress tests fail.
        </p>
        <p className="mt-4">
          <strong className="text-neutral-900">Dynamic</strong> executes software with inputs and observes outputs/logs.{" "}
          <em>Example:</em> chaos experiments terminate pods to validate retry budgets.
        </p>
      </section>

      <section id="change-testing">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Testing related to change frequency</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>
            <strong className="text-neutral-900">Regression:</strong> ensures new commits did not break old behaviour—often a blended
            automated manual suite.
          </li>
          <li>
            <strong className="text-neutral-900">Confirmation / retesting:</strong> verifies a specific bug fix actually works.
          </li>
          <li>
            <strong className="text-neutral-900">Smoke / sanity:</strong> fast slices validating critical paths after builds or
            deployments (exact scopes vary by team jargon—Difference lessons unpack nuances later).
          </li>
        </ul>
      </section>

      <section id="example-matrix">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Worked example: mapping types for a checkout API</h2>
        <div className="mt-4 overflow-x-auto border border-neutral-200">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="border border-neutral-200 px-3 py-2 font-semibold text-neutral-900">Concern</th>
                <th className="border border-neutral-200 px-3 py-2 font-semibold text-neutral-900">Likely testing types</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="border border-neutral-200 px-3 py-2">Coupon stacking rules</td>
                <td className="border border-neutral-200 px-3 py-2">Functional / scenario-based / automated regression</td>
              </tr>
              <tr>
                <td className="border border-neutral-200 px-3 py-2">Latency under Black Friday load</td>
                <td className="border border-neutral-200 px-3 py-2">Non-functional performance / soak / spike tests</td>
              </tr>
              <tr>
                <td className="border border-neutral-200 px-3 py-2">PCI logging hygiene</td>
                <td className="border border-neutral-200 px-3 py-2">Static secret scanning + dynamic penetration probes</td>
              </tr>
              <tr>
                <td className="border border-neutral-200 px-3 py-2">Accessibility of hosted payment fields</td>
                <td className="border border-neutral-200 px-3 py-2">Manual usability + automated axe checks</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="expert">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Expert framing: portfolios, not tribal badges</h2>
        <p className="mt-4">
          Mature programmes maintain capability maps linking business risks to testing types, tooling, and skill assignments.
          Instead of debating whether “API testing is functional or integration,” focus on evidence: what unknown does this suite
          reduce, under what assumptions, and how frequently must we refresh it as architecture evolves?
        </p>
      </section>

      <section id="takeaways">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>Use buckets to communicate quickly; combine techniques when risks span categories.</li>
          <li>Static plus dynamic testing catches different defect families—skipping reviews cannot be rescued by late scripts alone.</li>
          <li>Automation scales repetition; humans interpret ambiguity—budget for both.</li>
        </ul>
      </section>
    </SoftwareTestingLesson>
  );
}

export function LevelsOfSoftwareTestingRichLesson() {
  return (
    <SoftwareTestingLesson
      sectionLabel="Basics"
      title="Levels of Software Testing"
      description="Levels describe how much of the system is exercised together: tiny pieces, collaborating modules, the whole product, or business-ready flows. Each level finds different bugs."
      readingMinutes={13}
    >
      <section id="simple-house">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Simple picture: bricks, rooms, housewarming</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>
            <strong className="text-neutral-900">Unit:</strong> verify each brick snaps correctly—inputs and outputs of one function
            or class.
          </li>
          <li>
            <strong className="text-neutral-900">Integration:</strong> ensure plumbing between rooms works—API contracts, queues,
            databases cooperating.
          </li>
          <li>
            <strong className="text-neutral-900">System:</strong> walk through the furnished house end-to-end as a renter would—full
            environments, realistic data volumes.
          </li>
          <li>
            <strong className="text-neutral-900">Acceptance:</strong> the family decides whether they will actually move in—business or
            user criteria, sometimes contractual.
          </li>
        </ul>
      </section>

      <section id="definitions">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Definitions with concrete examples</h2>
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Unit testing</h3>
            <p className="mt-2">
              Fast, isolated checks—often with mocks/fakes—proving algorithms and edge cases. <em>Example:</em> tax rounding helper
              returns correct cents for each bracket boundary.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Integration testing</h3>
            <p className="mt-2">
              Validates interfaces between components or services. <em>Example:</em> order service publishes events consumed by inventory
              with correct idempotency keys.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">System testing</h3>
            <p className="mt-2">
              Executes against the integrated application in production-like settings—functional and non-functional angles.
              <em> Example:</em> disaster-recovery drill restores databases within RPO/RTO budgets while dashboards stay accurate.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Acceptance testing</h3>
            <p className="mt-2">
              Confirms the system satisfies agreed acceptance criteria—User Acceptance Testing (UAT), contractual checklists,
              regulatory sign-offs, or beta cohort feedback programmes.
            </p>
          </div>
        </div>
      </section>

      <section id="pyramid">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Test pyramid (guideline, not gospel)</h2>
        <p className="mt-4">
          Visualise many cheap unit tests at the base, fewer integration checks in the middle, and the smallest count of fragile UI
          end-to-end suites at the top. Pyramids promote fast feedback and pinpoint failures—but microservices and rich frontends
          sometimes justify “diamond” shapes with heavier integration layers when contracts stabilise later.
        </p>
      </section>

      <section id="example-ecommerce">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Worked example: ecommerce promo engine</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>
            <strong className="text-neutral-900">Unit:</strong> percentage-off calculator respects caps and currency rounding.
          </li>
          <li>
            <strong className="text-neutral-900">Integration:</strong> promo microservice reads catalogue Redis cache with graceful
            degradation when stale.
          </li>
          <li>
            <strong className="text-neutral-900">System:</strong> storefront, payments, and fulfilment orchestrate a weekend sale under
            load tests.
          </li>
          <li>
            <strong className="text-neutral-900">Acceptance:</strong> merchandising approves screenshot-evidence plus analytics dashboards
            matching contractual KPI reporting.
          </li>
        </ul>
      </section>

      <section id="expert">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Expert angle: shifting boundaries</h2>
        <p className="mt-4">
          Contract tests and consumer-driven contracts blur traditional integration boundaries. Observability-driven testing lifts
          production traffic replay into “system” validation without staging clones. Naming debates matter less than clarity about
          scope, data realism, and defect isolation goals per suite.
        </p>
      </section>

      <section id="takeaways">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>Move left with fast feedback loops; reserve expensive levels for holistic risks.</li>
          <li>Choose data and environment fidelity deliberately—integrated cans of worms hide behind “realistic enough.”</li>
          <li>Acceptance belongs to stakeholders; testers facilitate evidence they trust.</li>
        </ul>
      </section>
    </SoftwareTestingLesson>
  );
}

export function TestMaturityModelRichLesson() {
  return (
    <SoftwareTestingLesson
      sectionLabel="Basics"
      title="Test Maturity Model — Software Testing"
      description="TMMi (Test Maturity Model integration) is one structured way to judge how repeatable, measured, and optimised testing practices are—similar to leveling up in a game, but for teams."
      readingMinutes={12}
    >
      <section id="kid-level">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Kid-level idea: levelling up on purpose</h2>
        <p className="mt-4">
          Beginner players button-mash; intermediate players learn combos; experts invent strategies and coach teammates. Maturity
          models label those stages so organisations know where they stand and what “next level” behaviours look like—without
          pretending a checklist replaces culture.
        </p>
      </section>

      <section id="what-tmmi-measures">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">What TMMi tends to measure</h2>
        <p className="mt-4">
          TMMi organises practices into process areas—such as test policy, planning, monitoring, defect prevention—and maps them to
          maturity levels. GhostAPI summarises the usual five-level story you will hear in certifications and consulting
          engagements:
        </p>
        <ol className="mt-4 list-decimal space-y-4 pl-6 marker:font-semibold marker:text-[#050040]">
          <li>
            <strong className="text-neutral-900">Initial:</strong> heroic efforts; success depends on individuals; metrics scarce.
          </li>
          <li>
            <strong className="text-neutral-900">Managed:</strong> basic processes exist—plans, tracked defects—though still reactive.
          </li>
          <li>
            <strong className="text-neutral-900">Defined:</strong> organisation-wide standards, templates, training; integration with
            wider engineering lifecycle improves.
          </li>
          <li>
            <strong className="text-neutral-900">Measured:</strong> quantitative goals, trend analysis, deliberate defect prevention and
            reuse.
          </li>
          <li>
            <strong className="text-neutral-900">Optimisation:</strong> continuous improvement fueled by innovation, statistical insight,
            and predictive practices.
          </li>
        </ol>
      </section>

      <section id="example-startup-vs-bank">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Contrasting examples</h2>
        <p className="mt-4">
          <strong className="text-neutral-900">Startup MVP:</strong> may honestly sit Level 1–2—lightweight charters, manual regression
          spreadsheets—while chasing product-market fit.
        </p>
        <p className="mt-4">
          <strong className="text-neutral-900">Retail bank:</strong> regulatory expectations push Level 3–4 behaviours—formal test
          strategies, audit trails, KPI dashboards feeding release committees.
        </p>
      </section>

      <section id="why-organisations-care">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Why organisations adopt maturity assessments</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>Benchmark divisions against a common vocabulary when merging companies.</li>
          <li>Justify investment in automation platforms or environment provisioning gaps.</li>
          <li>Satisfy outsourcing partners demanding proof of disciplined QA practices.</li>
        </ul>
      </section>

      <section id="expert-limits">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Expert realism: models help—and distort</h2>
        <p className="mt-4">
          Assessments can decay into checkbox theatre if leaders chase certificates without outcomes (escaped defects, customer
          sentiment, cycle time). Agile-native teams may satisfy spirit of Level 4 metrics via telemetry while skipping heavyweight
          documents—context matters (echoing testing principles).
        </p>
        <p className="mt-4">
          Maturity models seldom capture psychological safety, psychological incentives, or toolchain drag—yet those factors determine
          whether improvements stick. Pair assessments with qualitative retrospectives and gemba walks through test data workflows.
        </p>
      </section>

      <section id="practical-next-steps">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Practical next steps for practitioners</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-6 marker:text-neutral-900">
          <li>Inventory current artefacts—plans, dashboards, automation ownership—to spot objective gaps.</li>
          <li>Pick one process area (say defect prevention) and define measurable pilot improvements for two quarters.</li>
          <li>Share outcomes with engineering leadership using customer-impact narratives, not level badges alone.</li>
        </ol>
      </section>

      <section id="takeaways">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>TMMi names progressive discipline levels—useful roadmap language when aligned to risk.</li>
          <li>Higher maturity without customer outcomes is hollow; lower maturity with sharp feedback loops can still ship responsibly.</li>
          <li>Treat assessments as coaching instruments, not trophies.</li>
        </ul>
      </section>
    </SoftwareTestingLesson>
  );
}
