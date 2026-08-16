import type { CosmeticCategory, ShopItem } from "@/lib/cosmetics/types";
import { AVATAR_FRAME_SHOP_ITEMS } from "@/lib/cosmetics/avatar-frames";
import { USERNAME_EFFECT_SHOP_ITEMS } from "@/lib/cosmetics/username-effects";

const GENERAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: "banner-sunset",
    category: "profile_banner",
    name: "Hoàng Hôn",
    description: "Nền hồ sơ gradient hoàng hôn ấm áp.",
    rarity: "common",
    cost: 120,
    className: "profile-banner profile-banner--sunset",
    sortOrder: 110,
  },
  {
    id: "banner-galaxy",
    category: "profile_banner",
    name: "Tinh Hải",
    description: "Dải ngân hà sâu thẳm trên trang hồ sơ.",
    rarity: "rare",
    cost: 300,
    className: "profile-banner profile-banner--galaxy",
    sortOrder: 120,
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  ...USERNAME_EFFECT_SHOP_ITEMS,
  ...AVATAR_FRAME_SHOP_ITEMS,
  ...GENERAL_SHOP_ITEMS,
].sort((a, b) => a.sortOrder - b.sortOrder);

const shopItemMap = new Map(SHOP_ITEMS.map((item) => [item.id, item]));

export const getShopItem = (id: string) => shopItemMap.get(id) ?? null;

export const isKnownShopItemId = (id: string) => shopItemMap.has(id);

export const getShopItemsByCategory = (category: CosmeticCategory) =>
  SHOP_ITEMS.filter((item) => item.category === category).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

export type ShopTab = CosmeticCategory;

export const SHOP_TABS: Array<{ id: ShopTab; label: string }> = [
  { id: "username_effect", label: "Hiệu ứng tên" },
  { id: "avatar_frame", label: "Khung avatar" },
  { id: "profile_banner", label: "Nền hồ sơ" },
];

export const getItemsForShopTab = (
  items: ShopItem[],
  tab: ShopTab,
): ShopItem[] =>
  items
    .filter((item) => item.category === tab)
    .sort((a, b) => a.sortOrder - b.sortOrder);

export const SHOP_CATEGORIES: CosmeticCategory[] = [
  "username_effect",
  "avatar_frame",
  "profile_banner",
];
