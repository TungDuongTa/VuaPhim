import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  FALLBACK_MOVIE_POSTER,
  MoviePosterImage,
} from "@/components/movie-poster-image";
import { RelativeTime } from "@/components/relative-time";
import type { MovieCard } from "@/types/movie-types";

interface MovieCardApiProps {
  movie: MovieCard;
  showLatestEpisode?: boolean;
  variant?: "default" | "compact" | "horizontal";
}

export function MovieCardApi({
  movie,
  showLatestEpisode = true,
  variant = "default",
}: MovieCardApiProps) {
  const coverSrc = movie.thumb_url?.trim()
    ? movie.thumb_url
    : FALLBACK_MOVIE_POSTER;
  const latest = String(movie.current_episode || "").trim();
  const href = `/phim/${movie.slug}`;

  if (variant === "horizontal") {
    return (
      <Link href={href} className="group block">
        <div className="flex gap-4 rounded-lg bg-card p-3 transition-colors hover:bg-secondary">
          <div className="relative h-20 w-16 overflow-hidden rounded-md bg-muted">
            <MoviePosterImage
              src={coverSrc}
              alt={movie.name}
              fill
              sizes="64px"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="min-w-0 flex-1 flex-col">
            <h3 className="line-clamp-1 font-medium text-foreground transition-colors group-hover:text-primary">
              {movie.name}
            </h3>
            <Badge
              variant="outline"
              className="mt-1 inline-flex w-fit items-center gap-1 text-xs"
            >
              <Clock className="h-3 w-3" />
              <RelativeTime value={movie.updatedAt} />
            </Badge>
            {showLatestEpisode && (
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {latest || "Đang cập nhật"}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted">
          <MoviePosterImage
            src={coverSrc}
            alt={movie.name}
            fill
            sizes="(max-width: 640px) 50vw, 16vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-2">
            <h3 className="line-clamp-1 text-xs leading-tight font-medium text-white">
              {movie.name}
            </h3>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block">
      <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-xl bg-muted">
        <MoviePosterImage
          src={coverSrc}
          alt={movie.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <Badge
          variant="outline"
          className="absolute top-2 left-2 inline-flex items-center gap-1 border-white/35 bg-black/60 text-xs text-white backdrop-blur-sm"
        >
          <Clock className="h-3 w-3" />
          <RelativeTime value={movie.updatedAt} />
        </Badge>
      </div>
      <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
        {movie.name}
      </h3>
      {showLatestEpisode && (
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {latest || "Đang cập nhật"}
        </p>
      )}
    </Link>
  );
}
