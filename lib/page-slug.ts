import { toPositiveInt } from "@/lib/pagination";

const PAGE_SLUG_PATTERN = /^page-(\d+)$/;

export const toPageSlug = (page: number): string => {
  const safePage = toPositiveInt(page, 1);
  return `page-${safePage}`;
};

export const parsePageSlug = (slug: string | undefined): number | null => {
  if (!slug) return null;
  const match = slug.match(PAGE_SLUG_PATTERN);
  if (!match) return null;
  const page = toPositiveInt(match[1], 0);
  return page > 0 ? page : null;
};

export const isPageSlug = (slug: string | undefined): boolean =>
  parsePageSlug(slug) !== null;

export const pageSlugStaticParams = (
  startPage: number,
  endPage: number,
): Array<{ pageSlug: string }> =>
  Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, index) => ({
    pageSlug: toPageSlug(startPage + index),
  }));
