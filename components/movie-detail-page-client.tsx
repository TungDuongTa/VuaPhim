"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Clapperboard,
  Eye,
  Heart,
  Play,
  Share2,
} from "lucide-react";
import { MovieCommentsSection } from "@/components/movie-comments-section";
import { MoviePosterImage } from "@/components/movie-poster-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBookmarkToggle } from "@/hooks/use-bookmark-toggle";
import { buildBrowseHref } from "@/lib/browse-params";
import { formatRelativeTime } from "@/lib/date-time";
import { formatViewCount } from "@/lib/format";
import { episodeHref, getUniqueEpisodes } from "@/lib/player";
import { toast } from "sonner";
import {
  formatEpisodeCount,
  formatMovieType,
  type MovieDetail,
  type NamedSlug,
} from "@/types/movie-types";

type MovieDetailPageClientProps = {
  slug: string;
  movie: MovieDetail;
  initialTotalViews: number;
  initialBookmarked?: boolean;
  lastEpisodeSlug?: string | null;
};

export function MovieDetailPageClient({
  slug,
  movie,
  initialTotalViews,
  initialBookmarked = false,
  lastEpisodeSlug = null,
}: MovieDetailPageClientProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [episodesOrder, setEpisodesOrder] = useState<"desc" | "asc">("asc");
  const [isSharing, setIsSharing] = useState(false);

  const episodes = useMemo(
    () => getUniqueEpisodes(movie.episodes || []),
    [movie.episodes],
  );
  const sortedEpisodes = useMemo(
    () =>
      episodesOrder === "desc" ? [...episodes].reverse() : [...episodes],
    [episodes, episodesOrder],
  );
  const latestEpisode = episodes.length > 0 ? episodes[episodes.length - 1] : null;
  const continueEpisode =
    episodes.find((item) => item.slug === lastEpisodeSlug) ||
    episodes[0] ||
    null;
  const movieHref = `/phim/${movie.slug || slug}`;
  const { isBookmarked, isBookmarkLoading, handleBookmarkToggle } =
    useBookmarkToggle({
      initialBookmarked,
      slug: movie.slug || slug,
      movieName: movie.name,
      thumbUrl: movie.thumb_url,
    });

  const episodeCountLabel = formatEpisodeCount(
    movie.current_episode,
    movie.total_episodes,
    episodes.length,
  );

  const handleShare = async () => {
    if (isSharing) return;
    const shareUrl = window.location.href;
    const shareData = {
      title: movie.name,
      text: `Xem phim ${movie.name} tại VuaPhim`,
      url: shareUrl,
    };
    setIsSharing(true);
    try {
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Đã sao chép liên kết phim");
        return;
      }
      toast.error("Không thể chia sẻ phim lúc này.");
    } catch {
      toast.error("Không thể chia sẻ phim lúc này.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <main>
        <div className="relative h-64 overflow-hidden md:h-80">
          <MoviePosterImage
            src={movie.poster_url || movie.thumb_url}
            alt=""
            fill
            sizes="100vw"
            className="scale-110 object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto -mt-40 max-w-7xl px-4">
          <div className="flex flex-col gap-8 md:flex-row">
            <div className="shrink-0">
              <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden rounded-xl bg-muted shadow-2xl shadow-primary/20 md:mx-0 md:w-56">
                <MoviePosterImage
                  src={movie.thumb_url || movie.poster_url}
                  alt={movie.name}
                  fill
                  sizes="(max-width: 768px) 192px, 224px"
                  className="object-cover"
                  preload
                />
              </div>
            </div>

            <div className="flex-1 pt-4 md:pt-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">
                  {formatMovieType(movie.type)}
                </Badge>
                {movie.quality ? (
                  <Badge variant="secondary">{movie.quality}</Badge>
                ) : null}
                {movie.language ? (
                  <Badge variant="outline">{movie.language}</Badge>
                ) : null}
                {movie.year ? <Badge variant="outline">{movie.year}</Badge> : null}
              </div>

              <h1 className="mb-2 text-balance text-3xl font-bold text-foreground md:text-4xl">
                {movie.name}
              </h1>

              {movie.origin_name.length > 0 && (
                <p className="mb-4 text-muted-foreground">
                  {movie.origin_name.join(", ")}
                </p>
              )}

              <div className="mb-6 flex flex-wrap items-center gap-4">
                {episodeCountLabel ? (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clapperboard className="h-5 w-5" />
                    <span>{episodeCountLabel}</span>
                  </span>
                ) : null}
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="h-5 w-5" />
                  <span>{formatViewCount(initialTotalViews)} lượt xem</span>
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{formatRelativeTime(movie.updatedAt)}</span>
                </span>
              </div>

              <dl className="mb-6 grid gap-2 text-sm sm:grid-cols-[8.5rem_1fr]">
                {episodeCountLabel ? (
                  <MetaRow label="Số tập">{episodeCountLabel}</MetaRow>
                ) : null}
                {movie.duration ? (
                  <MetaRow label="Thời lượng">{movie.duration}</MetaRow>
                ) : null}
                {movie.category.length > 0 ? (
                  <MetaRow label="Thể loại">
                    <MetaChipList
                      items={movie.category}
                      hrefFor={(item) => buildBrowseHref({ genre: item.slug })}
                    />
                  </MetaRow>
                ) : null}
                {movie.countries.length > 0 ? (
                  <MetaRow label="Quốc gia">
                    <MetaChipList
                      items={movie.countries}
                      hrefFor={(item) =>
                        buildBrowseHref({ country: item.slug })
                      }
                    />
                  </MetaRow>
                ) : null}
                {movie.year ? (
                  <MetaRow label="Năm phát hành">
                    <Link
                      href={buildBrowseHref({ year: movie.year })}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {movie.year}
                    </Link>
                  </MetaRow>
                ) : null}
                {movie.director.length > 0 ? (
                  <MetaRow label="Đạo diễn">
                    <span className="font-medium text-foreground">
                      {movie.director.join(", ")}
                    </span>
                  </MetaRow>
                ) : null}
                {movie.casts.length > 0 ? (
                  <MetaRow label="Diễn viên">
                    <span className="font-medium text-foreground">
                      {movie.casts.join(", ")}
                    </span>
                  </MetaRow>
                ) : null}
              </dl>

              <div className="flex flex-wrap gap-3">
                {continueEpisode && (
                  <Link href={episodeHref(movie.slug || slug, continueEpisode.slug)}>
                    <Button size="lg" className="gap-2">
                      <Play className="h-4 w-4" />
                      {lastEpisodeSlug ? "Xem tiếp" : "Xem ngay"}
                    </Button>
                  </Link>
                )}
                {latestEpisode && latestEpisode.slug !== continueEpisode?.slug && (
                  <Link href={episodeHref(movie.slug || slug, latestEpisode.slug)}>
                    <Button size="lg" variant="outline" className="gap-2">
                      <Clapperboard className="h-4 w-4" />
                      Tập mới nhất
                    </Button>
                  </Link>
                )}
                <Button
                  size="lg"
                  variant={isBookmarked ? "default" : "outline"}
                  className="gap-2"
                  onClick={handleBookmarkToggle}
                  disabled={isBookmarkLoading}
                >
                  <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                  {isBookmarkLoading
                    ? "Đang lưu..."
                    : isBookmarked
                      ? "Đã theo dõi"
                      : "Theo dõi"}
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="gap-2"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  <Share2 className="h-4 w-4" />
                  {isSharing ? "Đang chia sẻ..." : "Chia sẻ"}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              Giới thiệu
            </h2>
            <div
              className={`leading-relaxed text-muted-foreground ${!isDescriptionExpanded ? "line-clamp-3" : ""}`}
              dangerouslySetInnerHTML={{
                __html: movie.description || "Chưa có mô tả",
              }}
            />
            {movie.description && movie.description.length > 200 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-primary"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              >
                {isDescriptionExpanded ? (
                  <>
                    <ChevronUp className="mr-1 h-4 w-4" />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-1 h-4 w-4" />
                    Xem thêm
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="mt-8">
            <Tabs defaultValue="episodes">
              <TabsList className="h-auto w-full flex-wrap justify-start rounded-xl border border-border bg-card p-1">
                <TabsTrigger value="episodes" className="gap-2">
                  <Clapperboard className="h-4 w-4" />
                  Danh sách tập: {episodes.length}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="episodes" className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    Các tập phim
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() =>
                      setEpisodesOrder(episodesOrder === "desc" ? "asc" : "desc")
                    }
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    {episodesOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
                  </Button>
                </div>
                <div className="grid max-h-[500px] grid-cols-3 gap-2 overflow-y-auto rounded-xl border border-border bg-card p-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {sortedEpisodes.map((episode) => {
                    const isCurrent = episode.slug === lastEpisodeSlug;
                    return (
                      <Link
                        key={episode.slug}
                        href={episodeHref(movie.slug || slug, episode.slug)}
                        className={`rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors ${
                          isCurrent
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:bg-secondary"
                        }`}
                      >
                        <span className="inline-flex items-center justify-center gap-1">
                          {episode.name || episode.slug}
                          {isCurrent ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <section className="mt-8 pb-12">
            <MovieCommentsSection
              movieSlug={movie.slug || slug}
              movieName={movie.name || ""}
            />
          </section>
        </div>
      </main>
    </div>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}

function MetaChipList({
  items,
  hrefFor,
}: {
  items: NamedSlug[];
  hrefFor: (item: NamedSlug) => string;
}) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <Link key={item.id || item.slug} href={hrefFor(item)}>
          <Badge
            variant="secondary"
            className="cursor-pointer hover:bg-secondary/80"
          >
            {item.name}
          </Badge>
        </Link>
      ))}
    </span>
  );
}
