"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  FALLBACK_MOVIE_POSTER,
  MoviePosterImage,
} from "@/components/movie-poster-image";
import { Badge } from "@/components/ui/badge";
import type { MovieCard } from "@/types/movie-types";

export type HomeCarouselSectionData = {
  title: string;
  href: string;
  movies: MovieCard[];
};

function CarouselMovieCard({ movie }: { movie: MovieCard }) {
  const coverSrc = movie.thumb_url?.trim() || movie.poster_url?.trim() || FALLBACK_MOVIE_POSTER;
  const origin = (movie.origin_name || []).filter(Boolean).join(", ");
  const episode = String(movie.current_episode || "").trim();
  const quality = String(movie.quality || "").trim();
  const language = String(movie.language || "").trim();

  return (
    <Link href={`/phim/${movie.slug}`} className="group block">
      <div className="relative mb-2.5 aspect-video overflow-hidden rounded-xl bg-muted">
        <MoviePosterImage
          src={coverSrc}
          alt={movie.name}
          fill
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 32vw, 24vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] flex-wrap gap-1">
          {episode ? (
            <Badge className="border-transparent bg-primary/90 text-[10px] text-primary-foreground shadow-sm">
              {episode}
            </Badge>
          ) : null}
          {quality ? (
            <Badge
              variant="secondary"
              className="border-white/10 bg-black/65 text-[10px] text-white backdrop-blur-sm"
            >
              {quality}
            </Badge>
          ) : null}
          {language ? (
            <Badge
              variant="secondary"
              className="border-white/10 bg-black/65 text-[10px] text-white backdrop-blur-sm"
            >
              {language}
            </Badge>
          ) : null}
        </div>
      </div>
      <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
        {movie.name}
      </h3>
      {origin ? (
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{origin}</p>
      ) : null}
    </Link>
  );
}

export function HomeMovieCarousel({
  title,
  href,
  movies,
}: HomeCarouselSectionData) {
  if (movies.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
      <div className="shrink-0 md:w-40 lg:w-44">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-[1.7rem] md:leading-tight">
          <span className="brand-pink-mask">{title}</span>
        </h2>
        <Link
          href={href}
          className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Xem toàn bộ
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <Carousel
        opts={{ align: "start", dragFree: true, skipSnaps: true }}
        className="min-w-0 flex-1 overflow-visible"
      >
        <CarouselContent className="-ml-3">
          {movies.map((movie) => (
            <CarouselItem
              key={movie.slug}
              className="basis-[70%] pl-3 sm:basis-[46%] md:basis-[32%] lg:basis-[24%] xl:basis-[22%]"
            >
              <CarouselMovieCard movie={movie} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          variant="default"
          className="top-[32%] left-0 z-20 size-11 -translate-x-1/2 rounded-full border-2 border-white bg-primary text-primary-foreground shadow-[0_4px_18px_rgb(0_0_0/0.55)] hover:bg-primary/90 hover:text-primary-foreground disabled:hidden dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 [&_svg]:size-6"
        />
        <CarouselNext
          variant="default"
          className="top-[32%] right-0 z-20 size-11 translate-x-1/2 rounded-full border-2 border-white bg-primary text-primary-foreground shadow-[0_4px_18px_rgb(0_0_0/0.55)] hover:bg-primary/90 hover:text-primary-foreground disabled:hidden dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 [&_svg]:size-6"
        />
      </Carousel>
    </section>
  );
}
