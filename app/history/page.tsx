import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { MovieCardApi } from "@/components/movie-card-api";
import { LoginWall } from "@/components/login-wall";
import { PageFallback } from "@/components/page-fallback";
import { PaginationControls } from "@/components/pagination-controls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toPositiveInt } from "@/lib/pagination";
import { formatShortDate } from "@/lib/date-time";
import { getWatchHistoryPageForUser } from "@/lib/actions/watch-progress.actions";
import { getSessionUser } from "@/lib/server/session";
import { withSiteSuffix } from "@/lib/seo";
import { episodeHref } from "@/lib/player";

const ITEMS_PER_PAGE = 24;

export const metadata: Metadata = {
  title: "Lịch sử",
  description: "Xem lại những bộ phim bạn đã xem gần đây tại VuaPhim",
  alternates: { canonical: "/history" },
  robots: { index: false, follow: false },
  openGraph: {
    title: withSiteSuffix("Lịch sử"),
    description: "Xem lại những bộ phim bạn đã xem gần đây tại VuaPhim",
    url: "/history",
  },
};

interface HistoryPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

const buildPageHref = (page: number) =>
  page > 1 ? `/history?page=${page}` : "/history";

export default function HistoryPage({ searchParams }: HistoryPageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <HistoryPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function HistoryPageContent({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return (
      <LoginWall
        icon={Clock3}
        description="Vui lòng đăng nhập để xem lịch sử xem phim của bạn"
        callbackUrl="/history"
      />
    );
  }

  const requestedPage = toPositiveInt(params.page, 1);
  const historyResult = await getWatchHistoryPageForUser(sessionUser.id, {
    page: requestedPage,
    pageSize: ITEMS_PER_PAGE,
  });
  const watchHistory = historyResult.items;
  const currentPage = historyResult.page;
  const totalItems = historyResult.totalItems;
  const totalPages = historyResult.totalPages;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Clock3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Lịch sử</h1>
          </div>
          <p className="text-muted-foreground">
            Những bộ phim bạn đã xem gần đây
          </p>
        </div>

        {totalItems > 0 ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <Badge className="bg-accent text-accent-foreground">
                {totalItems} phim đã xem
              </Badge>
              <p className="text-sm text-muted-foreground">
                Trang {currentPage} trên {totalPages}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
              {watchHistory.map((movie) => (
                <div key={movie.slug}>
                  <MovieCardApi movie={movie} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Xem lần cuối vào {formatShortDate(movie.latestWatchedAt)}
                    {movie.episodeName ? ` · ${movie.episodeName}` : ""}
                  </p>
                  {movie.episodeSlug ? (
                    <Link
                      href={episodeHref(movie.slug, movie.episodeSlug)}
                      className="text-xs text-primary hover:underline"
                    >
                      Xem tiếp
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              getPageHref={buildPageHref}
            />
          </>
        ) : (
          <div className="rounded-xl border border-border bg-card py-16 text-center">
            <Clock3 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              Chưa có lịch sử xem phim nào
            </h3>
            <p className="mb-4 text-muted-foreground">
              Hãy thưởng thức một vài bộ phim
            </p>
            <Link href="/browse">
              <Button>Khám phá phim mới</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
