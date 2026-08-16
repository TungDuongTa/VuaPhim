import type { EpisodeServer, EpisodeSource } from "@/types/movie-types";

export type WatchServerOption = {
  serverName: string;
  source: EpisodeSource;
};

const STORAGE_PREFIX = "vuaphim:server:";

export const getUniqueEpisodes = (
  servers: EpisodeServer[],
): EpisodeSource[] => {
  const seen = new Map<string, EpisodeSource>();
  for (const server of servers) {
    for (const item of server.items || []) {
      const slug = String(item.slug || "").trim();
      if (!slug || seen.has(slug)) continue;
      seen.set(slug, item);
    }
  }
  return Array.from(seen.values());
};

export const findEpisodeSource = (
  servers: EpisodeServer[],
  episodeSlug: string,
): EpisodeSource | null => {
  const decoded = decodeURIComponent(episodeSlug).trim();
  for (const server of servers) {
    const match = (server.items || []).find(
      (item) => item.slug === decoded || item.slug === episodeSlug,
    );
    if (match) return match;
  }
  return null;
};

export const getServersForEpisode = (
  servers: EpisodeServer[],
  episodeSlug: string,
): WatchServerOption[] => {
  const decoded = decodeURIComponent(episodeSlug).trim();
  return servers
    .map((server) => {
      const source = (server.items || []).find(
        (item) => item.slug === decoded || item.slug === episodeSlug,
      );
      if (!source) return null;
      return {
        serverName: server.server_name || "Server",
        source,
      };
    })
    .filter((item): item is WatchServerOption => Boolean(item));
};

export const pickPreferredServer = (
  options: WatchServerOption[],
  preferredName?: string | null,
): WatchServerOption | null => {
  if (options.length === 0) return null;
  if (preferredName) {
    const named = options.find((item) => item.serverName === preferredName);
    if (named) return named;
  }
  return (
    options.find((item) => Boolean(item.source.m3u8)) || options[0] || null
  );
};

export const serverStorageKey = (movieSlug: string): string =>
  `${STORAGE_PREFIX}${movieSlug}`;

export const episodeHref = (movieSlug: string, episodeSlug: string): string =>
  `/phim/${movieSlug}/tap/${encodeURIComponent(episodeSlug)}`;
