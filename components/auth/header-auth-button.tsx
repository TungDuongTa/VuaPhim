"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CosmeticAvatar } from "@/components/cosmetics/cosmetic-avatar";
import { getCurrentUserCosmeticsPublic } from "@/lib/actions/cosmetics.actions";
import { COSMETICS_UPDATED_EVENT } from "@/lib/cosmetics/events";
import {
  EMPTY_COSMETICS_PUBLIC,
  type UserCosmeticsPublic,
} from "@/lib/cosmetics/types";
import { authClient } from "@/lib/better-auth/auth-client";

export function HeaderAuthButton() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [cosmetics, setCosmetics] = useState<UserCosmeticsPublic>(
    EMPTY_COSMETICS_PUBLIC,
  );

  useEffect(() => {
    if (!user?.id) {
      setCosmetics(EMPTY_COSMETICS_PUBLIC);
      return;
    }

    let cancelled = false;

    const loadCosmetics = async () => {
      const next = await getCurrentUserCosmeticsPublic();
      if (!cancelled) setCosmetics(next);
    };

    void loadCosmetics();

    const onCosmeticsUpdated = () => {
      void loadCosmetics();
    };

    window.addEventListener(COSMETICS_UPDATED_EVENT, onCosmeticsUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener(COSMETICS_UPDATED_EVENT, onCosmeticsUpdated);
    };
  }, [user?.id, pathname]);

  if (isPending) {
    return (
      <div
        className="h-9 w-9 animate-pulse rounded-full bg-secondary"
        aria-hidden="true"
      />
    );
  }

  if (user) {
    const userInitial =
      user.name?.charAt(0).toUpperCase() ??
      user.email?.charAt(0).toUpperCase() ??
      "U";

    return (
      <Link
        href="/profile"
        aria-label="View profile"
        className="relative z-10 inline-flex overflow-visible"
      >
        <CosmeticAvatar
          src={user.image || undefined}
          alt={user.name || "User"}
          fallback={userInitial}
          frameSrc={cosmetics.avatarFrameSrc}
          frameScale={cosmetics.avatarFrameScale}
          avatarClassName="h-9 w-9"
          fallbackClassName="text-sm"
        />
      </Link>
    );
  }

  return (
    <Link href="/sign-in">
      <Button variant="secondary" size="sm" className="gap-2">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Đăng nhập</span>
      </Button>
    </Link>
  );
}
