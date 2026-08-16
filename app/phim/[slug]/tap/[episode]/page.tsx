import { Suspense } from "react";
import type { Metadata } from "next";
import { PageFallback } from "@/components/page-fallback";
import { WatchPageLoader } from "@/components/watch-page-loader";
import { getMovieDetail } from "@/lib/actions/movie.actions";
import { getMoviePersonalState } from "@/lib/actions/watch-progress.actions";
import { canFetchNguoncOnServer } from "@/lib/nguonc/server-access";
import { findEpisodeSource } from "@/lib/player";
import { withSiteSuffix } from "@/lib/seo";

export const dynamic = "force-dynamic";

type WatchPageProps = {
  params: Promise<{ slug: string; episode: string }>;
};

export async function generateMetadata({
  params,
}: WatchPageProps): Promise<Metadata> {
  const { slug, episode } = await params;
  const canonicalPath = `/phim/${slug}/tap/${episode}`;

  if (!canFetchNguoncOnServer()) {
    return {
      title: `Tập ${decodeURIComponent(episode)}`,
      description: "Xem phim trực tuyến tại VuaPhim",
      alternates: { canonical: canonicalPath },
    };
  }

  const movie = await getMovieDetail(slug);
  const movieSlug = movie?.slug || slug;

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
    alternates: { canonical: `/phim/${movieSlug}/tap/${episode}` },
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
  const movie = canFetchNguoncOnServer() ? await getMovieDetail(slug) : null;
  const personalState = await getMoviePersonalState(movie?.slug || slug);

  return (
    <WatchPageLoader
      slug={slug}
      episode={episode}
      initialMovie={movie}
      initialBookmarked={personalState.bookmarked}
      lastEpisodeSlug={personalState.lastEpisodeSlug}
      positionSeconds={personalState.positionSeconds}
    />
  );
}
