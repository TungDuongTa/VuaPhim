"use server";

import { connectToDatabase } from "@/database/mongoose";
import { MovieViewModel } from "@/database/models/movie-view.model";
import { MovieViewStatModel } from "@/database/models/movie-view-stat.model";
import {
  fetchMovieRankings,
  type MovieRankings,
} from "@/lib/server/movie-rankings";

type TrackMovieViewInput = {
  movieSlug: string;
  movieName?: string;
  thumbUrl?: string;
  movieUpdatedAt?: string;
  episodeName?: string;
  latestEpisodeName?: string;
};

const getUtcDayStart = (date: Date): Date =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

export const trackMovieView = async (
  input: TrackMovieViewInput,
): Promise<{ success: boolean }> => {
  const movieSlug = input.movieSlug?.trim();
  if (!movieSlug) return { success: false };

  try {
    await connectToDatabase();
    const now = new Date();
    const dayBucket = getUtcDayStart(now);
    const latestEpisodeName = String(
      input.latestEpisodeName || input.episodeName || "",
    ).trim();
    const metadata = {
      movieSlug,
      movieName: input.movieName || "",
      thumbUrl: input.thumbUrl || "",
      movieUpdatedAt: input.movieUpdatedAt || "",
      ...(latestEpisodeName ? { latestEpisodeName } : {}),
    };

    await Promise.all([
      MovieViewModel.updateOne(
        { movieSlug, dayBucket },
        {
          $set: metadata,
          $inc: { views: 1 },
          $max: { lastViewedAt: now },
        },
        { upsert: true },
      ),
      MovieViewStatModel.updateOne(
        { movieSlug },
        {
          $set: metadata,
          $inc: { totalViews: 1 },
          $max: { lastViewedAt: now },
        },
        { upsert: true },
      ),
    ]);

    return { success: true };
  } catch (error) {
    console.error("Failed to track movie view:", error);
    return { success: false };
  }
};

export const getMovieViewStats = async (movieSlug: string) => {
  const normalizedSlug = movieSlug.trim();
  if (!normalizedSlug) {
    return { movieSlug: "", totalViews: 0 };
  }

  try {
    await connectToDatabase();
    const doc = await MovieViewStatModel.findOne({ movieSlug: normalizedSlug })
      .select("movieSlug totalViews")
      .lean();

    return {
      movieSlug: normalizedSlug,
      totalViews: Number(doc?.totalViews || 0),
    };
  } catch (error) {
    console.error("Failed to load movie view stats:", error);
    return { movieSlug: normalizedSlug, totalViews: 0 };
  }
};

export const getMovieRankings = async (
  limit?: number,
): Promise<MovieRankings> => fetchMovieRankings(limit);
