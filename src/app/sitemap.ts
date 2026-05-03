import { getAllSoftwareTestingLessonSlugs } from "@/lib/guides/software-testing-nav";
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const softwareTestingLessonUrls: MetadataRoute.Sitemap = getAllSoftwareTestingLessonSlugs().map((slug) => ({
    url: `${BASE_URL}/guides/software-testing/${slug}`,
    lastModified: now,
  }));

  return [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/api-hub`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/typeforge`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/curlify`,
      lastModified: now,
    },
    {
      url: `${BASE_URL}/guides/software-testing`,
      lastModified: now,
    },
    ...softwareTestingLessonUrls,
  ];
}
