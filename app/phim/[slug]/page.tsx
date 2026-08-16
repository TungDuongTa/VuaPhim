import { Suspense } from "react";
import type { Metadata } from "next";
import { MovieDetailLoader } from "@/components/movie-detail-loader";
import { PageFallback } from "@/components/page-fallback";
import { getMovieDetail } from "@/lib/actions/movie.actions";
import { getMovieViewStats } from "@/lib/actions/movie-view.actions";
import { getMoviePersonalState } from "@/lib/actions/watch-progress.actions";
import { canFetchNguoncOnServer } from "@/lib/nguonc/server-access";
import {
  stripHtml,
  truncateText,
  withSiteSuffix,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type MovieDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: MovieDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const canonicalPath = `/phim/${slug}`;

  if (!canFetchNguoncOnServer()) {
    return {
      title: "Chi tiết phim",
      description: "Xem phim mới nhất được cập nhật tại VuaPhim",
      alternates: { canonical: canonicalPath },
    };
  }

  const movie = await getMovieDetail(slug);

  if (!movie) {
    return {
      title: "Không tìm thấy phim",
      description: "Không tìm thấy phim",
      alternates: { canonical: canonicalPath },
      robots: { index: false, follow: true },
    };
  }

  const fallbackDescription = `Xem phim ${movie.name} mới nhất được cập nhật tại VuaPhim`;
  const description = truncateText(
    stripHtml(movie.description || "") || fallbackDescription,
    160,
  );
  const title = `Phim ${movie.name}`;
  const coverImage = movie.thumb_url?.trim() ? movie.thumb_url : "";

  return {
    title,
    description,
    alternates: { canonical: `/phim/${movie.slug || slug}` },
    openGraph: {
      title: withSiteSuffix(title),
      description,
      type: "video.movie",
      url: canonicalPath,
      images: coverImage ? [{ url: coverImage, alt: movie.name }] : undefined,
    },
    twitter: {
      title: withSiteSuffix(title),
      description,
      images: coverImage ? [coverImage] : undefined,
    },
  };
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <MovieDetailContent params={params} />
    </Suspense>
  );
}

async function MovieDetailContent({ params }: MovieDetailPageProps) {
  const { slug } = await params;
  const [detailResult, personalResult, viewResult] = await Promise.allSettled([
    canFetchNguoncOnServer()
      ? getMovieDetail(slug)
      : Promise.resolve(null),
    getMoviePersonalState(slug),
    getMovieViewStats(slug),
  ]);

  const movie = detailResult.status === "fulfilled" ? detailResult.value : null;
  const personalState =
    personalResult.status === "fulfilled"
      ? personalResult.value
      : { bookmarked: false, lastEpisodeSlug: null };
  const viewStats =
    viewResult.status === "fulfilled" ? viewResult.value : { totalViews: 0 };

  return (
    <MovieDetailLoader
      slug={slug}
      initialMovie={movie}
      initialTotalViews={viewStats.totalViews || 0}
      initialBookmarked={personalState.bookmarked}
      lastEpisodeSlug={personalState.lastEpisodeSlug}
    />
  );
}
