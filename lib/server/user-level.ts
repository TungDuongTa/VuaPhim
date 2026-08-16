import { connectToDatabase } from "@/database/mongoose";
import { UserWatchStatsModel } from "@/database/models/user-watch-stats.model";
import { toWatchExpStats, type WatchExpStats } from "@/lib/user-level";

const normalizeUserIds = (userIds: string[]) =>
  Array.from(
    new Set(userIds.map((id) => String(id || "").trim()).filter(Boolean)),
  );

export const incrementUserWatchStats = async (
  userId: string | null | undefined,
  episodeIncrement = 1,
) => {
  const normalizedUserId = String(userId || "").trim();
  const incrementBy = Math.max(0, Math.floor(Number(episodeIncrement) || 0));
  if (!normalizedUserId || incrementBy <= 0) return;

  await connectToDatabase();
  await UserWatchStatsModel.updateOne(
    { userId: normalizedUserId },
    { $inc: { episodesWatched: incrementBy } },
    { upsert: true },
  );
};

export const getUserLevelMap = async (
  userIds: string[],
): Promise<Map<string, number>> => {
  const uniqueUserIds = normalizeUserIds(userIds);
  const levelMap = new Map<string, number>();
  if (uniqueUserIds.length === 0) return levelMap;

  await connectToDatabase();
  const statsRows = await UserWatchStatsModel.find({
    userId: { $in: uniqueUserIds },
  })
    .select("userId episodesWatched")
    .lean();

  const defaultLevel = toWatchExpStats(0).level;
  for (const userId of uniqueUserIds) {
    levelMap.set(userId, defaultLevel);
  }

  for (const row of statsRows as Array<{
    userId?: string;
    episodesWatched?: number;
  }>) {
    const userId = String(row.userId || "").trim();
    if (!userId) continue;
    levelMap.set(userId, toWatchExpStats(Number(row.episodesWatched || 0)).level);
  }

  return levelMap;
};

export const getUserWatchExpStats = async (
  userId: string | null | undefined,
): Promise<WatchExpStats> => {
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) return toWatchExpStats(0);

  await connectToDatabase();
  const existingStats = await UserWatchStatsModel.findOne({
    userId: normalizedUserId,
  })
    .select("episodesWatched")
    .lean();

  return toWatchExpStats(Number(existingStats?.episodesWatched || 0));
};
