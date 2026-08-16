import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { MovieCardApi } from "@/components/movie-card-api";
import { LoginWall } from "@/components/login-wall";
import { PageFallback } from "@/components/page-fallback";
import { PaginationControls } from "@/components/pagination-controls";
import { RemoveBookmarkButton } from "@/components/remove-bookmark-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toPositiveInt } from "@/lib/pagination";
import { formatShortDate } from "@/lib/date-time";
import { getBookmarksPageForUser } from "@/lib/actions/bookmark.actions";
import { getSessionUser } from "@/lib/server/session";
import { withSiteSuffix } from "@/lib/seo";
import { redirect } from "next/navigation";

const ITEMS_PER_PAGE = 24;

export const metadata: Metadata = {
  title: "Theo dõi",
  description: "Quản lí danh sách phim yêu thích của bạn tại VuaPhim",
  alternates: { canonical: "/bookmarks" },
  robots: { index: false, follow: false },
  openGraph: {
    title: withSiteSuffix("Theo dõi"),
    description: "Quản lí danh sách phim yêu thích của bạn tại VuaPhim",
    url: "/bookmarks",
  },
};

interface BookmarksPageProps {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    historyPage?: string;
  }>;
}

const buildPageHref = (page: number) =>
  page > 1 ? `/bookmarks?page=${page}` : "/bookmarks";

export default function BookmarksPage({
  searchParams,
}: BookmarksPageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <BookmarksPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BookmarksPageContent({
  searchParams,
}: BookmarksPageProps) {
  const params = await searchParams;

  if (params.tab === "history") {
    const historyPage = toPositiveInt(params.historyPage || params.page, 1);
    redirect(historyPage > 1 ? `/history?page=${historyPage}` : "/history");
  }

  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return (
      <LoginWall
        icon={Bookmark}
        description="Vui lòng đăng nhập để xem danh sách theo dõi của bạn"
        callbackUrl="/bookmarks"
      />
    );
  }

  const requestedPage = toPositiveInt(params.page, 1);
  const bookmarkResult = await getBookmarksPageForUser(sessionUser.id, {
    page: requestedPage,
    pageSize: ITEMS_PER_PAGE,
  });
  const bookmarkedMovies = bookmarkResult.items;
  const currentPage = bookmarkResult.page;
  const totalItems = bookmarkResult.totalItems;
  const totalPages = bookmarkResult.totalPages;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Theo dõi</h1>
          </div>
          <p className="text-muted-foreground">
            Danh sách phim bạn đang theo dõi
          </p>
        </div>

        {totalItems > 0 ? (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <Badge className="bg-accent text-accent-foreground">
                {totalItems} đã lưu
              </Badge>
              <p className="text-sm text-muted-foreground">
                Trang {currentPage} trên {totalPages}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
              {bookmarkedMovies.map((movie) => (
                <div key={movie.slug}>
                  <MovieCardApi movie={movie} />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      Bắt đầu theo dõi từ {formatShortDate(movie.bookmarkedAt)}
                    </p>
                    <RemoveBookmarkButton
                      slug={movie.slug}
                      movieName={movie.name}
                    />
                  </div>
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
            <Bookmark className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold text-foreground">
              Bạn chưa theo dõi bộ phim nào
            </h3>
            <p className="mb-4 text-muted-foreground">
              Hãy theo dõi phim để hiển thị danh sách
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
