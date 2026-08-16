import { cacheLife, cacheTag } from "next/cache";
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
import { CACHE_TAGS, filmTag } from "@/lib/server/cache-tags";
import { fetchMovieRankings } from "@/lib/server/movie-rankings";
import { fetchUserRankings } from "@/lib/server/user-rankings";
import type { MovieCard, MovieDetail, MovieListResult } from "@/types/movie-types";

const MOVIE_LISTS_LIFE = {
  stale: 900,
  revalidate: 1800,
  expire: 21_600,
} as const;

const HOME_SIDEBAR_LIFE = {
  stale: 900,
  revalidate: 900,
  expire: 3600,
} as const;

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
  "use cache: remote";
  cacheLife(MOVIE_LISTS_LIFE);
  cacheTag(CACHE_TAGS.movieLists);
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
  "use cache: remote";
  cacheLife(MOVIE_LISTS_LIFE);
  cacheTag(CACHE_TAGS.movieLists);
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
  "use cache: remote";
  cacheLife(MOVIE_LISTS_LIFE);
  cacheTag(CACHE_TAGS.movieLists);
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
  "use cache: remote";
  cacheLife(MOVIE_LISTS_LIFE);
  cacheTag(CACHE_TAGS.movieLists);
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
  "use cache: remote";
  cacheLife(MOVIE_LISTS_LIFE);
  cacheTag(CACHE_TAGS.movieLists);
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
  "use cache: remote";
  cacheLife(MOVIE_LISTS_LIFE);
  cacheTag(CACHE_TAGS.movieLists);
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
  "use cache: remote";
  cacheLife(MOVIE_LISTS_LIFE);
  cacheTag(CACHE_TAGS.movieLists);
  cacheTag(filmTag(slug));
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
  "use cache: remote";
  cacheLife(HOME_SIDEBAR_LIFE);
  cacheTag(CACHE_TAGS.movieRankings);
  return fetchMovieRankings(limit);
}

export async function getCachedUserRankings(limit = 10) {
  "use cache: remote";
  cacheLife(HOME_SIDEBAR_LIFE);
  cacheTag(CACHE_TAGS.userRankings);
  return fetchUserRankings(limit);
}

export async function getCachedRecentHomeComments(limit = 10) {
  "use cache: remote";
  cacheLife(HOME_SIDEBAR_LIFE);
  cacheTag(CACHE_TAGS.homeComments);
  return getRecentTopLevelComments(limit);
}
