"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Hls from "hls.js";
import {
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Heart,
  List,
} from "lucide-react";
import { MovieCommentsSection } from "@/components/movie-comments-section";
import { Button } from "@/components/ui/button";
import { useBookmarkToggle } from "@/hooks/use-bookmark-toggle";
import {
  episodeHref,
  getServersForEpisode,
  getUniqueEpisodes,
  pickPreferredServer,
  serverStorageKey,
} from "@/lib/player";
import {
  recordEpisodeVisit,
  saveWatchProgress,
} from "@/lib/actions/watch-progress.actions";
import { chipClassName } from "@/lib/chip-class";
import type { MovieDetail } from "@/types/movie-types";

type WatchPlayerClientProps = {
  movie: MovieDetail;
  episodeSlug: string;
  initialBookmarked: boolean;
  initialPositionSeconds: number;
};

const PROGRESS_INTERVAL_MS = 12_000;

export function WatchPlayerClient({
  movie,
  episodeSlug,
  initialBookmarked,
  initialPositionSeconds,
}: WatchPlayerClientProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const recordedVisitRef = useRef(false);
  const restoredRef = useRef(false);
  const [preferredServer, setPreferredServer] = useState<string | null>(null);

  const episodes = useMemo(
    () => getUniqueEpisodes(movie.episodes || []),
    [movie.episodes],
  );
  const serverOptions = useMemo(
    () => getServersForEpisode(movie.episodes || [], episodeSlug),
    [movie.episodes, episodeSlug],
  );
  const active = useMemo(
    () => pickPreferredServer(serverOptions, preferredServer),
    [serverOptions, preferredServer],
  );
  const currentIndex = episodes.findIndex((item) => item.slug === episodeSlug);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex >= 0 && currentIndex < episodes.length - 1
      ? episodes[currentIndex + 1]
      : null;
  const currentEpisode =
    episodes[currentIndex] ||
    active?.source ||
    serverOptions[0]?.source ||
    null;
  const { isBookmarked, isBookmarkLoading, handleBookmarkToggle } =
    useBookmarkToggle({
      initialBookmarked,
      slug: movie.slug,
      movieName: movie.name,
      thumbUrl: movie.thumb_url,
    });

  const persistProgress = useCallback(
    async (positionSeconds: number, durationSeconds: number) => {
      if (!currentEpisode) return;
      await saveWatchProgress({
        movieSlug: movie.slug,
        movieName: movie.name,
        thumbUrl: movie.thumb_url,
        episodeSlug: currentEpisode.slug,
        episodeName: currentEpisode.name,
        positionSeconds,
        durationSeconds,
      });
    },
    [currentEpisode, movie.name, movie.slug, movie.thumb_url],
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(serverStorageKey(movie.slug));
      if (stored) setPreferredServer(stored);
    } catch {
      // ignore
    }
  }, [movie.slug]);

  useEffect(() => {
    recordedVisitRef.current = false;
  }, [episodeSlug]);

  useEffect(() => {
    if (recordedVisitRef.current || !currentEpisode) return;
    recordedVisitRef.current = true;
    const latest = episodes[episodes.length - 1];
    void recordEpisodeVisit({
      movieSlug: movie.slug,
      movieName: movie.name,
      thumbUrl: movie.thumb_url,
      movieUpdatedAt: movie.updatedAt,
      episodeSlug: currentEpisode.slug,
      episodeName: currentEpisode.name,
      latestEpisodeName: latest?.name,
    });
  }, [
    currentEpisode,
    episodes,
    movie.name,
    movie.slug,
    movie.thumb_url,
    movie.updatedAt,
  ]);

  useEffect(() => {
    const video = videoRef.current;
    const m3u8 = active?.source.m3u8 || "";
    restoredRef.current = false;

    const destroyHls = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };

    if (!video || !m3u8) {
      destroyHls();
      return;
    }

    const tryRestore = () => {
      if (restoredRef.current || initialPositionSeconds <= 3) return;
      if (Number.isFinite(video.duration) && video.duration > initialPositionSeconds) {
        video.currentTime = initialPositionSeconds;
        restoredRef.current = true;
      }
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = m3u8;
      video.addEventListener("loadedmetadata", tryRestore);
      return () => {
        video.removeEventListener("loadedmetadata", tryRestore);
        destroyHls();
      };
    }

    if (Hls.isSupported()) {
      destroyHls();
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(m3u8);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, tryRestore);
      return () => {
        destroyHls();
      };
    }

    video.src = m3u8;
    return () => {
      destroyHls();
    };
  }, [active?.source.m3u8, initialPositionSeconds]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active?.source.m3u8) return;

    const onPause = () => {
      void persistProgress(video.currentTime, video.duration || 0);
    };
    video.addEventListener("pause", onPause);
    const timer = window.setInterval(() => {
      if (video.paused) return;
      void persistProgress(video.currentTime, video.duration || 0);
    }, PROGRESS_INTERVAL_MS);

    return () => {
      video.removeEventListener("pause", onPause);
      window.clearInterval(timer);
    };
  }, [active?.source.m3u8, persistProgress]);

  const handleServerChange = (serverName: string) => {
    setPreferredServer(serverName);
    try {
      window.localStorage.setItem(serverStorageKey(movie.slug), serverName);
    } catch {
      // ignore
    }
  };

  const useIframe = Boolean(active?.source.embed) && !active?.source.m3u8;

  return (
    <div className="min-h-screen bg-black/40">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href={`/phim/${movie.slug}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              ← {movie.name}
            </Link>
            <h1 className="mt-1 text-xl font-bold text-foreground md:text-2xl">
              {movie.name} — {currentEpisode?.name || episodeSlug}
            </h1>
          </div>
          <Button
            variant={isBookmarked ? "default" : "outline"}
            className="gap-2"
            onClick={handleBookmarkToggle}
            disabled={isBookmarkLoading}
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            {isBookmarked ? "Đã theo dõi" : "Theo dõi"}
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-black">
          {active?.source.m3u8 ? (
            <video
              ref={videoRef}
              className="aspect-video w-full bg-black"
              controls
              playsInline
              autoPlay
            />
          ) : useIframe ? (
            <iframe
              src={active?.source.embed}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${movie.name} ${currentEpisode?.name || ""}`}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center text-muted-foreground">
              Không tìm thấy nguồn phát.
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {serverOptions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {serverOptions.map((option) => {
                const selected = option.serverName === active?.serverName;
                const label = `${option.serverName}${
                  option.source.m3u8 ? " · HLS" : " · Embed"
                }`;
                return (
                  <button
                    key={option.serverName}
                    type="button"
                    onClick={() => handleServerChange(option.serverName)}
                    className={chipClassName(selected)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
          {prevEpisode ? (
            <Link href={episodeHref(movie.slug, prevEpisode.slug)}>
              <Button variant="outline" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Tập trước
              </Button>
            </Link>
          ) : null}
          {nextEpisode ? (
            <Link href={episodeHref(movie.slug, nextEpisode.slug)}>
              <Button className="gap-2">
                Tập sau
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}
          <Link href={`/phim/${movie.slug}`}>
            <Button variant="ghost" className="gap-2">
              <List className="h-4 w-4" />
              Danh sách tập
            </Button>
          </Link>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Clapperboard className="h-5 w-5 text-primary" />
            Danh sách tập
          </h2>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {episodes.map((episode) => (
              <Link
                key={episode.slug}
                href={episodeHref(movie.slug, episode.slug)}
                className={`rounded-lg border px-2 py-2 text-center text-sm ${
                  episode.slug === episodeSlug
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary"
                }`}
              >
                {episode.name || episode.slug}
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 pb-10">
          <MovieCommentsSection
            movieSlug={movie.slug}
            movieName={movie.name}
            episodeName={currentEpisode?.name || episodeSlug}
          />
        </section>
      </main>
    </div>
  );
}
