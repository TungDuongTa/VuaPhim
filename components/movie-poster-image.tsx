"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

export const FALLBACK_MOVIE_POSTER =
  "https://placehold.co/300x450/111827/9CA3AF?text=No+Poster";

type MoviePosterImageProps = Omit<ImageProps, "src" | "onError"> & {
  src?: string | null;
  fallbackSrc?: string;
};

export function MoviePosterImage({
  src,
  fallbackSrc = FALLBACK_MOVIE_POSTER,
  alt,
  sizes,
  priority,
  preload,
  loading,
  decoding,
  ...props
}: MoviePosterImageProps) {
  const normalized = String(src || "").trim() || fallbackSrc;
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const currentSrc = failedFor === normalized ? fallbackSrc : normalized;
  const isPriority = Boolean(priority || preload);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      sizes={sizes ?? (props.fill ? "100vw" : undefined)}
      priority={priority}
      preload={preload}
      loading={loading ?? (isPriority ? "eager" : "lazy")}
      decoding={decoding ?? (isPriority ? "sync" : "async")}
      onError={() => {
        if (normalized !== fallbackSrc) setFailedFor(normalized);
      }}
    />
  );
}
