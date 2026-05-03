/**
 * Software testing curriculum — sidebar structure (GeeksforGeeks-style flat outline).
 * Slugs are globally unique across all sections. Every item is routable.
 */

export type SoftwareTestingNavItem = {
  title: string;
  slug: string;
};

export type SoftwareTestingNavSection = {
  id: string;
  label: string;
  items: SoftwareTestingNavItem[];
};

export type SoftwareTestingLessonMeta = {
  slug: string;
  title: string;
  sectionId: string;
  sectionLabel: string;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createSoftwareTestingNavSections(): SoftwareTestingNavSection[] {
  const globalUsedSlugs = new Set<string>();

  function makeItems(titles: readonly string[]): SoftwareTestingNavItem[] {
    return titles.map((title) => {
      const base = slugify(title);
      let slug = base;
      let n = 2;
      while (globalUsedSlugs.has(slug)) {
        slug = `${base}-${n}`;
        n += 1;
      }
      globalUsedSlugs.add(slug);
      return { title, slug };
    });
  }

  return [
    {
      id: "basics",
      label: "Basics",
      items: makeItems([
        "Introduction to Software Testing",
        "Principles of Software testing - Software Testing",
        "Software Development Life Cycle (SDLC)",
        "Software Testing Life Cycle (STLC)",
        "Types of Software Testing",
        "Levels of Software Testing",
        "Test Maturity Model - Software Testing",
      ]),
    },
    {
      id: "sdlc-models",
      label: "SDLC Models",
      items: makeItems([
        "Waterfall Model - Software Engineering",
        "Spiral Model in Software Engineering",
        "What is a Hybrid Work Model?",
        "Prototyping Model - Software Engineering",
        "SDLC V-Model - Software Engineering",
      ]),
    },
    {
      id: "types-of-testing",
      label: "Types of Testing",
      items: makeItems([
        "Introduction to Manual Testing - Software Testing",
        "Automation Testing - Software Testing",
      ]),
    },
    {
      id: "types-of-manual",
      label: "Types of Manual",
      items: makeItems([
        "White box Testing - Software Engineering",
        "Black Box Testing - Software Engineering",
        "Gray Box Testing - Software Testing",
      ]),
    },
    {
      id: "white-box-techniques",
      label: "White Box Techniques",
      items: makeItems([
        "Data Flow Testing",
        "Control Flow Software Testing",
        "Branch Software Testing",
        "Statement Coverage Testing",
        "Code Coverage Testing in Software Testing",
      ]),
    },
    {
      id: "black-box-techniques",
      label: "Black Box Techniques",
      items: makeItems([
        "Decision Table Based Testing in Software Testing",
        "Pairwise Software Testing",
        "Cause Effect Graphing in Software Engineering",
        "State Transition Testing",
        "Software Testing - Use Case Testing",
      ]),
    },
    {
      id: "types-of-black-box",
      label: "Types of Black Box",
      items: makeItems(["Functional Testing - Software Testing", "Non-Functional Testing"]),
    },
    {
      id: "types-of-functional",
      label: "Types of Functional",
      items: makeItems(["Unit Testing", "Integration Testing", "System Testing - Software Engineering"]),
    },
    {
      id: "types-of-non-functional",
      label: "Types of Non-Functional",
      items: makeItems([
        "Performance Testing - Software Testing",
        "Usability Testing - Software Engineering",
        "Compatibility Testing in Software Engineering",
      ]),
    },
    {
      id: "test-case-development",
      label: "Test Case Development",
      items: makeItems([
        "Testing Documentation - Software Testing",
        "How to Write Test Cases in Software Testing",
      ]),
    },
    {
      id: "testing-techniques",
      label: "Testing Techniques",
      items: makeItems([
        "Error Guessing in Software Testing",
        "Equivalence Partitioning Method",
        "Software Testing - Boundary Value Analysis",
      ]),
    },
    {
      id: "test-management",
      label: "Test Management",
      items: makeItems([
        "Test Plan - Software Testing",
        "Software Testing - Test Case Review",
        "Requirements Traceability Matrix - RTM",
      ]),
    },
    {
      id: "defect-tracking",
      label: "Defect Tracking",
      items: makeItems([
        "Bugs in Software Testing",
        "Bug Life Cycle in Software Development",
        "Severity in Testing vs Priority in Testing",
        "Test Environment: A Beginner's Guide",
        "Defect Management Process",
      ]),
    },
    {
      id: "other-types-of-testing",
      label: "Other Types of Testing",
      items: makeItems([
        "Regression Testing - Software Engineering",
        "Smoke Testing - Software Testing",
        "Sanity Testing - Software Testing",
        "Static Testing - Software Testing",
        "Dynamic Testing - Software Testing",
        "Load Testing - Software Testing",
        "Stress Testing",
        "Recovery Testing - Software Testing",
        "Exploratory Testing",
        "Visual Testing - Software Testing",
        "Acceptance Testing - Software Testing",
        "Alpha Testing - Software Testing",
        "Beta Testing - Software Testing",
        "Database Testing - Software Testing",
        "Software Testing - Mainframe Testing",
        "Adhoc Testing in Software",
        "Globalization Testing - Software Testing",
        "Mutation Testing - Software Testing",
        "Security Testing - Software Testing",
        "Accessibility Testing - Software Testing",
        "Structural Software Testing",
        "Volume Testing",
        "Scalability Testing - Software Testing",
        "Stability Testing - Software Testing",
        "Spike Testing - Software Testing",
        "Negative Testing in Software Engineering",
        "Positive Testing - Software Testing",
        "Endurance Testing - Software Testing",
        "Reliability Testing - Software Testing",
        "Monkey Software Testing",
        "Agile Software Testing",
        "Component Software Testing",
        "Graphical User Interface Testing (GUI) Testing",
        "Test Strategy - Software Testing",
      ]),
    },
    {
      id: "software-testing-tools",
      label: "Software Testing Tools",
      items: makeItems([
        "Software Testing Tools",
        "Top 20 Test Management Tools",
        "Defect Testing Tools - Software Testing",
        "7 Best Automation Tools for Testing",
        "Cross-Browser Testing Tools - Software Testing",
        "Integration Testing Tool - Software Testing",
        "Software Testing - Unit Testing Tools",
        "Mobile Testing Tools - Software Testing",
        "GUI Testing Tool",
        "Top Testing Tools - Software Testing",
        "Penetration Testing - Software Engineering",
      ]),
    },
    {
      id: "differences",
      label: "Differences",
      items: makeItems([
        "Manual Testing vs Automated Testing",
        "Difference between Load Testing and Stress Testing",
        "Sanity Testing Vs Smoke Testing - Software Engineering",
        "Difference between System Testing and Acceptance Testing",
        "Quality Assurance (QA) vs Quality Control (QC)",
        "Static Testing Vs Dynamic Testing",
        "Verification Vs Validation",
        "Difference between Alpha and Beta Testing",
        "Difference between Black Box and White and Grey Box Testing",
        "Difference between Globalization and Localization Testing",
        "Test Case vs Test Scenario",
        "Test Strategy vs Test Plan",
        "Software Testing - Boundary Value Analysis vs Equivalence Partitioning",
        "Difference between SDLC and STLC",
        "Software Testing - Bug vs Defect vs Error vs Fault vs Failure",
        "Differences between Testing and Debugging",
        "Difference between Frontend Testing and Backend Testing",
        "Difference between High Level Design(HLD) and Low Level Design(LLD)",
        "Software Testing - BRS vs SRS",
      ]),
    },
  ];
}

export const SOFTWARE_TESTING_NAV_SECTIONS = createSoftwareTestingNavSections();

const LESSON_META_BY_SLUG = new Map<string, SoftwareTestingLessonMeta>();

function buildLessonMetaIndex(): void {
  for (const section of SOFTWARE_TESTING_NAV_SECTIONS) {
    for (const item of section.items) {
      LESSON_META_BY_SLUG.set(item.slug, {
        slug: item.slug,
        title: item.title,
        sectionId: section.id,
        sectionLabel: section.label,
      });
    }
  }
}

buildLessonMetaIndex();

export function getSoftwareTestingLessonMeta(slug: string): SoftwareTestingLessonMeta | undefined {
  return LESSON_META_BY_SLUG.get(slug);
}

export function getAllSoftwareTestingLessonSlugs(): string[] {
  return Array.from(LESSON_META_BY_SLUG.keys());
}

const GUIDE_BASE = "/guides/software-testing";

export function lessonHref(slug: string): string {
  return `${GUIDE_BASE}/${slug}`;
}
