import {
  renderSoftwareTestingLesson,
  softwareTestingOpenGraphDescription,
} from "@/lib/guides/software-testing-render-lesson";
import {
  getAllSoftwareTestingLessonSlugs,
  getSoftwareTestingLessonMeta,
} from "@/lib/guides/software-testing-nav";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllSoftwareTestingLessonSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = getSoftwareTestingLessonMeta(slug);
  if (!meta) {
    return { title: "Software testing guides | GhostAPI" };
  }
  const description = softwareTestingOpenGraphDescription(meta);
  return {
    title: `${meta.title} | GhostAPI Guides`,
    description,
    openGraph: {
      title: `${meta.title} | GhostAPI Guides`,
      description,
      type: "article",
    },
  };
}

export default async function SoftwareTestingLessonPage({ params }: Props) {
  const { slug } = await params;
  const lessonMeta = getSoftwareTestingLessonMeta(slug);
  if (!lessonMeta) notFound();

  return renderSoftwareTestingLesson(lessonMeta);
}
