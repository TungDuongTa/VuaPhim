import type { Metadata } from "next";
import { RankingCatalogPage } from "@/components/ranking-catalog-page";
import {
  DEFAULT_RANKING_TAB,
  RANKING_DESCRIPTION,
  buildRankingHref,
  rankingPageTitle,
} from "@/lib/ranking-params";
import { withSiteSuffix } from "@/lib/seo";

const title = rankingPageTitle(DEFAULT_RANKING_TAB, 1);
const canonicalPath = buildRankingHref(DEFAULT_RANKING_TAB, 1);

export const metadata: Metadata = {
  title,
  description: RANKING_DESCRIPTION,
  alternates: {
    canonical: canonicalPath,
  },
  openGraph: {
    title: withSiteSuffix(title),
    description: RANKING_DESCRIPTION,
    url: canonicalPath,
  },
  twitter: {
    title: withSiteSuffix(title),
    description: RANKING_DESCRIPTION,
  },
};

export default function RankingIndexPage() {
  return <RankingCatalogPage tab={DEFAULT_RANKING_TAB} requestedPage={1} />;
}
