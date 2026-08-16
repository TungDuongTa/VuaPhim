import "server-only";
import { connectToDatabase } from "@/database/mongoose";
import { UserWatchStatsModel } from "@/database/models/user-watch-stats.model";
import { getAuthUserProfileMap } from "@/lib/server/auth-user-profiles";
import { getUserCosmeticsMap } from "@/lib/server/user-cosmetics";
import { EMPTY_COSMETICS_PUBLIC } from "@/lib/cosmetics/types";
import type { UserCosmeticsPublic } from "@/lib/cosmetics/types";
import { toWatchExpStats } from "@/lib/user-level";

export type UserRankingItem = {
  userId: string;
  name: string;
  image: string;
  description: string;
  episodesWatched: number;
  level: number;
  totalExp: number;
  rank: number;
  cosmetics: UserCosmeticsPublic;
};

export const fetchUserRankings = async (
  limit = 10,
): Promise<UserRankingItem[]> => {
  const safeLimit = Math.min(50, Math.max(1, Math.floor(limit) || 10));

  try {
    await connectToDatabase();
    const statsRows = await UserWatchStatsModel.find({
      episodesWatched: { $gt: 0 },
    })
      .sort({ episodesWatched: -1, updatedAt: 1 })
      .limit(safeLimit)
      .select("userId episodesWatched")
      .lean();

    const userIds = statsRows
      .map((row) => String(row.userId || "").trim())
      .filter(Boolean);
    const profileMap = await getAuthUserProfileMap(userIds);
    const cosmeticsMap = await getUserCosmeticsMap(userIds);

    return statsRows
      .map((row, index) => {
        const userId = String(row.userId || "").trim();
        if (!userId) return null;
        const episodesWatched = Math.max(
          0,
          Math.floor(Number(row.episodesWatched) || 0),
        );
        const exp = toWatchExpStats(episodesWatched);
        const profile = profileMap.get(userId);

        return {
          userId,
          name: profile?.name || "User",
          image: profile?.image || "",
          description: profile?.description || "",
          episodesWatched,
          level: exp.level,
          totalExp: exp.totalExp,
          rank: index + 1,
          cosmetics: cosmeticsMap.get(userId) ?? EMPTY_COSMETICS_PUBLIC,
        } satisfies UserRankingItem;
      })
      .filter((item): item is UserRankingItem => item !== null);
  } catch (error) {
    console.error("Failed to load user rankings:", error);
    return [];
  }
};
