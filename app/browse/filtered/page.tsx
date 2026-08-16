import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { BrowseCatalogPage } from "@/components/browse-catalog-page";
import { PageFallback } from "@/components/page-fallback";
import {
  BROWSE_DESCRIPTION,
  browseTitleFromFilters,
  buildBrowseHref,
  hasActiveBrowseFilters,
  parseBrowseFilters,
  type BrowseSearchParams,
} from "@/lib/browse-params";
import { withSiteSuffix } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<BrowseSearchParams>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const filters = parseBrowseFilters(await searchParams);
  const title = browseTitleFromFilters(filters);
  const canonicalPath = buildBrowseHref(filters);

  return {
    title,
    description: BROWSE_DESCRIPTION,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: withSiteSuffix(title),
      description: BROWSE_DESCRIPTION,
      url: canonicalPath,
    },
    twitter: {
      title: withSiteSuffix(title),
      description: BROWSE_DESCRIPTION,
    },
  };
}

export default function BrowseFilteredPage({
  searchParams,
}: PageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <BrowseFilteredContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BrowseFilteredContent({
  searchParams,
}: PageProps) {
  const filters = parseBrowseFilters(await searchParams);

  if (!hasActiveBrowseFilters(filters)) {
    redirect(buildBrowseHref(filters));
  }

  return <BrowseCatalogPage filters={filters} />;
}
