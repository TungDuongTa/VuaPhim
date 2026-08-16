import { getShopItem, isKnownShopItemId } from "@/lib/cosmetics/shop-catalog";
import {
  EMPTY_COSMETICS_PUBLIC,
  type EquippedCosmetics,
  type UserCosmeticsPublic,
} from "@/lib/cosmetics/types";

const sanitizeEquippedId = (id: string | null | undefined) => {
  const trimmed = String(id || "").trim();
  if (!trimmed || !isKnownShopItemId(trimmed)) return undefined;
  return trimmed;
};

export const toEquippedCosmetics = (
  equipped: Partial<EquippedCosmetics> | null | undefined,
): EquippedCosmetics => ({
  avatarFrame: sanitizeEquippedId(equipped?.avatarFrame),
  usernameEffect: sanitizeEquippedId(equipped?.usernameEffect),
  profileBanner: sanitizeEquippedId(equipped?.profileBanner),
});

/** Keep only item ids that still exist in the shop catalog. */
export const normalizeOwnedItemIds = (ids: unknown[] | null | undefined) =>
  Array.from(
    new Set(
      (Array.isArray(ids) ? ids : [])
        .map((id) => String(id || "").trim())
        .filter((id) => id && isKnownShopItemId(id)),
    ),
  );

export const toUserCosmeticsPublic = (
  equipped: EquippedCosmetics | null | undefined,
): UserCosmeticsPublic => {
  if (!equipped) return EMPTY_COSMETICS_PUBLIC;

  const frameItem = equipped.avatarFrame
    ? getShopItem(equipped.avatarFrame)
    : null;
  const usernameItem = equipped.usernameEffect
    ? getShopItem(equipped.usernameEffect)
    : null;
  const bannerItem = equipped.profileBanner
    ? getShopItem(equipped.profileBanner)
    : null;

  return {
    avatarFrameSrc: frameItem?.imageSrc ?? null,
    avatarFrameScale: frameItem?.frameScale ?? null,
    shopUsernameEffectClassName: usernameItem?.className ?? null,
    profileBannerClassName: bannerItem?.className ?? null,
  };
};

/** Username color/effect only when a shop item is equipped — no level fallback. */
export const resolveUsernameEffectClassName = (
  cosmetics?: UserCosmeticsPublic | null,
) => cosmetics?.shopUsernameEffectClassName ?? "text-foreground";

export const computeAvailableCredits = (
  totalExp: number,
  creditsSpent: number,
) => Math.max(0, Math.floor(totalExp) - Math.max(0, Math.floor(creditsSpent)));
