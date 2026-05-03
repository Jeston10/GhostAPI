import { SoftwareTestingLesson } from "@/components/guides/software-testing-lesson";
import type { SoftwareTestingLessonMeta } from "@/lib/guides/software-testing-nav";
import type { ReactNode } from "react";

export function slugHash(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], slug: string): T {
  return arr[slugHash(slug) % arr.length]!;
}

export function generatedLessonReadingMinutes(slug: string): number {
  return 8 + (slugHash(slug) % 6);
}

export function generatedLessonDescription(meta: SoftwareTestingLessonMeta): string {
  const { title, sectionLabel } = meta;
  if (meta.sectionId === "differences") {
    return `${title}: side-by-side contrasts, when each idea applies, and practical tips—GhostAPI’s independent study notes for testers and developers.`;
  }
  if (meta.sectionId === "software-testing-tools") {
    return `${title}: what these tools usually do, how teams evaluate options, and pitfalls when shopping lists go viral—original GhostAPI guidance.`;
  }
  return `${title} (${sectionLabel}): plain-language explanation with examples from everyday products, plus practitioner notes—GhostAPI software testing curriculum.`;
}

function ConceptBody({ meta }: { meta: SoftwareTestingLessonMeta }) {
  const v = slugHash(meta.slug);
  const product = pick(
    [
      "a subscription billing dashboard",
      "a mobile wallet used for transit payments",
      "a scheduling portal for healthcare clinics",
    ],
    meta.slug
  );
  const analogyIntro = pick(
    [
      <>
        Picture maintaining <strong>{product}</strong>: dozens of teams touch APIs, databases, and UI flows.{" "}
        <strong>{meta.title}</strong> is one lens teams use to rehearse risky behaviours before customers hit them first.
      </>,
      <>
        Think of shipping features like launching a small theatre production—props, lighting, and actors must align.
        Studying <strong>{meta.title}</strong> helps QA and developers agree which rehearsals prove the show is safe enough
        to open.
      </>,
      <>
        Imagine assembling a drone delivery tracker: sensors, maps, and alerts interact in messy ways.{" "}
        <strong>{meta.title}</strong> captures a focused testing viewpoint so you do not drown in unrelated checks.
      </>,
    ],
    `${meta.slug}-a`
  );

  const pitfall = pick(
    [
      "Treating green dashboards as proof no customer journey can fail—always tie signals to critical scenarios.",
      "Skipping environment parity: staged passes may lie when TLS termination or CPU quotas differ from production.",
      "Confusing activity with coverage—busy test runs that repeat safe paths miss fresh defects (the pesticide paradox).",
    ],
    `${meta.slug}-p`
  );

  return (
    <>
      <section id="overview">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">What this topic is about</h2>
        <p className="mt-4">
          This lesson covers <strong className="text-neutral-900">{meta.title}</strong> inside the{" "}
          <strong className="text-neutral-900">{meta.sectionLabel}</strong> track. GhostAPI writes independent educational
          material—use it alongside your organisation’s standards, regulations, and tooling choices.
        </p>
        <p className="mt-4">{analogyIntro}</p>
      </section>

      <section id="definitions">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Definitions without jargon walls</h2>
        <p className="mt-4">
          At a high level, <strong>{meta.title}</strong> influences how you choose inputs, environments, and evidence when
          validating software. Beginners can remember three anchors: <em>intent</em> (what risk are we exploring?),{" "}
          <em>oracle</em> (how do we know pass vs fail?), and <em>scope</em> (which layers of the stack participate?).
        </p>
        <p className="mt-4">
          Intermediate testers translate those anchors into charters, suites, or automation modules. Advanced teams pair this
          topic with telemetry and shift-left practices so feedback loops shrink from weeks to minutes—without skipping
          thoughtful design.
        </p>
      </section>

      <section id="example">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Worked example</h2>
        <p className="mt-4">
          Suppose you enhance <strong>{product}</strong>. A meaningful exercise for <strong>{meta.title}</strong> might
          combine realistic user personas, boundary data (currency fractions, long Unicode names, flaky networks), and
          observability checks (structured logs, traces). Document expected behaviour alongside failure modes—especially how
          partial outages should degrade.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>
            <strong className="text-neutral-900">Happy path:</strong> confirms baseline commitments made to stakeholders.
          </li>
          <li>
            <strong className="text-neutral-900">Negative path:</strong> exercises validation rules and resilience—often
            where security and data-quality defects hide.
          </li>
          <li>
            <strong className="text-neutral-900">Recovery path:</strong> validates retries, compensating transactions, or UX
            messaging after timeouts—critical for distributed systems.
          </li>
        </ul>
      </section>

      <section id="practice">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">How teams apply it in practice</h2>
        <p className="mt-4">
          Delivery organisations rarely adopt only one technique in isolation. Expect pairing{" "}
          <strong>{meta.title}</strong> with automation for repeatable guards, exploratory sessions for unexpected failures,
          and code/design reviews for cheap early signals. Prioritise breadth across roles—developers, testers, SREs, and
          product owners share ownership of quality narratives now.
        </p>
      </section>

      <section id="pitfalls">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Common pitfalls</h2>
        <p className="mt-4">{pitfall}</p>
      </section>

      <section id="expert">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Expert lens</h2>
        <p className="mt-4">
          Seasoned leaders map topics such as <strong>{meta.title}</strong> to measurable risk reduction: escaped-defect
          trendlines, cycle-time impact of flaky suites, and correlation between production incidents plus missing tests.
          Architecture matters—microservices encourage contract testing while monoliths might emphasise layered isolation.
          Adapt techniques rather than copying textbook diagrams verbatim.
        </p>
      </section>

      <section id="ghostapi">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">GhostAPI snapshot</h2>
        <p className="mt-4">
          API-heavy workflows benefit from rehearsal utilities—explore GhostAPI’s playground, hub listings, and lightweight
          runners when you need fast feedback loops around HTTP behaviour (always supplement with your formal strategy).
        </p>
      </section>

      <section id="takeaways">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>
            Anchor tests on customer-visible risks—not every checkbox in a template deserves equal cost ({v % 2 === 0 ? "especially under deadlines" : "especially when automation debt piles up"}).
          </li>
          <li>Blend human curiosity with automation discipline; neither replaces the other.</li>
          <li>Document assumptions so the next teammate understands why this topic mattered for your release.</li>
        </ul>
      </section>
    </>
  );
}

