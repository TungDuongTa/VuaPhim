import { cache, Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageFallback } from "@/components/page-fallback";
import { WatchPlayerClient } from "@/components/watch-player-client";
import { getMovieDetail } from "@/lib/actions/movie.actions";
import { getMoviePersonalState } from "@/lib/actions/watch-progress.actions";
import { findEpisodeSource, getUniqueEpisodes } from "@/lib/player";
import { toAbsoluteUrl, withSiteSuffix } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WatchPageProps = {
  params: Promise<{ slug: string; episode: string }>;
};

const getMovieDetailCached = cache(async (slug: string) =>
  getMovieDetail(slug),
);

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { slug, episode } = await params;
  const movie = await getMovieDetailCached(slug);
  const movieSlug = movie?.slug || slug;
  const canonicalPath = `/phim/${movieSlug}/tap/${episode}`;

  if (!movie) {
    return {
      title: `Không tìm thấy tập ${episode}`,
      description: "Không tìm thấy tập phim bạn yêu cầu",
      alternates: { canonical: canonicalPath },
      robots: { index: false, follow: true },
    };
  }

  const source = findEpisodeSource(movie.episodes || [], episode);
  const episodeLabel = source?.name || decodeURIComponent(episode);
  const title = `${movie.name} ${episodeLabel}`;
  const description = `Xem ${movie.name} ${episodeLabel} tại VuaPhim.`;
  const coverImage = movie.thumb_url?.trim() ? movie.thumb_url : "";

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: withSiteSuffix(title),
      description,
      type: "video.episode",
      url: canonicalPath,
      images: coverImage
        ? [{ url: coverImage, alt: `${movie.name} ${episodeLabel}` }]
        : undefined,
    },
    twitter: {
      title: withSiteSuffix(title),
      description,
      images: coverImage ? [coverImage] : undefined,
    },
  };
}

export default function WatchPage({ params }: WatchPageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <WatchPageContent params={params} />
    </Suspense>
  );
}

async function WatchPageContent({ params }: WatchPageProps) {
  const { slug, episode } = await params;
  const movie = await getMovieDetailCached(slug);

  if (!movie) {
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

  const personalState = await getMoviePersonalState(movie.slug || slug);
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
        initialBookmarked={personalState.bookmarked}
        initialPositionSeconds={
          personalState.lastEpisodeSlug === source.slug
            ? personalState.positionSeconds
            : 0
        }
      />
    </>
  );
}
