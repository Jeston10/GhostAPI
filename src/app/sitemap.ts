import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

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
  ];
}
