"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleMovieBookmark } from "@/lib/actions/bookmark.actions";

export const useBookmarkToggle = ({
  initialBookmarked,
  slug,
  movieName,
  thumbUrl,
  signInPath = "/sign-in",
}: {
  initialBookmarked: boolean;
  slug: string;
  movieName?: string;
  thumbUrl?: string;
  signInPath?: string;
}) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  useEffect(() => {
    setIsBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const handleBookmarkToggle = useCallback(async () => {
    if (isBookmarkLoading) return;
    setIsBookmarkLoading(true);
    try {
      const result = await toggleMovieBookmark({ slug, movieName, thumbUrl });
      if (!result.success) {
        toast.error(result.message);
        if (result.requiresSignIn) router.push(signInPath);
        return;
      }
      setIsBookmarked(result.bookmarked);
      toast.success(result.message);
    } catch {
      toast.error("Could not update bookmark. Please try again.");
    } finally {
      setIsBookmarkLoading(false);
    }
  }, [isBookmarkLoading, slug, movieName, thumbUrl, router, signInPath]);

  return { isBookmarked, isBookmarkLoading, handleBookmarkToggle };
};
