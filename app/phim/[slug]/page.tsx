import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MovieDetailPageClient } from "@/components/movie-detail-page-client";
import { PageFallback } from "@/components/page-fallback";
import { getMovieDetail } from "@/lib/actions/movie.actions";
import { getMovieViewStats } from "@/lib/actions/movie-view.actions";
import { getMoviePersonalState } from "@/lib/actions/watch-progress.actions";
import {
  stripHtml,
  toAbsoluteUrl,
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
  const movie = await getMovieDetail(slug);
  const canonicalPath = `/phim/${movie?.slug || slug}`;

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
    alternates: { canonical: canonicalPath },
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
    getMovieDetail(slug),
    getMoviePersonalState(slug),
    getMovieViewStats(slug),
  ]);

  const movie = detailResult.status === "fulfilled" ? detailResult.value : null;

  if (!movie) {
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

  const personalState =
    personalResult.status === "fulfilled"
      ? personalResult.value
      : { bookmarked: false, lastEpisodeSlug: null };
  const viewStats =
    viewResult.status === "fulfilled" ? viewResult.value : { totalViews: 0 };
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
        initialTotalViews={viewStats.totalViews || 0}
        initialBookmarked={personalState.bookmarked}
        lastEpisodeSlug={personalState.lastEpisodeSlug}
      />
    </>
  );
}
