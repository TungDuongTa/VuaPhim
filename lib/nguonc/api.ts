import { nguoncFetch } from "@/lib/nguonc/client";
import {
  toMovieDetailFromResponse,
  toMovieListResult,
} from "@/lib/nguonc/mappers";
import type { NguonCDetailResponse, NguonCListResponse } from "@/lib/nguonc/types";
import type { MovieDetail, MovieListResult } from "@/types/movie-types";

const encodePath = (value: string) => encodeURIComponent(value.trim());

export async function fetchLatestMovies(page = 1): Promise<MovieListResult> {
  const payload = await nguoncFetch<NguonCListResponse>(
    `/films/phim-moi-cap-nhat?page=${page}`,
  );
  return toMovieListResult(payload, page);
}

export async function fetchMoviesByType(
  slug: string,
  page = 1,
): Promise<MovieListResult> {
  if (!slug || slug === "phim-moi-cap-nhat") {
    return fetchLatestMovies(page);
  }

  const payload = await nguoncFetch<NguonCListResponse>(
    `/films/danh-sach/${encodePath(slug)}?page=${page}`,
  );
  return toMovieListResult(payload, page);
}

export async function fetchMoviesByGenre(
  slug: string,
  page = 1,
): Promise<MovieListResult> {
  const payload = await nguoncFetch<NguonCListResponse>(
    `/films/the-loai/${encodePath(slug)}?page=${page}`,
  );
  return toMovieListResult(payload, page);
}

export async function fetchMoviesByCountry(
  slug: string,
  page = 1,
): Promise<MovieListResult> {
  const payload = await nguoncFetch<NguonCListResponse>(
    `/films/quoc-gia/${encodePath(slug)}?page=${page}`,
  );
  return toMovieListResult(payload, page);
}

export async function fetchMoviesByYear(
  year: string,
  page = 1,
): Promise<MovieListResult> {
  const payload = await nguoncFetch<NguonCListResponse>(
    `/films/nam-phat-hanh/${encodePath(year)}?page=${page}`,
  );
  return toMovieListResult(payload, page);
}

export async function searchMovies(
  keyword: string,
  page = 1,
): Promise<MovieListResult> {
  const payload = await nguoncFetch<NguonCListResponse>(
    `/films/search?keyword=${encodeURIComponent(keyword.trim())}&page=${page}`,
  );
  return toMovieListResult(payload, page);
}

export async function fetchMovieDetail(
  slug: string,
): Promise<MovieDetail | null> {
  const payload = await nguoncFetch<NguonCDetailResponse>(
    `/film/${encodePath(slug)}`,
  );
  return toMovieDetailFromResponse(payload);
}
