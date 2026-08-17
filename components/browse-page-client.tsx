"use client";

import { useEffect, useLayoutEffect, useState, useTransition, type FormEvent } from "react";
import { fetchBrowseMovies } from "@/lib/nguonc/api";
import { resetWindowScroll } from "@/lib/reset-window-scroll";
import { useRouter } from "next/navigation";
import { ArrowRight, Filter, Loader2, Search } from "lucide-react";
import { MovieCardApi } from "@/components/movie-card-api";
import { PageFallback } from "@/components/page-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/pagination-controls";
import { MAX_OFFSET_PAGE, getVisiblePages } from "@/lib/pagination";
import { buildBrowseHref, type BrowseFilters } from "@/lib/browse-params";
import {
  MOVIE_COUNTRIES,
  MOVIE_GENRES,
  MOVIE_TYPES,
  MOVIE_YEARS,
  findCatalogName,
  type CatalogOption,
} from "@/lib/nguonc/catalog";
import { chipClassName } from "@/lib/chip-class";
import type { MovieCard, Pagination } from "@/types/movie-types";

type DraftFilters = Pick<BrowseFilters, "type" | "genre" | "country" | "year">;

const MOVIE_TYPE_OPTIONS = MOVIE_TYPES.filter(
  (item) => item.slug !== "phim-moi-cap-nhat",
);

function FilterChip({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={chipClassName(selected)}
    >
      {label}
    </button>
  );
}

function FilterRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: CatalogOption[];
  onChange: (next: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-dashed border-border/70 py-3 sm:flex-row sm:gap-6">
      <p className="w-28 shrink-0 pt-1 text-sm font-semibold text-foreground sm:text-right">
        {label}:
      </p>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1 gap-y-1.5">
        <FilterChip
          label="Tất cả"
          selected={!value}
          onSelect={() => onChange("")}
        />
        {options.map((option) => (
          <FilterChip
            key={option.slug}
            label={option.name}
            selected={value === option.slug}
            onSelect={() => onChange(option.slug)}
          />
        ))}
      </div>
    </div>
  );
}