function DifferenceBody({ meta }: { meta: SoftwareTestingLessonMeta }) {
  return (
    <>
      <section id="why-compare">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Why compare these ideas?</h2>
        <p className="mt-4">
          Interview panels, certification exams, and architecture forums love contrasts such as{" "}
          <strong>{meta.title}</strong>. GhostAPI breaks them into responsibilities, timing, and artefacts so you can explain
          decisions without memorising brittle slogans.
        </p>
      </section>

      <section id="lens-a-lens-b">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Two lenses</h2>
        <div className="mt-4 overflow-x-auto border border-neutral-200">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="border border-neutral-200 px-3 py-2 font-semibold text-neutral-900">Dimension</th>
                <th className="border border-neutral-200 px-3 py-2 font-semibold text-neutral-900">First idea</th>
                <th className="border border-neutral-200 px-3 py-2 font-semibold text-neutral-900">Second idea</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="border border-neutral-200 px-3 py-2">Primary question</td>
                <td className="border border-neutral-200 px-3 py-2">
                  What problem does side A optimise for (speed, prevention, evidence, control)?
                </td>
                <td className="border border-neutral-200 px-3 py-2">
                  What problem does side B optimise for—often complementary rather than opposite?
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-200 px-3 py-2">Typical owners</td>
                <td className="border border-neutral-200 px-3 py-2">Roles most accountable for executing side A.</td>
                <td className="border border-neutral-200 px-3 py-2">Roles most accountable for executing side B.</td>
              </tr>
              <tr>
                <td className="border border-neutral-200 px-3 py-2">Artefacts</td>
                <td className="border border-neutral-200 px-3 py-2">
                  Documents, dashboards, or ceremonies associated with side A (plans, reviews, automated suites…).
                </td>
                <td className="border border-neutral-200 px-3 py-2">
                  Artefacts emphasising side B (release notes, audits, dashboards…).
                </td>
              </tr>
              <tr>
                <td className="border border-neutral-200 px-3 py-2">Overlap</td>
                <td className="border border-neutral-200 px-3 py-2" colSpan={2}>
                  Many contrasts are shades on a spectrum—teams blend practices (Agile + governance, automation + manual
                  exploration). Context decides the healthy mix.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="scenarios">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Scenario prompts</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>
            You tighten release gates after an outage—which side of <strong>{meta.title}</strong> shifts first: tooling,
            staffing, or policy?
          </li>
          <li>
            Auditors ask for traceability—which artefacts demonstrate both perspectives without duplicating busywork?
          </li>
          <li>A startup graduates to regulated workloads—how does the contrast evolve?</li>
        </ul>
      </section>

      <section id="misunderstandings">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Misunderstandings to avoid</h2>
        <p className="mt-4">
          Literal tribal definitions hurt collaboration. Prefer behaviours: what decisions improve when your team clarifies{" "}
          <strong>{meta.title}</strong>? If answering feels muddy, schedule a short workshop mapping workflows rather than
          debating textbook quotes online.
        </p>
      </section>

      <section id="takeaways">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>Contrasts clarify accountability—they should not become excuses for throwing work “over the wall.”</li>
          <li>Use diagrams plus narratives; executives grasp stories faster than tables alone.</li>
          <li>Revisit comparisons quarterly—modern CI/CD changes where lines blur.</li>
        </ul>
      </section>
    </>
  );
}

