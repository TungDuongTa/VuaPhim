import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { BrowseCatalogPage } from "@/components/browse-catalog-page";
import { PageFallback } from "@/components/page-fallback";
import {
  BROWSE_BASE,
  BROWSE_DESCRIPTION,
  browseStaticPageParams,
  browseTitleFromFilters,
  buildBrowseHref,
  parseBrowseFilters,
} from "@/lib/browse-params";
import { MAX_OFFSET_PAGE } from "@/lib/pagination";
import { parsePageSlug } from "@/lib/page-slug";
import { withSiteSuffix } from "@/lib/seo";

type PageProps = {
  params: Promise<{
    pageSlug: string;
  }>;
};

export function generateStaticParams() {
  return browseStaticPageParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { pageSlug } = await params;
  const page = parsePageSlug(pageSlug);
  if (page === null) {
    return {
      title: "Khám phá",
      description: BROWSE_DESCRIPTION,
    };
  }

  const filters = parseBrowseFilters({}, page);
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

export default function BrowsePagedPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PageFallback />}>
      <BrowsePagedContent params={params} />
    </Suspense>
  );
}

async function BrowsePagedContent({ params }: PageProps) {
  const { pageSlug } = await params;
  const page = parsePageSlug(pageSlug);

  if (page === null) {
    notFound();
  }

  if (page <= 1) {
    redirect(BROWSE_BASE);
  }

  if (page > MAX_OFFSET_PAGE) {
    notFound();
  }

  const filters = parseBrowseFilters({}, page);
  return <BrowseCatalogPage filters={filters} />;
}
