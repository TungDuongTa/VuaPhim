"use client";

import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HomeMovieCarousel } from "@/components/home-movie-carousel";
import { MovieCardApi } from "@/components/movie-card-api";
import { PageFallback } from "@/components/page-fallback";
import { Button } from "@/components/ui/button";
import { buildBrowseHref } from "@/lib/browse-params";
import {
  HOME_CAROUSEL_COUNT,
  HOME_CAROUSEL_SECTIONS,
  HOME_LATEST_COUNT,
} from "@/lib/home-config";
import { fetchBrowseMovies, fetchLatestMovies } from "@/lib/nguonc/api";
import { resetWindowScroll } from "@/lib/reset-window-scroll";
import type { MovieCard } from "@/types/movie-types";

type CarouselSection = {
  title: string;
  href: string;
  movies: MovieCard[];
};

type HomeCatalogProps = {
  initialLatest: MovieCard[];
  initialSections: CarouselSection[];
  sidebar: ReactNode;
};

export function HomeCatalog({
  initialLatest,
  initialSections,
  sidebar,
}: HomeCatalogProps) {
  const hasServerData =
    initialLatest.length > 0 || initialSections.some((section) => section.movies.length > 0);
  const [latestMovies, setLatestMovies] = useState(initialLatest);
  const [carouselSections, setCarouselSections] = useState(initialSections);
  const [loading, setLoading] = useState(!hasServerData);

  useEffect(() => {
    if (hasServerData) return;

    let cancelled = false;

    const load = async () => {
      try {
        const [latestData, ...sectionResults] = await Promise.all([
          fetchLatestMovies(1),
          ...HOME_CAROUSEL_SECTIONS.map((section) =>
            fetchBrowseMovies({ type: section.type, page: 1 }),
          ),
        ]);

        if (cancelled) return;

        setLatestMovies((latestData?.items ?? []).slice(0, HOME_LATEST_COUNT));
        setCarouselSections(
          HOME_CAROUSEL_SECTIONS.map((section, index) => ({
            title: section.title,
            href: buildBrowseHref({ type: section.hrefType }),
            movies: (sectionResults[index]?.items ?? []).slice(0, HOME_CAROUSEL_COUNT),
          })).filter((section) => section.movies.length > 0),
        );
      } catch (error) {
        console.error("Failed to load home catalog:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [hasServerData]);

  useLayoutEffect(() => {
    if (!loading) resetWindowScroll();
  }, [loading]);

  if (loading) {
    return (
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PageFallback className="min-h-[40vh]" />
        </div>
        {sidebar}
      </section>
    );
  }

  return (
    <>
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
            <h2 className="text-2xl font-bold text-foreground">Mới cập nhật</h2>
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
        {sidebar}
      </section>
    </>
  );
}
