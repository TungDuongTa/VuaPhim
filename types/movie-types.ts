export type NamedSlug = {
  id: string;
  name: string;
  slug: string;
};

export type Pagination = {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
};

export type MovieCard = {
  _id: string;
  name: string;
  slug: string;
  origin_name: string[];
  thumb_url: string;
  poster_url: string;
  quality: string;
  language: string;
  current_episode: string;
  total_episodes: string;
  type: string;
  year: string;
  category: NamedSlug[];
  updatedAt: string;
  totalViews?: number;
  periodViews?: number;
};

export type MovieListResult = {
  items: MovieCard[];
  pagination: Pagination;
};

export type EpisodeSource = {
  name: string;
  slug: string;
  embed: string;
  m3u8: string;
};

export type EpisodeServer = {
  server_name: string;
  items: EpisodeSource[];
};

export type MovieDetail = MovieCard & {
  description: string;
  duration: string;
  director: string[];
  casts: string[];
  countries: NamedSlug[];
  episodes: EpisodeServer[];
};

export const formatMovieType = (type: string): string => {
  switch (type) {
    case "phim-bo":
      return "Phim bộ";
    case "phim-le":
      return "Phim lẻ";
    case "tv-shows":
      return "TV shows";
    case "dang-chieu":
      return "Đang chiếu";
    case "hoat-hinh":
      return "Hoạt hình";
    default:
      return type || "Phim";
  }
};

export const formatEpisodeCount = (
  currentEpisode?: string,
  totalEpisodes?: string,
  fallbackCount = 0,
): string => {
  const current = String(currentEpisode || "").trim();
  const total = String(totalEpisodes || "").trim();
  if (current && total) return `${current} / ${total}`;
  if (total) return `${total} tập`;
  if (current) return current;
  if (fallbackCount > 0) return `${fallbackCount} tập`;
  return "";
};
