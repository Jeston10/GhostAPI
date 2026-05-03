import { SoftwareTestingLesson } from "@/components/guides/software-testing-lesson";

export function PrinciplesRichLesson() {
  return (
    <SoftwareTestingLesson
      sectionLabel="Basics"
      title="Principles of Software Testing"
      description="Think of these principles as guardrails: they keep expectations realistic while still pushing teams to test thoughtfully—from first sketches of a feature to release."
      readingMinutes={14}
    >
      <section id="simple-start">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Start simple: rules that match real life</h2>
        <p className="mt-4">
          Imagine checking whether a new bicycle is safe. You ride it around the block, squeeze the brakes, and shake the
          handlebars. You cannot try every possible hill, weather, and rider weight—but you still learn a lot. Software testing
          works the same way: you design sensible checks, accept that unknowns remain, and improve what you test when the
          product or risks change.
        </p>
      </section>

      <section id="seven-principles">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">The seven principles teams reference most often</h2>
        <p className="mt-4">
          These ideas appear in many curricula (including ISTQB-style syllabi). GhostAPI restates them here in plain language
          with quick examples you can reuse in interviews or sprint planning.
        </p>

        <div className="mt-6 space-y-8 border-l-2 border-neutral-200 pl-5">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">1. Testing shows presence of defects, not their absence</h3>
            <p className="mt-2">
              Passing tests mean “we did not observe a failure under these conditions,” not “there are zero bugs.”{" "}
              <strong className="text-neutral-900">Example:</strong> a checkout flow passes with domestic cards but breaks on
              international BIN ranges nobody exercised yet.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">2. Exhaustive testing is impossible</h3>
            <p className="mt-2">
              Even tiny programs explode into more input combinations than teams can afford to run.{" "}
              <strong className="text-neutral-900">Example:</strong> a date field accepts day/month/year; pairing every leap year
              edge with every timezone offset is impractical—so you sample and prioritise.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">3. Early testing saves time and money</h3>
            <p className="mt-2">
              Ambiguous acceptance criteria found during backlog refinement costs minutes to rewrite; the same gap discovered
              after release can cost outages or refunds.{" "}
              <strong className="text-neutral-900">Example:</strong> testers review user stories and flag missing error copies
              before developers code the unhappy paths.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">4. Defect clustering</h3>
            <p className="mt-2">
              A handful of modules tend to harbour most production defects—often complex legacy areas or rushed features.{" "}
              <strong className="text-neutral-900">Example:</strong> analytics pipelines that stitch six microservices may merit
              deeper regression than a static marketing banner.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">5. Pesticide paradox</h3>
            <p className="mt-2">
              Re-running the same checks eventually stops finding new issues; variation matters.{" "}
              <strong className="text-neutral-900">Example:</strong> if every sprint replays identical API smoke tests, rotate
              in charter-based exploratory sessions or mutate payloads to surface fresh failures.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">6. Testing is context dependent</h3>
            <p className="mt-2">
              A toy demo app and a medical device share vocabulary (“test case”) but not rigour or regulation.{" "}
              <strong className="text-neutral-900">Example:</strong> banking APIs might mandate audit logs and fraud simulations;
              an internal dashboard might prioritise speed over exhaustive negative paths.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">7. Absence-of-errors fallacy</h3>
            <p className="mt-2">
              Perfect implementation of the wrong specification still fails users. Validation (“did we build the right thing?”)
              pairs with verification (“did we build it right?”).{" "}
              <strong className="text-neutral-900">Example:</strong> dazzling UX polish on a screen that solves the wrong workflow
              still yields churn.
            </p>
          </div>
        </div>
      </section>

      <section id="examples-workshop">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Mini workshop: translate principles into test ideas</h2>
        <p className="mt-4">
          Suppose your team ships a password-reset API. Instead of vague “test everything,” tie ideas back to the principles:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>
            <strong className="text-neutral-900">Principle 1 &amp; 2:</strong> design suites around token expiry, replay attacks,
            and rate limits rather than brute-forcing every Unicode password.
          </li>
          <li>
            <strong className="text-neutral-900">Principle 3:</strong> review threat assumptions during design—not only after
            integration.
          </li>
          <li>
            <strong className="text-neutral-900">Principle 4:</strong> spend extra cycles on the identity provider hand-off if
            history shows it breaks often.
          </li>
          <li>
            <strong className="text-neutral-900">Principle 5:</strong> alternate scripted checks with fuzzed headers or malformed
            JSON bodies.
          </li>
        </ul>
      </section>

      <section id="expert-angle">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Expert angle: principles meet risk and economics</h2>
        <p className="mt-4">
          Mature organisations encode these principles into policies: definition-of-done requires traceability from risk statements
          to tests; release governance distinguishes “green CI” from “residual risk accepted by owner.” Principles are not
          rituals—they prioritise finite attention toward customer harm, regulatory exposure, and brand promises.
        </p>
        <p className="mt-4">
          Metrics such as escaped-defect rate or mean time to detect help teams judge whether their interpretation of the
          principles is working. When numbers degrade, revisit clustering hotspots (principle 4) and diversify techniques
          (principle 5) instead of only adding headcount.
        </p>
      </section>

      <section id="takeaways">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>Use the principles to explain why “just automate everything” or “ship because QA signed off” misleads stakeholders.</li>
          <li>Pair early collaboration (principle 3) with evolving suites (principle 5) so quality improves sprint over sprint.</li>
          <li>Always ask whether tests validate real outcomes—not only clean logs (principle 7).</li>
        </ul>
      </section>
    </SoftwareTestingLesson>
  );
}

