import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { RankingCatalogPage } from "@/components/ranking-catalog-page";
import { PageFallback } from "@/components/page-fallback";
import {
  RANKING_DESCRIPTION,
  RANKING_MAX_PAGE,
  buildRankingHref,
  isRankingPeriod,
  parseRankingPageSlug,
  parseRankingTab,
  rankingPageTitle,
  rankingStaticPageParams,
} from "@/lib/ranking-params";
import { withSiteSuffix } from "@/lib/seo";

type PageProps = {
  params: Promise<{
    tab: string;
    pageSlug: string;
  }>;
};

export function generateStaticParams() {
  return rankingStaticPageParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tab: tabParam, pageSlug } = await params;
  if (!isRankingPeriod(tabParam)) {
    return {
      title: "Bảng xếp hạng",
      description: RANKING_DESCRIPTION,
    };
  }

  const tab = parseRankingTab(tabParam);
  const currentPage = parseRankingPageSlug(pageSlug);
  if (currentPage === null) {
    return {
      title: "Bảng xếp hạng",
      description: RANKING_DESCRIPTION,
    };
  }

  const title = rankingPageTitle(tab, currentPage);
  const canonicalPath = buildRankingHref(tab, currentPage);

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

export default function RankingPagedPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <RankingPagedContent params={params} />
    </Suspense>
  );
}

async function RankingPagedContent({ params }: PageProps) {
  const { tab: tabParam, pageSlug } = await params;

  if (!isRankingPeriod(tabParam)) {
    notFound();
  }

  const requestedPage = parseRankingPageSlug(pageSlug);
  if (requestedPage === null) {
    notFound();
  }

  if (requestedPage <= 1) {
    redirect(buildRankingHref(tabParam, 1));
  }

  if (requestedPage > RANKING_MAX_PAGE) {
    notFound();
  }

  return (
    <RankingCatalogPage tab={tabParam} requestedPage={requestedPage} />
  );
}
