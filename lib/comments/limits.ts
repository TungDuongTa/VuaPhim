export const COMMENT_MAX_LENGTH = 1000;
export const COMMENT_MAX_DEPTH = 1;

export const COMMENT_DUPLICATE_WINDOW_MS = 60_000;

export const COMMENT_CREATE_RATE = {
  windowMs: 60_000,
  max: 5,
  label: "1 phút",
} as const;

export const COMMENT_CREATE_HOURLY_RATE = {
  windowMs: 60 * 60 * 1000,
  max: 40,
  label: "1 giờ",
} as const;

export const COMMENT_LIKE_RATE = {
  windowMs: 60_000,
  max: 40,
  label: "1 phút",
} as const;
