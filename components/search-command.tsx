"use client";

import * as React from "react";
import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { searchMoviesQuick } from "@/lib/actions/movie.actions";
import { buildBrowseHref } from "@/lib/browse-params";
import { formatRelativeTime } from "@/lib/date-time";
import type { MovieCard } from "@/types/movie-types";

export function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [results, setResults] = useState<MovieCard[]>([]);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    startTransition(async () => {
      setResults(await searchMoviesQuick(debouncedQuery));
    });
  }, [debouncedQuery]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = useCallback(() => {
    onOpenChange(false);
    setQuery("");
  }, [onOpenChange]);

  const navigateToBrowse = useCallback(() => {
    onOpenChange(false);
    setQuery("");
    router.push(buildBrowseHref({ query: query.trim(), page: 1 }));
  }, [onOpenChange, query, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-19 left-1/2 max-w-2xl -translate-x-1/2 translate-y-0 gap-0 overflow-hidden border-border bg-card p-0 sm:max-w-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Tìm kiếm phim</DialogTitle>
        <DialogDescription className="sr-only">Tìm kiếm theo tên phim</DialogDescription>
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                navigateToBrowse();
              }
            }}
            placeholder="Tìm phim bộ, phim lẻ, TV shows..."
            className="flex-1 bg-transparent px-4 py-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />}
          {query && (
            <button type="button" onClick={() => setQuery("")} className="rounded-md p-1 hover:bg-secondary">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {!hasSearched && query.length < 2 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Nhập ít nhất 2 ký tự để bắt đầu tìm kiếm.....
          </div>
        ) : (
          <div className="max-h-[min(400px,calc(100vh-10rem))] overflow-y-auto">
            {results.length === 0 && hasSearched && !isPending ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Không tìm thấy kết quả cho &quot;{query}&quot;
              </div>
            ) : (
              <div className="p-2">
                {results.map((movie, index) => (
                  <Link
                    key={movie._id || index}
                    href={`/phim/${movie.slug}`}
                    onClick={handleSelect}
                    className="group flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-secondary"
                  >
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={movie.thumb_url} alt={movie.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 font-semibold text-foreground group-hover:text-primary">
                        {movie.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {movie.current_episode || formatRelativeTime(movie.updatedAt)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {movie.category.slice(0, 3).map((cat) => (
                          <Badge key={`${movie._id}-${cat.slug}`} variant="secondary" className="bg-secondary/80 px-2 py-0.5 text-xs">
                            {cat.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="border-t border-border p-3">
          <Button className="w-full gap-2" onClick={navigateToBrowse}>
            Xem tất cả kết quả tìm kiếm
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-2.5 text-muted-foreground transition-colors hover:border-primary/30 hover:bg-secondary/60"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left text-sm">Tìm phim....</span>
      <kbd className="hidden h-6 items-center rounded-md border border-border/80 bg-secondary/80 px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase sm:inline-flex">
        Ctrl K
      </kbd>
    </button>
  );
}
