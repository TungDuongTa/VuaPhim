import { Flame, TrendingUp, Clock, Trophy, type LucideIcon } from "lucide-react";
import { toPositiveInt } from "@/lib/pagination";
import { pageSlugStaticParams, parsePageSlug, toPageSlug } from "@/lib/page-slug";
import type { MovieRankingPeriod } from "@/lib/server/movie-rankings";

export const RANKING_BASE = "/ranking";
export const RANKING_MAX_ITEMS = 120;
export const RANKING_ITEMS_PER_PAGE = 24;
export const RANKING_MAX_PAGE = Math.max(
  1,
  Math.ceil(RANKING_MAX_ITEMS / RANKING_ITEMS_PER_PAGE),
);

export const RANKING_DESCRIPTION =
  "Khám phá những bộ phim được xem nhiều nhất tại VuaPhim.";

export const RANKING_TABS: Array<{
  key: MovieRankingPeriod;
  label: string;
  Icon: LucideIcon;
}> = [
  { key: "daily", label: "Ngày", Icon: Flame },
  { key: "weekly", label: "Tuần", Icon: TrendingUp },
  { key: "monthly", label: "Tháng", Icon: Clock },
  { key: "allTime", label: "Tất cả", Icon: Trophy },
];

export const DEFAULT_RANKING_TAB: MovieRankingPeriod = "daily";

export const isRankingPeriod = (
  value: string | undefined,
): value is MovieRankingPeriod =>
  RANKING_TABS.some((tab) => tab.key === value);

export const parseRankingTab = (
  value: string | undefined,
): MovieRankingPeriod =>
  value && isRankingPeriod(value) ? value : DEFAULT_RANKING_TAB;

export const parseRankingPageSlug = parsePageSlug;

export const buildRankingHref = (
  tab: MovieRankingPeriod,
  page: number = 1,
): string => {
  const safePage = toPositiveInt(page, 1);
  const isDefaultTab = tab === DEFAULT_RANKING_TAB;

  if (safePage <= 1) {
    return isDefaultTab ? RANKING_BASE : `${RANKING_BASE}/${tab}`;
  }

  return `${RANKING_BASE}/${tab}/${toPageSlug(safePage)}`;
};

export const rankingTabLabel = (tab: MovieRankingPeriod): string =>
  RANKING_TABS.find((entry) => entry.key === tab)?.label || "Ngày";

export const rankingPageTitle = (
  tab: MovieRankingPeriod,
  page: number,
): string => {
  const safePage = toPositiveInt(page, 1);
  const pageSuffix = safePage > 1 ? ` - Page ${safePage}` : "";
  return `Bảng xếp hạng ${rankingTabLabel(tab)}${pageSuffix}`;
};

export const rankingStaticTabParams = (): Array<{ tab: string }> =>
  RANKING_TABS.filter((tab) => tab.key !== DEFAULT_RANKING_TAB).map((tab) => ({
    tab: tab.key,
  }));

export const rankingStaticPageParams = (): Array<{
  tab: string;
  pageSlug: string;
}> =>
  RANKING_TABS.flatMap((tab) =>
    pageSlugStaticParams(2, RANKING_MAX_PAGE).map(({ pageSlug }) => ({
      tab: tab.key,
      pageSlug,
    })),
  );
