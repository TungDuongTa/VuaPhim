import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
import { MAX_OFFSET_PAGE } from "@/lib/pagination";
import { parsePageSlug } from "@/lib/page-slug";
import { withSiteSuffix } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    pageSlug: string;
  }>;
  searchParams: Promise<BrowseSearchParams>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { pageSlug } = await params;
  const page = parsePageSlug(pageSlug);
  if (page === null) {
    return {
      title: "Khám phá",
      description: BROWSE_DESCRIPTION,
    };
  }

  const filters = parseBrowseFilters(await searchParams, page);
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

export default function BrowseFilteredPagedPage({
  params,
  searchParams,
}: PageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <BrowseFilteredPagedContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function BrowseFilteredPagedContent({
  params,
  searchParams,
}: PageProps) {
  const { pageSlug } = await params;
  const page = parsePageSlug(pageSlug);

  if (page === null) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const filters = parseBrowseFilters(resolvedSearchParams, page);

  if (!hasActiveBrowseFilters(filters)) {
    redirect(buildBrowseHref(filters));
  }

  if (page <= 1) {
    redirect(buildBrowseHref({ ...filters, page: 1 }));
  }

  if (page > MAX_OFFSET_PAGE) {
    notFound();
  }

  return <BrowseCatalogPage filters={filters} />;
}
