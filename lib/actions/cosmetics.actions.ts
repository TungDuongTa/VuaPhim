"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/database/mongoose";
import { UserCosmeticsModel } from "@/database/models/user-cosmetics.model";
import {
  toEquippedCosmetics,
  normalizeOwnedItemIds,
} from "@/lib/cosmetics/display";
import { getShopItem, SHOP_ITEMS } from "@/lib/cosmetics/shop-catalog";
import {
  EQUIPPED_KEY_BY_CATEGORY,
  EMPTY_COSMETICS_PUBLIC,
  type CosmeticCategory,
  type UserWalletSummary,
} from "@/lib/cosmetics/types";
import {
  ensureUserCosmeticsDoc,
  getUserCosmeticsMap,
  getUserWalletSummary,
} from "@/lib/server/user-cosmetics";
import { getSessionUser } from "@/lib/server/session";
import { getUserWatchExpStats } from "@/lib/server/user-level";

type ActionResult = {
  success: boolean;
  message: string;
  requiresSignIn?: boolean;
  wallet?: UserWalletSummary;
};

export type ShopPageData = {
  viewer: {
    id: string;
    name: string;
    image: string;
    level: number;
  } | null;
  wallet: UserWalletSummary | null;
  items: typeof SHOP_ITEMS;
};

export const getShopPageData = async (): Promise<ShopPageData> => {
  const user = await getSessionUser();
  if (!user) {
    return { viewer: null, wallet: null, items: SHOP_ITEMS };
  }

  const [wallet, watchExp] = await Promise.all([
    getUserWalletSummary(user.id),
    getUserWatchExpStats(user.id),
  ]);

  return {
    viewer: {
      id: user.id,
      name: user.name || user.email || "User",
      image: user.image ?? "",
      level: watchExp.level,
    },
    wallet,
    items: SHOP_ITEMS,
  };
};

export const purchaseCosmeticItem = async (
  itemId: string,
): Promise<ActionResult> => {
  const user = await getSessionUser();
  if (!user) {
    return {
      success: false,
      message: "Vui lòng đăng nhập để mua vật phẩm.",
      requiresSignIn: true,
    };
  }

  const item = getShopItem(itemId.trim());
  if (!item) return { success: false, message: "Vật phẩm không tồn tại." };

  await connectToDatabase();
  await ensureUserCosmeticsDoc(user.id);
  const existing = await UserCosmeticsModel.findOne({ userId: user.id })
    .select("creditsSpent ownedItemIds")
    .lean();
  const ownedItemIds = normalizeOwnedItemIds(existing?.ownedItemIds);
  if (ownedItemIds.includes(item.id)) {
    return { success: false, message: "Bạn đã sở hữu vật phẩm này." };
  }

  const wallet = await getUserWalletSummary(user.id);
  if (!wallet || wallet.availableCredits < item.cost) {
    return {
      success: false,
      message: "Không đủ Linh Thạch. Hãy xem thêm phim để nhận EXP.",
    };
  }

  await UserCosmeticsModel.updateOne(
    { userId: user.id },
    {
      $inc: { creditsSpent: item.cost },
      $addToSet: { ownedItemIds: item.id },
    },
  );

  revalidatePath("/shop");
  revalidatePath("/profile");
  return {
    success: true,
    message: `Đã mua ${item.name}.`,
    wallet: (await getUserWalletSummary(user.id)) ?? undefined,
  };
};

export const equipCosmeticItem = async (
  itemId: string,
): Promise<ActionResult> => {
  const user = await getSessionUser();
  if (!user) {
    return {
      success: false,
      message: "Vui lòng đăng nhập để trang bị vật phẩm.",
      requiresSignIn: true,
    };
  }

  const item = getShopItem(itemId.trim());
  if (!item) return { success: false, message: "Vật phẩm không tồn tại." };

  await connectToDatabase();
  await ensureUserCosmeticsDoc(user.id);
  const existing = await UserCosmeticsModel.findOne({ userId: user.id })
    .select("ownedItemIds equipped")
    .lean();
  const ownedItemIds = normalizeOwnedItemIds(existing?.ownedItemIds);
  if (!ownedItemIds.includes(item.id)) {
    return { success: false, message: "Bạn chưa sở hữu vật phẩm này." };
  }

  const equippedKey = EQUIPPED_KEY_BY_CATEGORY[item.category as CosmeticCategory];
  if (!equippedKey) {
    return { success: false, message: "Loại vật phẩm không hợp lệ." };
  }

  const equippedField = `equipped.${equippedKey}`;
  const currentEquipped = toEquippedCosmetics(existing?.equipped);
  const currentlyEquippedId = currentEquipped[equippedKey];

  if (currentlyEquippedId === item.id) {
    await UserCosmeticsModel.updateOne(
      { userId: user.id },
      { $unset: { [equippedField]: "" } },
    );
    revalidatePath("/shop");
    revalidatePath("/profile");
    return {
      success: true,
      message: `Đã gỡ ${item.name}.`,
      wallet: (await getUserWalletSummary(user.id)) ?? undefined,
    };
  }

  await UserCosmeticsModel.updateOne(
    { userId: user.id },
    { $set: { [equippedField]: item.id } },
  );
  revalidatePath("/shop");
  revalidatePath("/profile");
  return {
    success: true,
    message: `Đã trang bị ${item.name}.`,
    wallet: (await getUserWalletSummary(user.id)) ?? undefined,
  };
};

export const getCurrentUserWalletSummary = async () => {
  const user = await getSessionUser();
  if (!user) return null;
  return getUserWalletSummary(user.id);
};

export const getCurrentUserCosmeticsPublic = async () => {
  const user = await getSessionUser();
  if (!user) return EMPTY_COSMETICS_PUBLIC;
  const cosmeticsMap = await getUserCosmeticsMap([user.id]);
  return cosmeticsMap.get(user.id) ?? EMPTY_COSMETICS_PUBLIC;
};
