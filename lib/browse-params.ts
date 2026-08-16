import { MAX_OFFSET_PAGE, toPositiveInt } from "@/lib/pagination";
import {
  pageSlugStaticParams,
  parsePageSlug,
  toPageSlug,
} from "@/lib/page-slug";
import { buildCanonicalPath } from "@/lib/seo";
import { MOVIE_TYPES } from "@/lib/nguonc/catalog";

export const BROWSE_BASE = "/browse";
export const BROWSE_FILTERED_BASE = "/browse/filtered";
export const BROWSE_DESCRIPTION =
  "Tìm kiếm phim bộ, phim lẻ và TV shows mới nhất tại VuaPhim";

export type BrowseType = string;

export type BrowseFilters = {
  query: string;
  type: BrowseType;
  genre: string;
  country: string;
  year: string;
  page: number;
};

export type BrowseSearchParams = {
  q?: string | string[];
  type?: string | string[];
  genres?: string | string[];
  genre?: string | string[];
  country?: string | string[];
  year?: string | string[];
  page?: string | string[];
};

const firstParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
};

const TYPE_SLUGS = new Set(MOVIE_TYPES.map((item) => item.slug));

const normalizeBrowseType = (value: string): BrowseType => {
  if (TYPE_SLUGS.has(value) && value !== "phim-moi-cap-nhat") return value;
  return "";
};

export const hasBrowseFilterQuery = (
  searchParams: BrowseSearchParams | URLSearchParams,
): boolean => {
  const get = (key: string) => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key)?.trim() || "";
    }
    const raw = searchParams[key as keyof BrowseSearchParams];
    return firstParam(raw as string | string[] | undefined);
  };

  return Boolean(
    get("q") ||
      normalizeBrowseType(get("type")) ||
      get("genres") ||
      get("genre") ||
      get("country") ||
      get("year"),
  );
};

export const hasActiveBrowseFilters = (filters: BrowseFilters): boolean =>
  Boolean(filters.query.trim()) ||
  Boolean(filters.type) ||
  Boolean(filters.genre.trim()) ||
  Boolean(filters.country.trim()) ||
  Boolean(filters.year.trim());

export const parseBrowseFilters = (
  searchParams: BrowseSearchParams,
  pageOverride?: number,
): BrowseFilters => {
  const query = firstParam(searchParams.q);
  const genresRaw =
    firstParam(searchParams.genres) || firstParam(searchParams.genre);
  const genre =
    genresRaw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)[0] || "";
  const type = normalizeBrowseType(firstParam(searchParams.type));
  const country = firstParam(searchParams.country);
  const year = firstParam(searchParams.year);
  const page =
    pageOverride !== undefined
      ? toPositiveInt(pageOverride, 1)
      : toPositiveInt(firstParam(searchParams.page), 1);

  return { query, type, genre, country, year, page };
};

export const buildBrowseHref = (
  filters: Partial<BrowseFilters> & { page?: number } = {},
): string => {
  const query = (filters.query || "").trim();
  const type = normalizeBrowseType(String(filters.type || ""));
  const genre = (filters.genre || "").trim();
  const country = (filters.country || "").trim();
  const year = (filters.year || "").trim();
  const page = toPositiveInt(filters.page, 1);
  const hasFilters = Boolean(query || type || genre || country || year);

  const catalogBase = hasFilters ? BROWSE_FILTERED_BASE : BROWSE_BASE;
  const pathname =
    page > 1 ? `${catalogBase}/${toPageSlug(page)}` : catalogBase;

  if (!hasFilters) {
    return pathname;
  }

  return buildCanonicalPath(pathname, {
    q: query || undefined,
    type: type || undefined,
    genres: genre || undefined,
    country: country || undefined,
    year: year || undefined,
  });
};

export const browseTitleFromFilters = (filters: BrowseFilters): string => {
  const titleParts = ["Khám phá"];
  if (filters.query) titleParts.push(`"${filters.query}"`);
  if (filters.type) titleParts.push(filters.type);
  if (filters.genre) titleParts.push(filters.genre);
  if (filters.country) titleParts.push(filters.country);
  if (filters.year) titleParts.push(filters.year);
  if (filters.page > 1) titleParts.push(`Trang ${filters.page}`);
  return titleParts.join(" - ");
};

export const browseStaticPageParams = (): Array<{ pageSlug: string }> =>
  pageSlugStaticParams(2, MAX_OFFSET_PAGE);

export { MAX_OFFSET_PAGE, parsePageSlug };
