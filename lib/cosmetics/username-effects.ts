import type { CosmeticRarity, ShopItem } from "@/lib/cosmetics/types";

type UsernameEffectDef = {
  slug: string;
  name: string;
  description: string;
  className: string;
};

/** Color-themed username shimmer effects. */
const USERNAME_EFFECTS: UsernameEffectDef[] = [
  {
    slug: "slate",
    name: "Ánh Bạc",
    description: "Chữ lấp lánh tông xám bạc.",
    className: "username-mask username-mask--slate",
  },
  {
    slug: "stone",
    name: "Nâu Đá",
    description: "Chữ lấp lánh tông nâu đá.",
    className: "username-mask username-mask--stone",
  },
  {
    slug: "amber",
    name: "Hổ Phách",
    description: "Chữ lấp lánh tông vàng hổ phách.",
    className: "username-mask username-mask--amber",
  },
  {
    slug: "rose",
    name: "Hồng Cam",
    description: "Chữ lấp lánh tông hồng cam.",
    className: "username-mask username-mask--rose",
  },
  {
    slug: "fuchsia",
    name: "Tím Hồng",
    description: "Chữ lấp lánh tông hồng tím.",
    className: "username-mask username-mask--fuchsia",
  },
  {
    slug: "blue",
    name: "Xanh Dương",
    description: "Chữ lấp lánh tông xanh dương.",
    className: "username-mask username-mask--blue",
  },
  {
    slug: "gold",
    name: "Vàng Óng",
    description: "Chữ lấp lánh tông vàng óng.",
    className: "username-mask username-mask--gold",
  },
  {
    slug: "indigo",
    name: "Chàm Tím",
    description: "Chữ lấp lánh tông chàm tím.",
    className: "username-mask username-mask--indigo",
  },
  {
    slug: "cyan",
    name: "Xanh Cyan",
    description: "Chữ lấp lánh tông xanh cyan.",
    className: "username-mask username-mask--cyan",
  },
  {
    slug: "emerald",
    name: "Lục Bảo",
    description: "Chữ lấp lánh tông xanh lục.",
    className: "username-mask username-mask--emerald",
  },
  {
    slug: "sky",
    name: "Xanh Biển",
    description: "Chữ lấp lánh tông xanh biển.",
    className: "username-mask username-mask--sky",
  },
  {
    slug: "violet-pink",
    name: "Tím Hồng Đậm",
    description: "Chữ lấp lánh tông tím chuyển hồng.",
    className: "username-mask username-mask--violet-pink",
  },
  {
    slug: "lavender",
    name: "Tím Oải Hương",
    description: "Chữ lấp lánh tông tím oải hương.",
    className: "username-mask username-mask--lavender",
  },
  {
    slug: "violet-cyan",
    name: "Tím Cyan",
    description: "Chữ lấp lánh tông tím pha cyan.",
    className: "username-mask username-mask--violet-cyan",
  },
  {
    slug: "peach",
    name: "Hồng Đào",
    description: "Chữ lấp lánh tông hồng đào.",
    className: "username-mask username-mask--peach",
  },
  {
    slug: "amber-bright",
    name: "Vàng Kim",
    description: "Chữ lấp lánh tông vàng kim.",
    className: "username-mask username-mask--amber-bright",
  },
  {
    slug: "mint",
    name: "Xanh Lục",
    description: "Chữ lấp lánh tông xanh lục sáng.",
    className: "username-mask username-mask--mint",
  },
  {
    slug: "lime",
    name: "Chanh Vàng",
    description: "Chữ lấp lánh tông xanh chanh vàng.",
    className: "username-mask username-mask--lime",
  },
  {
    slug: "magenta-gold",
    name: "Tím Vàng",
    description: "Chữ lấp lánh tông tím pha vàng.",
    className: "username-mask username-mask--magenta-gold",
  },
  {
    slug: "rainbow",
    name: "Cầu Vồng",
    description: "Chữ lấp lánh đa sắc cầu vồng.",
    className: "username-mask username-mask--rainbow",
  },
];

const rarityForIndex = (index: number): CosmeticRarity => {
  if (index >= 16) return "legendary";
  if (index >= 12) return "epic";
  if (index >= 8) return "rare";
  if (index >= 4) return "uncommon";
  return "common";
};

export const USERNAME_EFFECT_SHOP_ITEMS: ShopItem[] = USERNAME_EFFECTS.map(
  (effect, index) => ({
    id: `fx-${effect.slug}`,
    category: "username_effect" as const,
    name: effect.name,
    description: effect.description,
    rarity: rarityForIndex(index),
    cost: 50 + index * 40,
    className: effect.className,
    sortOrder: 100 + index,
  }),
);
