"use client";

import { formatRelativeTime } from "@/lib/date-time";

type RelativeTimeProps = {
  value: string;
  locale?: string;
};

/** Client island: SSR text stays instant; ignore second-level Date.now() drift. */
export function RelativeTime({ value, locale }: RelativeTimeProps) {
  return (
    <span suppressHydrationWarning>
      {formatRelativeTime(value, locale)}
    </span>
  );
}
