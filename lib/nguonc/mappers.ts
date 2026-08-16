import type {
  EpisodeServer,
  MovieCard,
  MovieDetail,
  MovieListResult,
  NamedSlug,
  Pagination,
} from "@/types/movie-types";
import type {
  NguonCDetailResponse,
  NguonCEpisodeServer,
  NguonCListResponse,
  NguonCMovie,
  NguonCNamedItem,
} from "@/lib/nguonc/types";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toText = (value: unknown): string => String(value ?? "").trim();

const splitPeople = (value: string): string[] =>
  value
    .split(/[,;/|]/)
    .map((part) => part.trim())
    .filter(Boolean);

const toSlug = (value: string): string =>
  value
    .trim()
    .replace(/đ/gi, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeGroupSlug = (value: string): string => {
  const slug = toSlug(value);
  if (slug.startsWith("the-loai")) return "the-loai";
  if (slug.startsWith("quoc-gia")) return "quoc-gia";
  if (slug.startsWith("dinh-dang")) return "dinh-dang";
  if (slug.startsWith("nam")) return "nam";
  return slug;
};

const toNamedSlug = (item: NguonCNamedItem, fallbackSlug = ""): NamedSlug => {
  const name = toText(item.name) || fallbackSlug;
  const slug = toText(item.slug) || toSlug(name) || fallbackSlug;
  return {
    id: toText(item.id) || slug,
    name: name || slug,
    slug,
  };
};

const parseNamedList = (list: unknown): NamedSlug[] => {
  if (Array.isArray(list)) {
    return list
      .map((raw) => {
        const item = asRecord(raw) as NguonCNamedItem | null;
        return toNamedSlug(item || {}, "");
      })
      .filter((item) => item.slug);
  }

  const record = asRecord(list);
  if (!record) return [];

  return Object.entries(record)
    .map(([slug, raw]) => {
      const item = asRecord(raw) as NguonCNamedItem | null;
      return toNamedSlug(item || { slug, name: slug }, slug);
    })
    .filter((item) => item.slug);
};

const flattenCategoryGroup = (
  category: unknown,
  groupSlug: string,
): NamedSlug[] => {
  const buckets = Array.isArray(category)
    ? category
    : asRecord(category)
      ? Object.values(asRecord(category) as Record<string, unknown>)
      : [];

  const seen = new Set<string>();
  const groups: NamedSlug[] = [];

  for (const bucket of buckets) {
    const bucketRecord = asRecord(bucket);
    if (!bucketRecord) continue;

    const group = asRecord(bucketRecord.group);
    const nested = asRecord(group?.[groupSlug]);
    const groupNameSlug = normalizeGroupSlug(
      toText(group?.slug) || toText(group?.name),
    );
    if (groupNameSlug !== groupSlug && !nested) continue;

    const items = parseNamedList(nested?.list ?? bucketRecord.list);
    for (const item of items) {
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      groups.push(item);
    }
  }

  return groups;
};

const getUpdatedAt = (movie: NguonCMovie): string => {
  const value = toText(movie.modified) || toText(movie.created);
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
};

export const toMovieCard = (movie: NguonCMovie): MovieCard | null => {
  const slug = toText(movie.slug);
  const name = toText(movie.name);
  if (!slug || !name) return null;

  const originalName = toText(movie.original_name);
  const genres = flattenCategoryGroup(movie.category, "the-loai");
  const types = flattenCategoryGroup(movie.category, "dinh-dang");
  const years = flattenCategoryGroup(movie.category, "nam");
  const preferredType =
    types.find((item) =>
      ["phim-bo", "phim-le", "tv-shows", "hoat-hinh"].includes(item.slug),
    ) || types[0];

  return {
    _id: toText(movie.id) || slug,
    name,
    slug,
    origin_name: originalName ? [originalName] : [],
    thumb_url: toText(movie.thumb_url) || toText(movie.poster_url),
    poster_url: toText(movie.poster_url) || toText(movie.thumb_url),
    quality: toText(movie.quality),
    language: toText(movie.language),
    current_episode: toText(movie.current_episode),
    total_episodes: toText(movie.total_episodes),
    type: preferredType?.slug || "",
    year: toText(movie.year) || years[0]?.slug || years[0]?.name || "",
    category: genres,
    updatedAt: getUpdatedAt(movie),
  };
};

const toEpisodeServers = (
  servers: NguonCEpisodeServer[] | undefined,
): EpisodeServer[] =>
  (servers || [])
    .map((server) => ({
      server_name: toText(server.server_name) || "Server",
      items: (server.items || [])
        .map((item) => ({
          name: toText(item.name),
          slug: toText(item.slug),
          embed: toText(item.embed),
          m3u8: toText(item.m3u8),
        }))
        .filter((item) => item.slug && (item.embed || item.m3u8)),
    }))
    .filter((server) => server.items.length > 0);

export const toMovieDetail = (movie: NguonCMovie): MovieDetail | null => {
  const card = toMovieCard(movie);
  if (!card) return null;

  return {
    ...card,
    description: toText(movie.description),
    duration: toText(movie.time),
    director: splitPeople(toText(movie.director)),
    casts: splitPeople(toText(movie.casts)),
    countries: flattenCategoryGroup(movie.category, "quoc-gia"),
    episodes: toEpisodeServers(movie.episodes),
  };
};

const toPagination = (
  paginate: NguonCListResponse["paginate"],
  fallbackPage: number,
  itemCount: number,
): Pagination => {
  const currentPage = Number(paginate?.current_page || fallbackPage) || 1;
  const totalPages = Math.max(1, Number(paginate?.total_page || 1) || 1);
  const totalItems = Number(paginate?.total_items || itemCount) || itemCount;
  const totalItemsPerPage =
    Number(paginate?.items_per_page || itemCount || 20) || 20;

  return {
    totalItems,
    totalItemsPerPage,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

export const toMovieListResult = (
  payload: NguonCListResponse | null | undefined,
  page = 1,
): MovieListResult => {
  const items = (payload?.items || [])
    .map((item) => toMovieCard(item))
    .filter((item): item is MovieCard => Boolean(item));

  return {
    items,
    pagination: toPagination(payload?.paginate, page, items.length),
  };
};

export const toMovieDetailFromResponse = (
  payload: NguonCDetailResponse | null | undefined,
): MovieDetail | null => {
  if (!payload?.movie) return null;
  return toMovieDetail(payload.movie);
};
