"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/** Default scale when asset has padded decorations around the ring. */
const DEFAULT_IMAGE_FRAME_SCALE = 0.75;

type CosmeticAvatarProps = {
  src?: string;
  alt: string;
  fallback: string;
  frameSrc?: string | null;
  frameScale?: number | null;
  className?: string;
  avatarClassName?: string;
  fallbackClassName?: string;
};

export function CosmeticAvatar({
  src,
  alt,
  fallback,
  frameSrc,
  frameScale,
  className,
  avatarClassName,
  fallbackClassName,
}: CosmeticAvatarProps) {
  const hasImageFrame = Boolean(frameSrc);
  const scale =
    frameScale && frameScale > 0 ? frameScale : DEFAULT_IMAGE_FRAME_SCALE;

  const avatar = (
    <Avatar
      className={cn(
        "border border-border bg-background",
        hasImageFrame && "border-0",
        hasImageFrame ? "relative z-[1] h-full w-full" : avatarClassName,
      )}
    >
      <AvatarImage src={src} alt={alt} />
      <AvatarFallback className={fallbackClassName}>{fallback}</AvatarFallback>
    </Avatar>
  );

  if (!hasImageFrame) {
    return <div className={className}>{avatar}</div>;
  }

  const percent = `${scale * 100}%`;

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-visible",
        avatarClassName,
        className,
      )}
    >
      <div className="relative z-[1] h-full w-full overflow-hidden rounded-full">
        {avatar}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={frameSrc!}
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-[2] max-w-none -translate-x-1/2 -translate-y-1/2 select-none object-contain"
        style={{ width: percent, height: percent }}
      />
    </div>
  );
}
