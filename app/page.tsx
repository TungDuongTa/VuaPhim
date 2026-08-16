import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HomeMovieCarousel } from "@/components/home-movie-carousel";
import { HomeSidebar, HomeSidebarSkeleton } from "@/components/home-sidebar";
import { MovieCardApi } from "@/components/movie-card-api";
import { Button } from "@/components/ui/button";
import { getBrowseMovies, getLatestMovies } from "@/lib/actions/movie.actions";
import { buildBrowseHref } from "@/lib/browse-params";
import {
  HOME_CAROUSEL_COUNT,
  HOME_CAROUSEL_SECTIONS,
  HOME_LATEST_COUNT,
} from "@/lib/home-config";
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
  const [latestData, ...sectionResults] = await Promise.all([
    getLatestMovies(1),
    ...HOME_CAROUSEL_SECTIONS.map((section) =>
      getBrowseMovies({ type: section.type, page: 1 }),
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
        {carouselSections.length > 0 ? (
          <div className="mb-12 space-y-8 md:space-y-10">
            {carouselSections.map((section) => (
              <HomeMovieCarousel
                key={section.href}
                title={section.title}
                href={section.href}
                movies={section.movies}
              />
            ))}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">
                Mới cập nhật
              </h2>
              <Link
                href="/browse"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
              {latestMovies.map((movie) => (
                <MovieCardApi key={movie.slug} movie={movie} />
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link href={buildBrowseHref({ page: 2 })}>
                <Button variant="outline" className="gap-2">
                  Xem thêm
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <Suspense fallback={<HomeSidebarSkeleton />}>
            <HomeSidebar />
          </Suspense>
        </section>
      </main>
    </div>
  );
}
