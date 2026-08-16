"use server";

import { connectToDatabase } from "@/database/mongoose";
import { WatchProgressModel } from "@/database/models/watch-progress.model";
import { BookmarkModel } from "@/database/models/bookmark.model";
import { trackMovieView } from "@/lib/actions/movie-view.actions";
import {
  getUserWatchExpStats,
  incrementUserWatchStats,
} from "@/lib/server/user-level";
import { getCurrentUserId } from "@/lib/server/session";
import { toWatchExpStats } from "@/lib/user-level";
import { normalizePageAndSize } from "@/lib/pagination";
import type { MovieCard } from "@/types/movie-types";

export type WatchHistoryItem = MovieCard & {
  latestWatchedAt: string;
  episodeSlug: string;
  episodeName: string;
  positionSeconds: number;
  durationSeconds: number;
};

export type PaginatedWatchHistoryResult = {
  items: WatchHistoryItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type MoviePersonalState = {
  bookmarked: boolean;
  lastEpisodeSlug: string | null;
  lastEpisodeName: string | null;
  positionSeconds: number;
};

const COMPLETE_RATIO = 0.9;
const DEFAULT_PAGE_SIZE = 24;

export const getMoviePersonalState = async (
  slug: string,
): Promise<MoviePersonalState> => {
  const userId = await getCurrentUserId();
  const empty: MoviePersonalState = {
    bookmarked: false,
    lastEpisodeSlug: null,
    lastEpisodeName: null,
    positionSeconds: 0,
  };
  if (!userId) return empty;

  await connectToDatabase();
  const [bookmark, progress] = await Promise.all([
    BookmarkModel.findOne({ userId, slug }).select("_id").lean(),
    WatchProgressModel.findOne({ userId, movieSlug: slug }).lean(),
  ]);

  return {
    bookmarked: Boolean(bookmark),
    lastEpisodeSlug: progress?.episodeSlug || null,
    lastEpisodeName: progress?.episodeName || null,
    positionSeconds: Number(progress?.positionSeconds || 0),
  };
};

export const saveWatchProgress = async (input: {
  movieSlug: string;
  movieName?: string;
  thumbUrl?: string;
  episodeSlug: string;
  episodeName?: string;
  positionSeconds: number;
  durationSeconds: number;
}): Promise<{ success: boolean }> => {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false };

  const movieSlug = input.movieSlug.trim();
  const episodeSlug = input.episodeSlug.trim();
  if (!movieSlug || !episodeSlug) return { success: false };

  const positionSeconds = Math.max(0, Math.floor(input.positionSeconds || 0));
  const durationSeconds = Math.max(0, Math.floor(input.durationSeconds || 0));
  const completed =
    durationSeconds > 30 && positionSeconds / durationSeconds >= COMPLETE_RATIO;

  await connectToDatabase();
  const previous = await WatchProgressModel.findOne({
    userId,
    movieSlug,
  }).lean();

  const alreadyCompletedSameEpisode =
    previous?.completed && previous.episodeSlug === episodeSlug;

  await WatchProgressModel.updateOne(
    { userId, movieSlug },
    {
      $set: {
        userId,
        movieSlug,
        movieName: input.movieName || previous?.movieName || "",
        thumbUrl: input.thumbUrl || previous?.thumbUrl || "",
        episodeSlug,
        episodeName: input.episodeName || "",
        positionSeconds,
        durationSeconds,
        completed: completed || alreadyCompletedSameEpisode,
        lastWatchedAt: new Date(),
      },
    },
    { upsert: true },
  );

  if (completed && !alreadyCompletedSameEpisode) {
    await incrementUserWatchStats(userId, 1);
  }

  return { success: true };
};

export const getCurrentUserWatchExpStats = async () => {
  const userId = await getCurrentUserId();
  if (!userId) return toWatchExpStats(0);
  return getUserWatchExpStats(userId);
};

export const recordEpisodeVisit = async (input: {
  movieSlug: string;
  movieName?: string;
  thumbUrl?: string;
  movieUpdatedAt?: string;
  episodeSlug: string;
  episodeName?: string;
  latestEpisodeName?: string;
}): Promise<{ success: boolean }> => {
  await trackMovieView({
    movieSlug: input.movieSlug,
    movieName: input.movieName,
    thumbUrl: input.thumbUrl,
    movieUpdatedAt: input.movieUpdatedAt,
    episodeName: input.episodeName,
    latestEpisodeName: input.latestEpisodeName,
  });

  const userId = await getCurrentUserId();
  if (userId) {
    await saveWatchProgress({
      movieSlug: input.movieSlug,
      movieName: input.movieName,
      thumbUrl: input.thumbUrl,
      episodeSlug: input.episodeSlug,
      episodeName: input.episodeName,
      positionSeconds: 0,
      durationSeconds: 0,
    });
  }

  return { success: true };
};

export const getWatchHistoryPageForUser = async (
  userId: string,
  { page = 1, pageSize = DEFAULT_PAGE_SIZE }: { page?: number; pageSize?: number } = {},
): Promise<PaginatedWatchHistoryResult> => {
  const normalized = normalizePageAndSize(page, pageSize, DEFAULT_PAGE_SIZE, 60);
  if (!userId) {
    return {
      items: [],
      page: normalized.page,
      pageSize: normalized.pageSize,
      totalItems: 0,
      totalPages: 1,
    };
  }

  await connectToDatabase();
  const totalItems = await WatchProgressModel.countDocuments({ userId });
  const totalPages = Math.max(1, Math.ceil(totalItems / normalized.pageSize));
  const safePage = Math.min(normalized.page, totalPages);
  const rows = await WatchProgressModel.find({ userId })
    .sort({ lastWatchedAt: -1 })
    .skip((safePage - 1) * normalized.pageSize)
    .limit(normalized.pageSize)
    .lean();

  return {
    items: rows.map((row) => ({
      _id: String(row.movieSlug),
      name: row.movieName || row.movieSlug,
      slug: row.movieSlug,
      origin_name: [],
      thumb_url: row.thumbUrl || "",
      poster_url: row.thumbUrl || "",
      quality: "",
      language: "",
      current_episode: row.episodeName || "",
      total_episodes: "",
      type: "",
      year: "",
      category: [],
      updatedAt: new Date(row.lastWatchedAt || Date.now()).toISOString(),
      latestWatchedAt: new Date(row.lastWatchedAt || Date.now()).toISOString(),
      episodeSlug: row.episodeSlug || "",
      episodeName: row.episodeName || "",
      positionSeconds: Number(row.positionSeconds || 0),
      durationSeconds: Number(row.durationSeconds || 0),
    })),
    page: safePage,
    pageSize: normalized.pageSize,
    totalItems,
    totalPages,
  };
};