export function BrowsePageClient({
  movies: initialMovies,
  pagination: initialPagination,
  filters,
}: {
  movies: MovieCard[];
  pagination: Pagination | null;
  filters: BrowseFilters;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [movies, setMovies] = useState(initialMovies);
  const [pagination, setPagination] = useState(initialPagination);
  const [isLoadingList, setIsLoadingList] = useState(initialMovies.length === 0);
  const [searchQuery, setSearchQuery] = useState(filters.query);
  const [showFilters, setShowFilters] = useState(
    Boolean(filters.type || filters.genre || filters.country || filters.year),
  );
  const [draft, setDraft] = useState<DraftFilters>({
    type: filters.type,
    genre: filters.genre,
    country: filters.country,
    year: filters.year,
  });

  useEffect(() => {
    setSearchQuery(filters.query);
    setDraft({
      type: filters.type,
      genre: filters.genre,
      country: filters.country,
      year: filters.year,
    });
  }, [filters.query, filters.type, filters.genre, filters.country, filters.year]);

  useEffect(() => {
    setMovies(initialMovies);
    setPagination(initialPagination);

    if (initialMovies.length > 0) {
      setIsLoadingList(false);
      return;
    }

    let cancelled = false;
    setIsLoadingList(true);

    const load = async () => {
      try {
        const result = await fetchBrowseMovies({
          query: filters.query,
          type: filters.type,
          genre: filters.genre,
          country: filters.country,
          year: filters.year,
          page: filters.page,
        });
        if (cancelled) return;
        setMovies(result.items || []);
        setPagination(result.pagination || null);
      } catch (error) {
        console.error("Failed to load browse movies:", error);
        if (!cancelled) {
          setMovies([]);
          setPagination(null);
        }
      } finally {
        if (!cancelled) setIsLoadingList(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    filters.country,
    filters.genre,
    filters.page,
    filters.query,
    filters.type,
    filters.year,
    initialMovies,
    initialPagination,
  ]);

  useLayoutEffect(() => {
    if (!isLoadingList) resetWindowScroll();
  }, [isLoadingList]);

  const navigate = (next: Partial<BrowseFilters>) => {
    const href = buildBrowseHref({
      query: next.query !== undefined ? next.query : searchQuery.trim(),
      type: next.type !== undefined ? next.type : draft.type,
      genre: next.genre !== undefined ? next.genre : draft.genre,
      country: next.country !== undefined ? next.country : draft.country,
      year: next.year !== undefined ? next.year : draft.year,
      page: next.page !== undefined ? next.page : 1,
    });
    startTransition(() => router.push(href));
  };

  const currentPage = pagination?.currentPage || filters.page || 1;
  const totalPages = Math.min(pagination?.totalPages || 1, MAX_OFFSET_PAGE);
  const appliedChips = [
    filters.query ? `Từ khóa: ${filters.query}` : "",
    filters.type ? findCatalogName(MOVIE_TYPES, filters.type) : "",
    filters.genre ? findCatalogName(MOVIE_GENRES, filters.genre) : "",
    filters.country ? findCatalogName(MOVIE_COUNTRIES, filters.country) : "",
    filters.year ? findCatalogName(MOVIE_YEARS, filters.year) : "",
  ].filter(Boolean);

  return (
    <div>
      <form
        className="mb-6 flex flex-col gap-3 md:flex-row"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          navigate({ query: searchQuery.trim(), page: 1 });
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-foreground/70" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên phim..."
            className="border-foreground/25 bg-card pl-10"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tìm"}
        </Button>
        <Button
          type="button"
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters((v) => !v)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Bộ lọc
        </Button>
      </form>

      {showFilters ? (
        <section className="mb-6 rounded-xl border border-border bg-card/80 p-4 md:p-5">
          <header className="mb-1 flex items-center gap-2 text-foreground">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold">Bộ lọc</h2>
          </header>

          <FilterRow
            label="Quốc gia"
            value={draft.country}
            options={MOVIE_COUNTRIES}
            onChange={(country) => setDraft((prev) => ({ ...prev, country }))}
          />
          <FilterRow
            label="Loại phim"
            value={draft.type}
            options={MOVIE_TYPE_OPTIONS}
            onChange={(type) => setDraft((prev) => ({ ...prev, type }))}
          />
          <FilterRow
            label="Thể loại"
            value={draft.genre}
            options={MOVIE_GENRES}
            onChange={(genre) => setDraft((prev) => ({ ...prev, genre }))}
          />
          <FilterRow
            label="Năm sản xuất"
            value={draft.year}
            options={MOVIE_YEARS}
            onChange={(year) => setDraft((prev) => ({ ...prev, year }))}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              className="rounded-full px-5"
              disabled={isPending}
              onClick={() =>
                navigate({
                  query: searchQuery.trim(),
                  ...draft,
                  page: 1,
                })
              }
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Lọc kết quả
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-5"
              onClick={() => setShowFilters(false)}
            >
              Đóng
            </Button>
          </div>
        </section>
      ) : null}

      {appliedChips.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {appliedChips.map((chip) => (
            <Badge key={chip}>{chip}</Badge>
          ))}
        </div>
      ) : null}

      {isLoadingList ? (
        <PageFallback className="min-h-[30vh]" />
      ) : movies.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          Không tìm thấy phim phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5">
          {movies.map((movie) => (
            <MovieCardApi key={movie.slug} movie={movie} />
          ))}
        </div>
      )}

      {isLoadingList ? null : (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          visiblePages={getVisiblePages(currentPage, totalPages)}
          getPageHref={(page) =>
            buildBrowseHref({
              query: filters.query,
              type: filters.type,
              genre: filters.genre,
              country: filters.country,
              year: filters.year,
              page,
            })
          }
          disabled={isPending}
        />
      )}
    </div>
  );
}
