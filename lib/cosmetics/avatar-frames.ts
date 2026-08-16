import type { ShopItem } from "@/lib/cosmetics/types";

const AVATAR_FRAME_COST = 500;

/** Per-frame settings — edit `frameScale` individually as needed. */
const AVATAR_FRAMES: Array<{ n: number; frameScale: number }> = [
  { n: 1, frameScale: 1.5 },
  { n: 2, frameScale: 1.4 },
  { n: 3, frameScale: 1.3 },
  { n: 4, frameScale: 1.3 },
  { n: 5, frameScale: 1.3 },
  { n: 6, frameScale: 1.3 },
  { n: 7, frameScale: 1.3 },
  { n: 8, frameScale: 1.3 },
  { n: 9, frameScale: 1.4 },
  { n: 10, frameScale: 1.4 },
  { n: 11, frameScale: 1.5 },
  { n: 12, frameScale: 1.35 },
  { n: 13, frameScale: 1.3 },
  { n: 14, frameScale: 1.35 },
  { n: 15, frameScale: 1.35 },
  { n: 16, frameScale: 1.35 },
  { n: 17, frameScale: 1.35 },
  { n: 18, frameScale: 1.55 },
  { n: 19, frameScale: 1.4 },
  { n: 20, frameScale: 1.3 },
  { n: 21, frameScale: 1.3 },
  { n: 22, frameScale: 1.45 },
  { n: 23, frameScale: 1.15 },
  { n: 24, frameScale: 1.3 },
  { n: 25, frameScale: 1.5 },
  { n: 26, frameScale: 1.5 },
  { n: 27, frameScale: 1.15 },
  { n: 28, frameScale: 1.15 },
];

export const AVATAR_FRAME_SHOP_ITEMS: ShopItem[] = AVATAR_FRAMES.map(
  ({ n, frameScale }) => ({
    id: `frame-avatar-${n}`,
    category: "avatar_frame" as const,
    name: `Khung ${n}`,
    description: "Khung avatar trang trí.",
    rarity: "epic" as const,
    cost: AVATAR_FRAME_COST,
    imageSrc: `/avatar-frame/avatar-frame-${n}.png`,
    frameScale,
    sortOrder: n,
  }),
);