export function SoftwareDevelopmentLifeCycleRichLesson() {
  return (
    <SoftwareTestingLesson
      sectionLabel="Basics"
      title="Software Development Life Cycle (SDLC)"
      description='SDLC is the big-picture timeline from “we have an idea” to “software runs in production and evolves.” Testing plugs into every phase—even when some steps blur together in Agile shipping.'
      readingMinutes={13}
    >
      <section id="kid-level">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Kid-level picture: building with LEGO instructions</h2>
        <p className="mt-4">
          Before you snap bricks together, you decide what you are building (requirements), sketch how rooms connect (design),
          assemble pieces (implementation), check whether doors really open (testing), show your parents (deployment), and repair
          loose plates later (maintenance). Software follows the same rhythm—just with code, databases, and APIs instead of
          plastic bricks.
        </p>
      </section>

      <section id="phases">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Classic phases and what usually happens</h2>
        <ol className="mt-4 list-decimal space-y-4 pl-6 marker:font-semibold marker:text-[#050040]">
          <li>
            <strong className="text-neutral-900">Planning / feasibility:</strong> why build this? Budget, timelines, regulatory
            constraints. <em>Testing tie-in:</em> identify compliance needs (accessibility, audit trails) before architecture locks
            in.
          </li>
          <li>
            <strong className="text-neutral-900">Requirements analysis:</strong> capture behaviours, data rules, integrations.{" "}
            <em>Testing tie-in:</em> reviewers hunt ambiguity (“fast response”) that would become arguing bugs later.
          </li>
          <li>
            <strong className="text-neutral-900">Design:</strong> architecture, APIs, UX flows. <em>Testing tie-in:</em> testability
            features—feature flags, structured logs, mocking seams—are cheapest here.
          </li>
          <li>
            <strong className="text-neutral-900">Implementation (coding):</strong> developers ship increments.{" "}
            <em>Testing tie-in:</em> unit checks, pair review, static analysis, CI compilation—all qualify as quality work.
          </li>
          <li>
            <strong className="text-neutral-900">Testing (verification):</strong> integration, system, performance, security suites
            validate the integrated product against requirements.
          </li>
          <li>
            <strong className="text-neutral-900">Deployment / release:</strong> ship to staging, canary, or production; monitor
            telemetry.
          </li>
          <li>
            <strong className="text-neutral-900">Maintenance:</strong> patches, scaling events, dependency upgrades—each triggers
            selective regression.
          </li>
        </ol>
      </section>

      <section id="example-startup">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Worked example: booking widget for barbershops</h2>
        <p className="mt-4">
          <strong className="text-neutral-900">Requirements:</strong> customers choose stylist, slot length, and SMS reminders.
        </p>
        <p className="mt-4">
          <strong className="text-neutral-900">Design:</strong> REST endpoints for availability plus a lightweight web component
          embedded on partner sites.
        </p>
        <p className="mt-4">
          <strong className="text-neutral-900">Implementation &amp; testing:</strong> engineers mock SMS providers in CI, testers
          script double-booking attempts, product validates UX with pilot shops.
        </p>
        <p className="mt-4">
          <strong className="text-neutral-900">Deployment &amp; maintenance:</strong> rollout per geography; later upgrades adjust
          for daylight-saving bugs surfaced by real users—feeding maintenance testing.
        </p>
      </section>

      <section id="modern-delivery">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Intermediate+: SDLC when phases overlap</h2>
        <p className="mt-4">
          CI/CD, trunk-based development, and DevOps compress the linear diagram into loops: tiny requirements feed tiny designs
          which ship behind toggles. Testing morphs into continuous automation, observability-driven experiments, and production
          experimentation—yet the underlying concerns remain (risk, evidence, governance).
        </p>
      </section>

      <section id="expert">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Expert notes</h2>
        <p className="mt-4">
          Enterprise SDLC frameworks often add formal gates (architecture review boards, segregation-of-duty approvals). Test
          managers contribute evidence packs: coverage of regulatory clauses, defect trends, environment parity statements. Align
          vocabulary with SDLC models such as Waterfall or V-Model when negotiating staffing—each model shifts when testers
          formally enter (see SDLC Models lessons in this sidebar).
        </p>
      </section>

      <section id="takeaways">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>SDLC names phases; your daily job is collaborating inside those phases—not waiting for a mythical “testing phase” at the end.</li>
          <li>Earliest phases determine how expensive fixes become—push clarity and test hooks upstream.</li>
          <li>Modern agility changes rhythm, not the need for disciplined verification before risky releases.</li>
        </ul>
      </section>
    </SoftwareTestingLesson>
  );
}

