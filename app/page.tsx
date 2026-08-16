import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeCatalog } from "@/components/home-catalog";
import { HomeSidebar, HomeSidebarSkeleton } from "@/components/home-sidebar";
import { getBrowseMovies, getLatestMovies } from "@/lib/actions/movie.actions";
import { buildBrowseHref } from "@/lib/browse-params";
import {
  HOME_CAROUSEL_COUNT,
  HOME_CAROUSEL_SECTIONS,
  HOME_LATEST_COUNT,
} from "@/lib/home-config";
import { canFetchNguoncOnServer } from "@/lib/nguonc/server-access";
import {
  SITE_ALTERNATE_NAME,
  SITE_DESCRIPTION,
  SITE_NAME,
  toAbsoluteUrl,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "VuaPhim - Vua Phim xem phim bộ, phim lẻ và TV shows online",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const serverFetch = canFetchNguoncOnServer();
  const [latestData, ...sectionResults] = await Promise.all([
    serverFetch ? getLatestMovies(1) : Promise.resolve(null),
    ...HOME_CAROUSEL_SECTIONS.map((section) =>
      serverFetch
        ? getBrowseMovies({ type: section.type, page: 1 })
        : Promise.resolve(null),
    ),
  ]);

  const latestMovies = (latestData?.items ?? []).slice(0, HOME_LATEST_COUNT);
  const carouselSections = HOME_CAROUSEL_SECTIONS.map((section, index) => ({
    title: section.title,
    href: buildBrowseHref({ type: section.hrefType }),
    movies: (sectionResults[index]?.items ?? []).slice(0, HOME_CAROUSEL_COUNT),
  })).filter((section) => section.movies.length > 0);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [
      "VuaPhim",
      "vuaphim",
      SITE_ALTERNATE_NAME,
      "Vua Phim",
      "vua phim",
    ],
    url: toAbsoluteUrl("/"),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${toAbsoluteUrl("/browse")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <HomeCatalog
          initialLatest={latestMovies}
          initialSections={carouselSections}
          sidebar={
            <Suspense fallback={<HomeSidebarSkeleton />}>
              <HomeSidebar />
            </Suspense>
          }
        />
      </main>
    </div>
  );
}
