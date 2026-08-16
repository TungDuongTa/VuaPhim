const UPSTREAM_ORIGIN = "https://phim.nguonc.com";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export interface Env {
  PROXY_SECRET: string;
}

const proxyHeaders = (): Headers => {
  const headers = new Headers();
  headers.set("x-vuaphim-proxy", "1");
  headers.set("cache-control", "no-store");
  return headers;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return Response.json(
        { error: "method not allowed" },
        { status: 405, headers: proxyHeaders() },
      );
    }

    const provided = request.headers.get("x-vuaphim-proxy-key") || "";
    if (!env.PROXY_SECRET || provided !== env.PROXY_SECRET) {
      return Response.json(
        { error: "unauthorized" },
        { status: 401, headers: proxyHeaders() },
      );
    }

    const incoming = new URL(request.url);
    if (!incoming.pathname.startsWith("/api/")) {
      return Response.json(
        { error: "not found" },
        { status: 404, headers: proxyHeaders() },
      );
    }

    const target = new URL(incoming.pathname + incoming.search, UPSTREAM_ORIGIN);
    const upstream = await fetch(target, {
      method: request.method,
      redirect: "follow",
      headers: {
        Accept: "application/json,text/plain,*/*",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
        "User-Agent": USER_AGENT,
        Referer: "https://phim.nguonc.com/",
      },
    });

    const contentType = upstream.headers.get("content-type") || "";
    if (
      !upstream.ok &&
      contentType.includes("text/html")
    ) {
      const body = (await upstream.text()).replace(/\s+/g, " ").trim().slice(0, 180);
      return Response.json(
        {
          error: "upstream_blocked",
          status: upstream.status,
          cfRay: upstream.headers.get("cf-ray"),
          body,
        },
        { status: 502, headers: proxyHeaders() },
      );
    }

    const headers = new Headers(upstream.headers);
    headers.delete("set-cookie");
    headers.set("x-vuaphim-proxy", "1");
    headers.set("cache-control", "no-store");

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    });
  },
} satisfies ExportedHandler<Env>;
