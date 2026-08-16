const DEFAULT_BASE = "https://phim.nguonc.com/api";
const FETCH_TIMEOUT_MS = 12_000;

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const isBrowser = () => typeof window !== "undefined";

const getBaseUrl = (): string => {
  if (isBrowser()) {
    return DEFAULT_BASE;
  }

  return String(process.env.NGUONC_API_BASE || DEFAULT_BASE).replace(/\/+$/, "");
};

export async function nguoncFetch<T>(path: string): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const proxySecret = isBrowser()
    ? ""
    : String(process.env.NGUONC_PROXY_SECRET || "").trim();
  const usingProxy = !isBrowser() && getBaseUrl().includes("workers.dev");

  if (usingProxy && !proxySecret) {
    throw new Error(
      "NGUONC_API_BASE points at the Worker proxy but NGUONC_PROXY_SECRET is missing",
    );
  }

  try {
    const headers: Record<string, string> = {
      Accept: "application/json,text/plain,*/*",
    };

    if (!isBrowser()) {
      headers["Accept-Language"] = "vi-VN,vi;q=0.9,en;q=0.8";
      headers["User-Agent"] = USER_AGENT;
      headers.Referer = "https://phim.nguonc.com/";
      if (proxySecret) {
        headers["x-vuaphim-proxy-key"] = proxySecret;
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const body = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 400);
      const details = {
        url,
        status: response.status,
        server: response.headers.get("server"),
        cfRay: response.headers.get("cf-ray"),
        cfCacheStatus: response.headers.get("cf-cache-status"),
        contentType: response.headers.get("content-type"),
        proxy: response.headers.get("x-vuaphim-proxy"),
        body,
      };
      console.error("NguonC request failed:", details);
      throw new Error(
        `NguonC ${response.status} for ${path} server=${details.server || "-"} cf-ray=${details.cfRay || "-"} body=${body || "-"}`,
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
