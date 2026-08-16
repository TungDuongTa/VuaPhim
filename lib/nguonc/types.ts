export type NguonCPaginate = {
  current_page?: number;
  total_page?: number;
  total_items?: number;
  items_per_page?: number;
};

export type NguonCNamedItem = {
  id?: string | number;
  name?: string;
  slug?: string;
};

export type NguonCEpisodeItem = {
  name?: string;
  slug?: string;
  embed?: string;
  m3u8?: string;
};

export type NguonCEpisodeServer = {
  server_name?: string;
  items?: NguonCEpisodeItem[];
};

export type NguonCMovie = {
  id?: string | number;
  name?: string;
  slug?: string;
  original_name?: string;
  thumb_url?: string;
  poster_url?: string;
  description?: string;
  total_episodes?: string | number;
  current_episode?: string;
  time?: string;
  quality?: string;
  language?: string;
  director?: string;
  casts?: string;
  year?: string | number;
  created?: string;
  modified?: string;
  category?: unknown;
  episodes?: NguonCEpisodeServer[];
};

export type NguonCListResponse = {
  status?: string;
  paginate?: NguonCPaginate;
  items?: NguonCMovie[];
};

export type NguonCDetailResponse = {
  status?: string;
  movie?: NguonCMovie;
};
