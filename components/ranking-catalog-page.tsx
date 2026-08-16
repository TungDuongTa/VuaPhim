import Link from "next/link";
import { Eye, Trophy } from "lucide-react";
import { MovieCardApi } from "@/components/movie-card-api";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getCachedMovieRankings } from "@/lib/server/movie-cache";
import type { MovieRankingPeriod } from "@/lib/server/movie-rankings";
import { getVisiblePages, toPositiveInt } from "@/lib/pagination";
import { formatViewCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  RANKING_ITEMS_PER_PAGE,
  RANKING_MAX_ITEMS,
  RANKING_TABS,
  buildRankingHref,
} from "@/lib/ranking-params";

export async function RankingCatalogPage({
  tab,
  requestedPage,
}: {
  tab: MovieRankingPeriod;
  requestedPage: number;
}) {
  const rankings = await getCachedMovieRankings(RANKING_MAX_ITEMS);
  const ranked = rankings[tab].slice(0, RANKING_MAX_ITEMS);
  const totalPages = Math.max(1, Math.ceil(ranked.length / RANKING_ITEMS_PER_PAGE));
  const currentPage = Math.min(Math.max(1, toPositiveInt(requestedPage, 1)), totalPages);
  const startIndex = (currentPage - 1) * RANKING_ITEMS_PER_PAGE;
  const pageMovies = ranked.slice(startIndex, startIndex + RANKING_ITEMS_PER_PAGE);
  const visiblePages = getVisiblePages(currentPage, totalPages, 7);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <section className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-chart-3" />
            <h1 className="text-3xl font-bold text-foreground">Bảng xếp hạng</h1>
          </div>
          <p className="text-muted-foreground">
            Những bộ phim được xem nhiều nhất tại VuaPhim.
          </p>
        </section>
        <section className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card/70 p-2">
          {RANKING_TABS.map(({ key, label, Icon }) => (
            <Link
              key={key}
              href={buildRankingHref(key, 1)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </section>
        {ranked.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
            Chưa có dữ liệu cho mốc thời gian này.
          </div>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-6">
              {pageMovies.map((movie, index) => (
                <article key={`${tab}-${movie._id}-${startIndex + index}`}>
                  <MovieCardApi movie={movie} showLatestEpisode={false} />
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <p className="truncate">{movie.current_episode || "—"}</p>
                    <p className="inline-flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {formatViewCount(
                        tab === "allTime"
                          ? movie.totalViews || 0
                          : movie.periodViews || 0,
                      )}
                    </p>
                  </div>
                </article>
              ))}
            </section>
            {totalPages > 1 && (
              <section className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href={buildRankingHref(tab, Math.max(1, currentPage - 1))} />
                    </PaginationItem>
                    {visiblePages[0] > 1 && (
                      <PaginationItem>
                        <PaginationLink href={buildRankingHref(tab, 1)}>1</PaginationLink>
                      </PaginationItem>
                    )}
                    {visiblePages[0] > 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    {visiblePages.map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink href={buildRankingHref(tab, page)} isActive={page === currentPage}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    {visiblePages[visiblePages.length - 1] < totalPages && (
                      <PaginationItem>
                        <PaginationLink href={buildRankingHref(tab, totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationNext href={buildRankingHref(tab, Math.min(totalPages, currentPage + 1))} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
