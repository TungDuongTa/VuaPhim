export const normalizeCallbackUrl = (value?: string | null): string => {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
};
