import { BrowsePageClient } from "@/components/browse-page-client";
import { getBrowseMovies } from "@/lib/actions/movie.actions";
import type { BrowseFilters } from "@/lib/browse-params";

export async function BrowseCatalogPage({ filters }: { filters: BrowseFilters }) {
  const listResult = await getBrowseMovies(filters);
  const movies = listResult?.items || [];
  const pagination = listResult?.pagination || null;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Khám phá thư viện phim
          </h1>
          <p className="text-muted-foreground">
            Phim bộ, phim lẻ và TV shows mới cập nhật mỗi ngày tại VuaPhim
          </p>
        </div>
        <BrowsePageClient movies={movies} pagination={pagination} filters={filters} />
      </main>
    </div>
  );
}
