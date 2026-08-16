import { connectToDatabase } from "@/database/mongoose";
import { MovieViewModel } from "@/database/models/movie-view.model";
import { MovieViewStatModel } from "@/database/models/movie-view-stat.model";
import type { MovieCard } from "@/types/movie-types";

export type MovieRankingPeriod = "daily" | "weekly" | "monthly" | "allTime";

export type MovieRankingItem = MovieCard & {
  periodViews: number;
  totalViews: number;
  latestEpisodeName?: string | null;
};

export type MovieRankings = {
  daily: MovieRankingItem[];
  weekly: MovieRankingItem[];
  monthly: MovieRankingItem[];
  allTime: MovieRankingItem[];
};

type PeriodRankingRow = {
  _id: string;
  periodViews: number;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_WINDOW_DAYS = 7;
const MONTH_WINDOW_DAYS = 30;
const DEFAULT_RANKING_LIMIT = 10;
const MAX_RANKING_LIMIT = 120;

const getUtcDayStart = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const addUtcDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * ONE_DAY_MS);

const toRankingItem = (doc: any, periodViews: number): MovieRankingItem => {
  const slug = String(doc.movieSlug);
  const latestEpisodeName = String(doc.latestEpisodeName || "").trim();

  return {
    _id: slug,
    name: doc.movieName || slug,
    slug,
    origin_name: [],
    thumb_url: doc.thumbUrl || "",
    poster_url: doc.thumbUrl || "",
    quality: "",
    language: "",
    current_episode: latestEpisodeName,
    total_episodes: "",
    type: "",
    year: "",
    category: [],
    updatedAt:
      doc.movieUpdatedAt ||
      new Date(doc.updatedAt || doc.createdAt).toISOString(),
    latestEpisodeName: latestEpisodeName || null,
    totalViews: Number(doc.totalViews || 0),
    periodViews: Number(periodViews || 0),
  };
};

const toPeriodRows = (rows: any[] = []): PeriodRankingRow[] =>
  rows
    .map((row) => ({
      _id: String(row?._id || "").trim(),
      periodViews: Number(row?.periodViews || 0),
    }))
    .filter((row) => Boolean(row._id) && row.periodViews > 0);

const getWindowRankings = async (limit: number) => {
  const todayStart = getUtcDayStart(new Date());
  const weeklyStart = addUtcDays(todayStart, -(WEEK_WINDOW_DAYS - 1));
  const monthlyStart = addUtcDays(todayStart, -(MONTH_WINDOW_DAYS - 1));

  const [result] = await MovieViewModel.aggregate([
    { $match: { dayBucket: { $gte: monthlyStart } } },
    {
      $group: {
        _id: "$movieSlug",
        dailyViews: {
          $sum: {
            $cond: [{ $gte: ["$dayBucket", todayStart] }, "$views", 0],
          },
        },
        weeklyViews: {
          $sum: {
            $cond: [{ $gte: ["$dayBucket", weeklyStart] }, "$views", 0],
          },
        },
        monthlyViews: { $sum: "$views" },
        lastViewedAt: { $max: "$lastViewedAt" },
      },
    },
    {
      $facet: {
        daily: [
          { $match: { dailyViews: { $gt: 0 } } },
          { $sort: { dailyViews: -1, lastViewedAt: -1 } },
          { $limit: limit },
          { $project: { _id: 1, periodViews: "$dailyViews" } },
        ],
        weekly: [
          { $match: { weeklyViews: { $gt: 0 } } },
          { $sort: { weeklyViews: -1, lastViewedAt: -1 } },
          { $limit: limit },
          { $project: { _id: 1, periodViews: "$weeklyViews" } },
        ],
        monthly: [
          { $match: { monthlyViews: { $gt: 0 } } },
          { $sort: { monthlyViews: -1, lastViewedAt: -1 } },
          { $limit: limit },
          { $project: { _id: 1, periodViews: "$monthlyViews" } },
        ],
      },
    },
  ]);

  return {
    daily: toPeriodRows(result?.daily),
    weekly: toPeriodRows(result?.weekly),
    monthly: toPeriodRows(result?.monthly),
  };
};

const buildPeriodRanking = (
  rows: PeriodRankingRow[],
  statMap: Map<string, any>,
): MovieRankingItem[] =>
  rows
    .map((row) => {
      const stat = statMap.get(row._id);
      if (!stat) return null;
      return toRankingItem(stat, row.periodViews);
    })
    .filter((item): item is MovieRankingItem => Boolean(item));

export async function fetchMovieRankings(
  limit: number = DEFAULT_RANKING_LIMIT,
): Promise<MovieRankings> {
  const safeLimit = Number.isFinite(limit)
    ? Math.max(1, Math.min(MAX_RANKING_LIMIT, Math.floor(limit)))
    : DEFAULT_RANKING_LIMIT;

  try {
    await connectToDatabase();

    const [windowRankings, allTimeRows] = await Promise.all([
      getWindowRankings(safeLimit),
      MovieViewStatModel.find({ totalViews: { $gt: 0 } })
        .sort({ totalViews: -1, lastViewedAt: -1 })
        .limit(safeLimit)
        .lean(),
    ]);

    const periodSlugs = Array.from(
      new Set(
        [
          ...windowRankings.daily,
          ...windowRankings.weekly,
          ...windowRankings.monthly,
        ].map((row) => row._id),
      ),
    );

    const statDocs =
      periodSlugs.length > 0
        ? await MovieViewStatModel.find({
            movieSlug: { $in: periodSlugs },
          }).lean()
        : [];
    const statMap = new Map<string, any>(
      statDocs.map((doc: any) => [String(doc.movieSlug), doc]),
    );

    return {
      daily: buildPeriodRanking(windowRankings.daily, statMap),
      weekly: buildPeriodRanking(windowRankings.weekly, statMap),
      monthly: buildPeriodRanking(windowRankings.monthly, statMap),
      allTime: allTimeRows.map((row: any) =>
        toRankingItem(row, Number(row.totalViews || 0)),
      ),
    };
  } catch (error) {
    console.error("Failed to load movie rankings:", error);
    return { daily: [], weekly: [], monthly: [], allTime: [] };
  }
}
