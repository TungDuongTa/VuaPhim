import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { RankingCatalogPage } from "@/components/ranking-catalog-page";
import { PageFallback } from "@/components/page-fallback";
import {
  DEFAULT_RANKING_TAB,
  RANKING_BASE,
  RANKING_DESCRIPTION,
  buildRankingHref,
  isRankingPeriod,
  parseRankingTab,
  rankingPageTitle,
  rankingStaticTabParams,
} from "@/lib/ranking-params";
import { withSiteSuffix } from "@/lib/seo";

type PageProps = {
  params: Promise<{
    tab: string;
  }>;
};

export function generateStaticParams() {
  return rankingStaticTabParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tab: tabParam } = await params;
  if (!isRankingPeriod(tabParam)) {
    return {
      title: "Bảng xếp hạng",
      description: RANKING_DESCRIPTION,
    };
  }

  const tab = parseRankingTab(tabParam);
  const title = rankingPageTitle(tab, 1);
  const canonicalPath = buildRankingHref(tab, 1);

  return {
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
}

export default function RankingTabPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <RankingTabContent params={params} />
    </Suspense>
  );
}

async function RankingTabContent({ params }: PageProps) {
  const { tab: tabParam } = await params;

  if (!isRankingPeriod(tabParam)) {
    notFound();
  }

  if (tabParam === DEFAULT_RANKING_TAB) {
    redirect(RANKING_BASE);
  }

  return <RankingCatalogPage tab={tabParam} requestedPage={1} />;
}
