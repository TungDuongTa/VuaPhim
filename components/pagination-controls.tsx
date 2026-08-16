import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVisiblePages } from "@/lib/pagination";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  visiblePages?: number[];
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  getPageHref?: (page: number) => string;
  onPageChange?: (page: number) => void;
  disabled?: boolean;
};

export function PaginationControls({
  currentPage,
  totalPages,
  visiblePages,
  hasPrevPage,
  hasNextPage,
  getPageHref,
  onPageChange,
  disabled = false,
}: PaginationControlsProps) {
  const pages = visiblePages ?? getVisiblePages(currentPage, totalPages);
  const canGoPrev = hasPrevPage ?? currentPage > 1;
  const canGoNext = hasNextPage ?? currentPage < totalPages;
  if (totalPages <= 1 && !canGoPrev && !canGoNext) return null;

  const renderItem = (
    page: number,
    enabled: boolean,
    content: ReactNode,
    variant: "default" | "outline" = "outline",
  ) => {
    if (getPageHref && enabled && !disabled) {
      return (
        <Link href={getPageHref(page)}>
          <Button variant={variant} size="icon">
            {content}
          </Button>
        </Link>
      );
    }

    return (
      <Button
        variant={variant}
        size="icon"
        disabled={!enabled || disabled}
        onClick={onPageChange ? () => onPageChange(page) : undefined}
      >
        {content}
      </Button>
    );
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {renderItem(currentPage - 1, canGoPrev, <ChevronLeft className="h-4 w-4" />)}
      <div className="flex items-center gap-1">
        {pages.map((pageNum) => (
          <Fragment key={pageNum}>
            {renderItem(
              pageNum,
              true,
              pageNum,
              pageNum === currentPage ? "default" : "outline",
            )}
          </Fragment>
        ))}
      </div>
      {renderItem(currentPage + 1, canGoNext, <ChevronRight className="h-4 w-4" />)}
    </div>
  );
}
