import "server-only";
import { connectToDatabase } from "@/database/mongoose";
import { UserCosmeticsModel } from "@/database/models/user-cosmetics.model";
import { UserWatchStatsModel } from "@/database/models/user-watch-stats.model";
import {
  computeAvailableCredits,
  normalizeOwnedItemIds,
  toEquippedCosmetics,
  toUserCosmeticsPublic,
} from "@/lib/cosmetics/display";
import type {
  EquippedCosmetics,
  UserCosmeticsPublic,
  UserWalletSummary,
} from "@/lib/cosmetics/types";
import { toWatchExpStats } from "@/lib/user-level";

const normalizeUserIds = (userIds: string[]) =>
  Array.from(
    new Set(userIds.map((id) => String(id || "").trim()).filter(Boolean)),
  );

const sameStringArray = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const persistSanitizedCosmetics = async (
  userId: string,
  rawOwned: unknown[] | null | undefined,
  rawEquipped: EquippedCosmetics | null | undefined,
) => {
  const ownedItemIds = normalizeOwnedItemIds(rawOwned);
  const equipped = toEquippedCosmetics(rawEquipped);
  const rawOwnedNormalized = Array.isArray(rawOwned)
    ? rawOwned.map((id) => String(id || "").trim()).filter(Boolean)
    : [];

  const needsWrite =
    !sameStringArray(rawOwnedNormalized, ownedItemIds) ||
    String(rawEquipped?.avatarFrame || "") !== String(equipped.avatarFrame || "") ||
    String(rawEquipped?.usernameEffect || "") !==
      String(equipped.usernameEffect || "") ||
    String(rawEquipped?.profileBanner || "") !==
      String(equipped.profileBanner || "");

  if (needsWrite) {
    await UserCosmeticsModel.updateOne(
      { userId },
      { $set: { ownedItemIds, equipped } },
    );
  }

  return { ownedItemIds, equipped };
};

export const getUserCosmeticsMap = async (
  userIds: string[],
): Promise<Map<string, UserCosmeticsPublic>> => {
  const uniqueUserIds = normalizeUserIds(userIds);
  const cosmeticsMap = new Map<string, UserCosmeticsPublic>();
  if (uniqueUserIds.length === 0) return cosmeticsMap;

  await connectToDatabase();
  const rows = await UserCosmeticsModel.find({
    userId: { $in: uniqueUserIds },
  })
    .select("userId equipped")
    .lean();

  for (const userId of uniqueUserIds) {
    cosmeticsMap.set(userId, toUserCosmeticsPublic(null));
  }

  for (const row of rows as Array<{
    userId?: string;
    equipped?: EquippedCosmetics;
  }>) {
    const userId = String(row.userId || "").trim();
    if (!userId) continue;
    cosmeticsMap.set(
      userId,
      toUserCosmeticsPublic(toEquippedCosmetics(row.equipped)),
    );
  }

  return cosmeticsMap;
};

export const getUserWalletSummary = async (
  userId: string | null | undefined,
): Promise<UserWalletSummary | null> => {
  const normalizedUserId = String(userId || "").trim();
  if (!normalizedUserId) return null;

  await connectToDatabase();
  const [statsRow, cosmeticsRow] = await Promise.all([
    UserWatchStatsModel.findOne({ userId: normalizedUserId })
      .select("episodesWatched")
      .lean(),
    UserCosmeticsModel.findOne({ userId: normalizedUserId })
      .select("creditsSpent ownedItemIds equipped")
      .lean(),
  ]);

  const totalExp = toWatchExpStats(Number(statsRow?.episodesWatched || 0)).totalExp;
  const creditsSpent = Math.max(
    0,
    Math.floor(Number(cosmeticsRow?.creditsSpent) || 0),
  );

  const { ownedItemIds, equipped } = cosmeticsRow
    ? await persistSanitizedCosmetics(
        normalizedUserId,
        cosmeticsRow.ownedItemIds,
        cosmeticsRow.equipped,
      )
    : { ownedItemIds: [] as string[], equipped: {} as EquippedCosmetics };

  return {
    totalExp,
    creditsSpent,
    availableCredits: computeAvailableCredits(totalExp, creditsSpent),
    ownedItemIds,
    equipped,
  };
};

export const ensureUserCosmeticsDoc = async (userId: string) => {
  await connectToDatabase();
  const doc = await UserCosmeticsModel.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        creditsSpent: 0,
        ownedItemIds: [],
        equipped: {},
      },
    },
    { upsert: true, new: true },
  ).lean();

  if (doc) {
    await persistSanitizedCosmetics(userId, doc.ownedItemIds, doc.equipped);
  }

  return doc;
};
