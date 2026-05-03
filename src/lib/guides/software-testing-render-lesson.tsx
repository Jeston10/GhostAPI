import {
  GeneratedSoftwareTestingLesson,
  generatedLessonDescription,
} from "@/lib/guides/software-testing-generated-lesson";
import type { SoftwareTestingLessonMeta } from "@/lib/guides/software-testing-nav";
import {
  PrinciplesRichLesson,
  SoftwareDevelopmentLifeCycleRichLesson,
  SoftwareTestingLifeCycleRichLesson,
} from "@/lib/guides/software-testing-lessons/basics-rich-part-a";
import {
  LevelsOfSoftwareTestingRichLesson,
  TestMaturityModelRichLesson,
  TypesOfSoftwareTestingRichLesson,
} from "@/lib/guides/software-testing-lessons/basics-rich-part-b";
import { IntroductionToSoftwareTestingLesson } from "@/lib/guides/software-testing-lessons/introduction";
import type { ReactNode } from "react";

const CUSTOM_LESSONS: Record<string, () => ReactNode> = {
  "introduction-to-software-testing": IntroductionToSoftwareTestingLesson,
  "principles-of-software-testing-software-testing": PrinciplesRichLesson,
  "software-development-life-cycle-sdlc": SoftwareDevelopmentLifeCycleRichLesson,
  "software-testing-life-cycle-stlc": SoftwareTestingLifeCycleRichLesson,
  "types-of-software-testing": TypesOfSoftwareTestingRichLesson,
  "levels-of-software-testing": LevelsOfSoftwareTestingRichLesson,
  "test-maturity-model-software-testing": TestMaturityModelRichLesson,
};

export function renderSoftwareTestingLesson(meta: SoftwareTestingLessonMeta): ReactNode {
  const render = CUSTOM_LESSONS[meta.slug];
  if (render) return render();
  return <GeneratedSoftwareTestingLesson meta={meta} />;
}

export function softwareTestingOpenGraphDescription(meta: SoftwareTestingLessonMeta): string {
  if (meta.slug === "introduction-to-software-testing") {
    return "Learn why testing exists, how defects differ from failures, and how teams organise quality work alongside SDLC delivery.";
  }
  return generatedLessonDescription(meta);
}
