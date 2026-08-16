import type { MetadataRoute } from "next";
import { fetchLatestMovies } from "@/lib/nguonc/api";
import { toAbsoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let latestFilms: Array<{ slug: string; updatedAt: Date }> = [];

  try {
    const latest = await fetchLatestMovies(1);
    latestFilms = (latest.items || [])
      .map((item) => ({
        slug: String(item.slug || "").trim(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : now,
      }))
      .filter((item) => Boolean(item.slug));
  } catch (error) {
    console.error("Failed to load latest films for sitemap:", error);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: toAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: toAbsoluteUrl("/browse"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: toAbsoluteUrl("/ranking"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: toAbsoluteUrl("/ranking/weekly"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: toAbsoluteUrl("/ranking/monthly"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: toAbsoluteUrl("/ranking/allTime"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: toAbsoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: toAbsoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: toAbsoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: toAbsoluteUrl("/terms"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: toAbsoluteUrl("/dmca"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: toAbsoluteUrl("/cookies"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const paginatedBrowseRoutes: MetadataRoute.Sitemap = Array.from(
    { length: 9 },
    (_, index) => ({
      url: toAbsoluteUrl(`/browse/page-${index + 2}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.75,
    }),
  );

  const filmRoutes: MetadataRoute.Sitemap = latestFilms.map((entry) => ({
    url: toAbsoluteUrl(`/phim/${entry.slug}`),
    lastModified: entry.updatedAt,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...paginatedBrowseRoutes, ...filmRoutes];
}
