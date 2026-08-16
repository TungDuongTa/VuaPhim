export type CosmeticCategory =
  | "avatar_frame"
  | "username_effect"
  | "profile_banner";

export type CosmeticRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type ShopItem = {
  id: string;
  category: CosmeticCategory;
  name: string;
  description: string;
  rarity: CosmeticRarity;
  cost: number;
  className?: string;
  /** Public asset path for image-based frames (SVG/PNG). */
  imageSrc?: string;
  /**
   * Overlay scale for image frames relative to the avatar size.
   * Assets with padded decorations need ~1.8–2.2 so the inner hole hugs the avatar.
   */
  frameScale?: number;
  sortOrder: number;
};

export type EquippedCosmetics = {
  avatarFrame?: string;
  usernameEffect?: string;
  profileBanner?: string;
};

export type UserCosmeticsRecord = {
  userId: string;
  creditsSpent: number;
  ownedItemIds: string[];
  equipped: EquippedCosmetics;
};

export type UserCosmeticsPublic = {
  avatarFrameSrc: string | null;
  avatarFrameScale: number | null;
  shopUsernameEffectClassName: string | null;
  profileBannerClassName: string | null;
};

export type UserWalletSummary = {
  totalExp: number;
  creditsSpent: number;
  availableCredits: number;
  ownedItemIds: string[];
  equipped: EquippedCosmetics;
};

export const EMPTY_COSMETICS_PUBLIC: UserCosmeticsPublic = {
  avatarFrameSrc: null,
  avatarFrameScale: null,
  shopUsernameEffectClassName: null,
  profileBannerClassName: null,
};

export const COSMETIC_CATEGORY_LABELS: Record<CosmeticCategory, string> = {
  avatar_frame: "Khung avatar",
  username_effect: "Hiệu ứng tên",
  profile_banner: "Nền hồ sơ",
};

export const COSMETIC_RARITY_LABELS: Record<CosmeticRarity, string> = {
  common: "Phổ thông",
  uncommon: "Tinh phẩm",
  rare: "Hiếm",
  epic: "Cực phẩm",
  legendary: "Thần phẩm",
};

export const COSMETIC_RARITY_CLASS: Record<CosmeticRarity, string> = {
  common: "border-slate-400/40 text-slate-200",
  uncommon: "border-emerald-400/40 text-emerald-200",
  rare: "border-sky-400/40 text-sky-200",
  epic: "border-violet-400/40 text-violet-200",
  legendary: "border-amber-300/60 text-amber-100",
};

export const EQUIPPED_KEY_BY_CATEGORY: Record<
  CosmeticCategory,
  keyof EquippedCosmetics
> = {
  avatar_frame: "avatarFrame",
  username_effect: "usernameEffect",
  profile_banner: "profileBanner",
};