function ToolsBody({ meta }: { meta: SoftwareTestingLessonMeta }) {
  const stack = pick(
    ["JUnit / pytest ecosystems", "commercial SaaS suites", "Kubernetes-native runners"],
    `${meta.slug}-tools`
  );
  return (
    <>
      <section id="scope">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Scope of this tools lesson</h2>
        <p className="mt-4">
          Tool-marketing moves faster than textbooks—GhostAPI stays vendor-neutral on <strong>{meta.title}</strong>. Focus on
          evaluation dimensions your organisation controls: openness, integrations, licensing, skill fit, and observability.
        </p>
      </section>

      <section id="capabilities">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Capabilities teams usually expect</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>Authoring and versioning automated checks or manual scripts.</li>
          <li>Scheduling runs across environments with RBAC and audit logs.</li>
          <li>Linking defects, requirements, and builds for traceability matrices.</li>
          <li>Surfacing flake signals, historical duration trends, and bisection hints.</li>
        </ul>
      </section>

      <section id="evaluation">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Evaluation checklist</h2>
        <ol className="mt-4 list-decimal space-y-3 pl-6 marker:font-semibold marker:text-[#050040]">
          <li>
            <strong className="text-neutral-900">Adoption curve:</strong> can existing engineers operate it without hiring a
            specialised priesthood?
          </li>
          <li>
            <strong className="text-neutral-900">Integration:</strong> does it speak to issue trackers, SCM, and secrets
            managers you already pay for?
          </li>
          <li>
            <strong className="text-neutral-900">Total cost:</strong> licences plus infra plus maintenance hours ({stack}{" "}
            behave differently).
          </li>
          <li>
            <strong className="text-neutral-900">Exit strategy:</strong> exporting assets if the vendor sunsets a feature.
          </li>
        </ol>
      </section>

      <section id="reality">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Reality check</h2>
        <p className="mt-4">
          Lists titled “Top N tools” spark debates—they rarely understand your compliance regime or tech stack. Treat them as
          conversation starters. Pilot one workflow end-to-end before declaring victory on <strong>{meta.title}</strong>.
        </p>
      </section>

      <section id="takeaways">
        <h2 className="text-xl font-bold text-[#050040] md:text-2xl">Takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-neutral-500">
          <li>Optimise for workflow fit, not brochure bullet counts.</li>
          <li>Instrument adoption—metrics reveal shelfware early.</li>
          <li>Open-source vs proprietary is secondary to sustainable maintenance.</li>
        </ul>
      </section>
    </>
  );
}

export function GeneratedSoftwareTestingLesson({ meta }: { meta: SoftwareTestingLessonMeta }) {
  const readingMinutes = generatedLessonReadingMinutes(meta.slug);
  const description = generatedLessonDescription(meta);

  let body: ReactNode;
  if (meta.sectionId === "differences") {
    body = <DifferenceBody meta={meta} />;
  } else if (meta.sectionId === "software-testing-tools") {
    body = <ToolsBody meta={meta} />;
  } else {
    body = <ConceptBody meta={meta} />;
  }

  return (
    <SoftwareTestingLesson
      sectionLabel={meta.sectionLabel}
      title={meta.title}
      description={description}
      readingMinutes={readingMinutes}
    >
      {body}
    </SoftwareTestingLesson>
  );
}
