"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { resetWindowScroll } from "@/lib/reset-window-scroll";

export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    resetWindowScroll();
    const frame = window.requestAnimationFrame(() => resetWindowScroll());
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, query]);

  return null;
}
