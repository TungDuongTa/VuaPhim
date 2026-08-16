"use server";

import {
  fetchBrowseMovies,
  fetchMovieDetail,
  searchMovies,
} from "@/lib/nguonc/api";
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
    fetchBrowseMovies({
      ...filters,
      page: filters.page || 1,
    }),
  );
}

export async function getMovieDetail(
  slug: string,
): Promise<MovieDetail | null> {
  return safeQuery(`movie ${slug}`, () => fetchMovieDetail(slug));
}

export async function searchMoviesQuick(keyword: string): Promise<MovieCard[]> {
  if (!keyword || keyword.trim().length < 2) return [];

  const data = await safeQuery(`quick search ${keyword}`, () =>
    searchMovies(keyword.trim(), 1),
  );

  return (data?.items || []).slice(0, 8);
}

export async function getLatestMovies(page = 1): Promise<MovieListResult | null> {
  return getBrowseMovies({ page });
}
