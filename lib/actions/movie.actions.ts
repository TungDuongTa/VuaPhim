"use server";

import {
  getCachedBrowseMovies,
  getCachedMovieDetail,
  getCachedSearchMovies,
} from "@/lib/server/movie-cache";
import type { MovieCard, MovieDetail, MovieListResult } from "@/types/movie-types";

async function safeQuery<T>(
  label: string,
  query: () => Promise<T | null>,
): Promise<T | null> {
  try {
    return await query();
  } catch (error) {
    console.error(`Failed to load ${label}:`, error);
    return null;
  }
}

export async function getBrowseMovies(filters: {
  query?: string;
  type?: string;
  genre?: string;
  country?: string;
  year?: string;
  page?: number;
}): Promise<MovieListResult | null> {
  return safeQuery("browse movies", () =>
    getCachedBrowseMovies({
      ...filters,
      page: filters.page || 1,
    }),
  );
}

export async function getMovieDetail(
  slug: string,
): Promise<MovieDetail | null> {
  return safeQuery(`movie ${slug}`, () => getCachedMovieDetail(slug));
}

export async function searchMoviesQuick(keyword: string): Promise<MovieCard[]> {
  if (!keyword || keyword.trim().length < 2) return [];

  const data = await safeQuery(`quick search ${keyword}`, () =>
    getCachedSearchMovies(keyword.trim(), 1),
  );

  return (data?.items || []).slice(0, 8);
}

export async function getLatestMovies(page = 1): Promise<MovieListResult | null> {
  return getBrowseMovies({ page });
}
