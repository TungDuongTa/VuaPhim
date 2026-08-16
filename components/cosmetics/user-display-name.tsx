"use client";

import { resolveUsernameEffectClassName } from "@/lib/cosmetics/display";
import type { UserCosmeticsPublic } from "@/lib/cosmetics/types";
import { cn } from "@/lib/utils";

type UserDisplayNameProps = {
  name: string;
  cosmetics?: UserCosmeticsPublic | null;
  className?: string;
  nameClassName?: string;
};

export function UserDisplayName({
  name,
  cosmetics,
  className,
  nameClassName,
}: UserDisplayNameProps) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      <span
        className={cn(
          "truncate font-semibold tracking-wide",
          resolveUsernameEffectClassName(cosmetics),
          nameClassName,
        )}
      >
        {name}
      </span>
    </span>
  );
}
