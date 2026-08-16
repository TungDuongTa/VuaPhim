import { getRecentTopLevelComments } from "@/lib/actions/comment.actions";
import {
  fetchLatestMovies,
  fetchMovieDetail,
  fetchMoviesByCountry,
  fetchMoviesByGenre,
  fetchMoviesByType,
  fetchMoviesByYear,
  searchMovies,
} from "@/lib/nguonc/api";
import { fetchMovieRankings } from "@/lib/server/movie-rankings";
import { fetchUserRankings } from "@/lib/server/user-rankings";
import type { MovieDetail, MovieListResult } from "@/types/movie-types";

const emptyList = (page: number): MovieListResult => ({
  items: [],
  pagination: {
    totalItems: 0,
    totalItemsPerPage: 20,
    currentPage: page,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
});

export async function getCachedLatestMovies(page = 1): Promise<MovieListResult> {
  try {
    return await fetchLatestMovies(page);
  } catch (error) {
    console.error("Failed to load latest movies:", error);
    return emptyList(page);
  }
}

export async function getCachedMoviesByType(
  slug: string,
  page = 1,
): Promise<MovieListResult> {
  try {
    return await fetchMoviesByType(slug, page);
  } catch (error) {
    console.error(`Failed to load type ${slug}:`, error);
    return emptyList(page);
  }
}

export async function getCachedMoviesByGenre(
  slug: string,
  page = 1,
): Promise<MovieListResult> {
  try {
    return await fetchMoviesByGenre(slug, page);
  } catch (error) {
    console.error(`Failed to load genre ${slug}:`, error);
    return emptyList(page);
  }
}

export async function getCachedMoviesByCountry(
  slug: string,
  page = 1,
): Promise<MovieListResult> {
  try {
    return await fetchMoviesByCountry(slug, page);
  } catch (error) {
    console.error(`Failed to load country ${slug}:`, error);
    return emptyList(page);
  }
}

export async function getCachedMoviesByYear(
  year: string,
  page = 1,
): Promise<MovieListResult> {
  try {
    return await fetchMoviesByYear(year, page);
  } catch (error) {
    console.error(`Failed to load year ${year}:`, error);
    return emptyList(page);
  }
}

export async function getCachedSearchMovies(
  keyword: string,
  page = 1,
): Promise<MovieListResult> {
  try {
    return await searchMovies(keyword, page);
  } catch (error) {
    console.error(`Failed to search ${keyword}:`, error);
    return emptyList(page);
  }
}

export async function getCachedMovieDetail(
  slug: string,
): Promise<MovieDetail | null> {
  try {
    return await fetchMovieDetail(slug);
  } catch (error) {
    console.error(`Failed to load movie ${slug}:`, error);
    return null;
  }
}

export async function getCachedBrowseMovies(options: {
  query?: string;
  type?: string;
  genre?: string;
  country?: string;
  year?: string;
  page?: number;
}): Promise<MovieListResult> {
  const page = options.page || 1;
  if (options.query) return getCachedSearchMovies(options.query, page);
  if (options.genre) return getCachedMoviesByGenre(options.genre, page);
  if (options.country) return getCachedMoviesByCountry(options.country, page);
  if (options.year) return getCachedMoviesByYear(options.year, page);
  if (options.type) return getCachedMoviesByType(options.type, page);
  return getCachedLatestMovies(page);
}

export async function getCachedMovieRankings(limit = 10) {
  return fetchMovieRankings(limit);
}

export async function getCachedUserRankings(limit = 10) {
  return fetchUserRankings(limit);
}

export async function getCachedRecentHomeComments(limit = 10) {
  return getRecentTopLevelComments(limit);
}
