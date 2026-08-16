export const CACHE_TAGS = {
  movieLists: "nguonc-lists",
  movieRankings: "movie-rankings",
  userRankings: "user-rankings",
  homeComments: "home-comments",
} as const;

export const filmTag = (slug: string) => `film:${slug}`;
