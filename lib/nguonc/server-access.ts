export function canFetchNguoncOnServer(): boolean {
  return process.env.VERCEL !== "1";
}
