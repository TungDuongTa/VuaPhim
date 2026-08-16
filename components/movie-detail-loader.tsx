"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { MovieDetailPageClient } from "@/components/movie-detail-page-client";
import { PageFallback } from "@/components/page-fallback";
import { Button } from "@/components/ui/button";
import { fetchMovieDetail } from "@/lib/nguonc/api";
import { resetWindowScroll } from "@/lib/reset-window-scroll";
import { stripHtml, toAbsoluteUrl, truncateText } from "@/lib/seo";
import type { MovieDetail } from "@/types/movie-types";

type MovieDetailLoaderProps = {
  slug: string;
  initialMovie: MovieDetail | null;
  initialTotalViews: number;
  initialBookmarked: boolean;
  lastEpisodeSlug: string | null;
};

export function MovieDetailLoader({
  slug,
  initialMovie,
  initialTotalViews,
  initialBookmarked,
  lastEpisodeSlug,
}: MovieDetailLoaderProps) {
  const [movie, setMovie] = useState(initialMovie);
  const [loading, setLoading] = useState(!initialMovie);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (initialMovie) return;

    let cancelled = false;

    const load = async () => {
      try {
        const detail = await fetchMovieDetail(slug);
        if (cancelled) return;
        if (!detail) {
          setMissing(true);
          return;
        }
        setMovie(detail);
      } catch (error) {
        console.error("Failed to load movie detail:", error);
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [initialMovie, slug]);

  useLayoutEffect(() => {
    if (!loading) resetWindowScroll();
  }, [loading]);

  if (loading) {
    return <PageFallback className="min-h-[60vh]" />;
  }

  if (!movie || missing) {
    return (
      <div className="min-h-screen">
        <main className="flex min-h-[60vh] flex-col items-center justify-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">
            Không tìm thấy phim
          </h1>
          <Link href="/">
            <Button>Quay về trang chủ</Button>
          </Link>
        </main>
      </div>
    );
  }

  const movieUrl = toAbsoluteUrl(`/phim/${movie.slug}`);
  const description = truncateText(
    stripHtml(movie.description || "") ||
      `Xem phim ${movie.name} mới nhất được cập nhật tại VuaPhim`,
    300,
  );
  const movieJsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.name,
    alternateName: (movie.origin_name || []).filter(Boolean),
    url: movieUrl,
    description,
    image: movie.thumb_url?.trim() || undefined,
    inLanguage: "vi",
    genre: (movie.category || []).map((item) => item.name).filter(Boolean),
    director: (movie.director || []).filter(Boolean).map((name) => ({
      "@type": "Person",
      name,
    })),
    datePublished: movie.year || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieJsonLd) }}
      />
      <MovieDetailPageClient
        slug={slug}
        movie={movie}
        initialTotalViews={initialTotalViews}
        initialBookmarked={initialBookmarked}
        lastEpisodeSlug={lastEpisodeSlug}
      />
    </>
  );
}
