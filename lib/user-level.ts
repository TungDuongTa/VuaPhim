export type WatchExpStats = {
  episodesWatched: number;
  chaptersRead: number;
  totalExp: number;
  level: number;
  currentLevelExp: number;
  expToNextLevel: number;
  progressPercent: number;
  maxLevel: number;
};

export const MAX_USER_LEVEL = 100;
export const EXP_PER_EPISODE = 1;
export const EXP_PER_LEVEL = 100;

export const toWatchExpStats = (episodesWatched: number): WatchExpStats => {
  const episodeCount = Math.max(0, Math.floor(Number(episodesWatched) || 0));
  const totalExp = episodeCount * EXP_PER_EPISODE;
  const rawLevel = Math.floor(totalExp / EXP_PER_LEVEL) + 1;
  const level = Math.min(MAX_USER_LEVEL, rawLevel);

  if (level >= MAX_USER_LEVEL) {
    return {
      episodesWatched: episodeCount,
      chaptersRead: episodeCount,
      totalExp,
      level: MAX_USER_LEVEL,
      currentLevelExp: EXP_PER_LEVEL,
      expToNextLevel: 0,
      progressPercent: 100,
      maxLevel: MAX_USER_LEVEL,
    };
  }

  const currentLevelExp = totalExp % EXP_PER_LEVEL;
  const expToNextLevel = EXP_PER_LEVEL - currentLevelExp;
  const progressPercent = (currentLevelExp / EXP_PER_LEVEL) * 100;

  return {
    episodesWatched: episodeCount,
    chaptersRead: episodeCount,
    totalExp,
    level,
    currentLevelExp,
    expToNextLevel,
    progressPercent,
    maxLevel: MAX_USER_LEVEL,
  };
};
