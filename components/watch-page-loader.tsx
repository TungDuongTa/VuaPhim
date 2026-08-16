"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageFallback } from "@/components/page-fallback";
import { WatchPlayerClient } from "@/components/watch-player-client";
import { Button } from "@/components/ui/button";
import { fetchMovieDetail } from "@/lib/nguonc/api";
import { findEpisodeSource, getUniqueEpisodes } from "@/lib/player";
import { toAbsoluteUrl } from "@/lib/seo";
import type { MovieDetail } from "@/types/movie-types";

type WatchPageLoaderProps = {
  slug: string;
  episode: string;
  initialMovie: MovieDetail | null;
  initialBookmarked: boolean;
  lastEpisodeSlug: string | null;
  positionSeconds: number;
};

export function WatchPageLoader({
  slug,
  episode,
  initialMovie,
  initialBookmarked,
  lastEpisodeSlug,
  positionSeconds,
}: WatchPageLoaderProps) {
  const [movie, setMovie] = useState(initialMovie);
  const [loading, setLoading] = useState(!initialMovie);
  const [missingMovie, setMissingMovie] = useState(false);

  useEffect(() => {
    if (initialMovie) return;

    let cancelled = false;

    const load = async () => {
      try {
        const detail = await fetchMovieDetail(slug);
        if (cancelled) return;
        if (!detail) {
          setMissingMovie(true);
          return;
        }
        setMovie(detail);
      } catch (error) {
        console.error("Failed to load watch page:", error);
        if (!cancelled) setMissingMovie(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [initialMovie, slug]);

  if (loading) {
    return <PageFallback className="min-h-screen" />;
  }

  if (!movie || missingMovie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-bold text-foreground">
          Không tìm thấy phim
        </h1>
        <Link href="/">
          <Button>Quay lại</Button>
        </Link>
      </div>
    );
  }

  const source = findEpisodeSource(movie.episodes || [], episode);
  if (!source) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="mb-4 text-2xl font-bold text-foreground">
          Không tìm thấy tập phim
        </h1>
        <Link href={`/phim/${movie.slug || slug}`}>
          <Button>Quay lại trang phim</Button>
        </Link>
      </div>
    );
  }

  const unique = getUniqueEpisodes(movie.episodes || []);
  const movieUrl = toAbsoluteUrl(`/phim/${movie.slug}`);
  const episodeUrl = toAbsoluteUrl(`/phim/${movie.slug}/tap/${episode}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVEpisode",
    name: `${movie.name} ${source.name}`,
    url: episodeUrl,
    episodeNumber: unique.findIndex((item) => item.slug === source.slug) + 1,
    partOfSeries: {
      "@type": "TVSeries",
      name: movie.name,
      url: movieUrl,
    },
    image: movie.thumb_url?.trim() || undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WatchPlayerClient
        movie={movie}
        episodeSlug={source.slug}
        initialBookmarked={initialBookmarked}
        initialPositionSeconds={
          lastEpisodeSlug === source.slug ? positionSeconds : 0
        }
      />
    </>
  );
}
