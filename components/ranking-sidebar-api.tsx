"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Eye, Flame, Trophy, TrendingUp } from "lucide-react";
import type {
  MovieRankingItem,
  MovieRankingPeriod,
  MovieRankings,
} from "@/lib/server/movie-rankings";
import { formatViewCount } from "@/lib/format";
import {
  FALLBACK_MOVIE_POSTER,
  MoviePosterImage,
} from "@/components/movie-poster-image";

export function RankingSidebarApi({
  initialRankings,
}: {
  initialRankings: MovieRankings;
}) {
  const [activeTab, setActiveTab] = useState<MovieRankingPeriod>("daily");
  const ranked: MovieRankingItem[] = initialRankings[activeTab] || [];
  const tabs: Array<{ key: MovieRankingPeriod; label: string; Icon: typeof Flame }> = [
    { key: "daily", label: "Ngày", Icon: Flame },
    { key: "weekly", label: "Tuần", Icon: TrendingUp },
    { key: "monthly", label: "Tháng", Icon: Clock },
    { key: "allTime", label: "Tất cả", Icon: Trophy },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-chart-3" />
        <h3 className="text-lg font-semibold text-foreground">Top phim đề cử</h3>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-secondary/50 p-1">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs transition-colors ${
              activeTab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {ranked.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Chưa có dữ liệu lượt xem.
          </div>
        ) : (
          ranked.map((movie, index) => (
            <Link
              key={`${activeTab}-${movie._id}`}
              href={`/phim/${movie.slug}`}
              className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-secondary"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  index === 0
                    ? "bg-chart-3 text-background"
                    : index === 1
                      ? "bg-gray-400 text-background"
                      : index === 2
                        ? "bg-amber-700 text-background"
                        : "bg-secondary text-muted-foreground"
                }`}
              >
                {index + 1}
              </div>
              <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                <MoviePosterImage
                  src={movie.thumb_url || FALLBACK_MOVIE_POSTER}
                  alt={movie.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-1 text-sm font-medium text-foreground group-hover:text-primary">
                  {movie.name}
                </h4>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{movie.current_episode || "—"}</span>
                  <span className="inline-flex shrink-0 items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {formatViewCount(
                      activeTab === "allTime"
                        ? movie.totalViews || 0
                        : movie.periodViews || 0,
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