export function SoftwareTestingLifeCycleRichLesson() {
  return (
    <SoftwareTestingLesson
      sectionLabel="Basics"
      title="Software Testing Life Cycle (STLC)"
      description="STLC is the specialist slice of SDLC focused on planning tests, designing them, executing them, and learning from the results—structured so quality work is traceable, not accidental."
      readingMinutes={13}
    >
      <section id="simple">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Simple analogy: rehearsing a school play</h2>
        <p className="mt-4">
          Directors read the script (requirements), block scenes (test planning), teach actors their cues (test design), run dress
          rehearsals (execution), fix loose props (defect management), and hold a retrospective after opening night (closure).
          STLC is that rehearsal discipline applied to software releases.
        </p>
      </section>

      <section id="phases">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Common STLC phases</h2>
        <ol className="mt-4 list-decimal space-y-4 pl-6 marker:font-semibold marker:text-[#050040]">
          <li>
            <strong className="text-neutral-900">Requirement analysis:</strong> testers study specs, acceptance criteria,
            regulations. Outputs include clarified assumptions and testability risks.
          </li>
          <li>
            <strong className="text-neutral-900">Test planning:</strong> define scope, schedule, resources, tools, entry and exit
            criteria, metrics (Defect Detection Percentage, automation ROI targets).
          </li>
          <li>
            <strong className="text-neutral-900">Test design / development:</strong> author cases, data sets, automation scripts,
            environment checklists; peer-review for coverage gaps.
          </li>
          <li>
            <strong className="text-neutral-900">Environment setup:</strong> provision configs, secrets, representative datasets,
            integrations—often parallel to development when using ephemeral environments.
          </li>
          <li>
            <strong className="text-neutral-900">Test execution:</strong> manual runs, CI pipelines, exploratory charters, defect
            logging, retesting fixes.
          </li>
          <li>
            <strong className="text-neutral-900">Closure:</strong> summarise coverage vs risk, residual defects, lessons learned,
            knowledge base updates.
          </li>
        </ol>
      </section>

      <section id="example-two-week-sprint">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Example: STLC inside a two-week Scrum sprint</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>
            <strong className="text-neutral-900">Day 0–1:</strong> refinement workshop clarifies API pagination rules—test analysts
            update a lightweight RTM snippet tying story IDs to behaviours.
          </li>
          <li>
            <strong className="text-neutral-900">Day 2:</strong> sprint planning selects regression subsets + new cases for risky
            migrations.
          </li>
          <li>
            <strong className="text-neutral-900">Mid-sprint:</strong> automation engineers stabilise flaky selectors while developers
            complete features behind toggles.
          </li>
          <li>
            <strong className="text-neutral-900">Pre-release:</strong> exploratory session focuses on cross-browser QR login;
            critical defects block toggle enablement.
          </li>
          <li>
            <strong className="text-neutral-900">Sprint review / retro:</strong> closure metrics feed into next sprint’s risk backlog
            (maybe performance debt spotted during execution).
          </li>
        </ul>
      </section>

      <section id="sdlc-vs-stlc">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">How STLC hugs SDLC without duplicating it</h2>
        <p className="mt-4">
          SDLC spans all engineering roles; STLC answers “how will we obtain credible evidence about quality each step?” When
          organisations gate releases, STLC artefacts (plans, logs, dashboards) demonstrate diligence—even if teams operate
          iteratively instead of waterfall binders.
        </p>
      </section>

      <section id="expert">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Expert considerations</h2>
        <p className="mt-4">
          Shift-left initiatives collapse phases: testers participate during requirement analysis with reusable Given / When / Then
          scenarios that become automated checks. Continuous testing blurs execution into development hours, yet governance still
          expects identifiable planning and closure evidence for regulated industries.
        </p>
        <p className="mt-4">
          Quality intelligence platforms aggregate STLC telemetry (pass rates, flake rates, MTTR) alongside SDLC signals (lead time,
          deployment frequency) so executives see holistic health—not vanity green dashboards.
        </p>
      </section>

      <section id="takeaways">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>STLC supplies repeatable structure for something creative—testing—without killing agility.</li>
          <li>Invest in planning and environment fidelity early; execution surprises usually trace upstream gaps.</li>
          <li>Close loops with metrics and narratives stakeholders actually understand.</li>
        </ul>
      </section>
    </SoftwareTestingLesson>
  );
}
