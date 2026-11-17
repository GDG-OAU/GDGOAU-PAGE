import { fetchFlyerImage } from "../../src/server/notionCalendar.js";

const LONG_CACHE = "public, max-age=31536000, immutable";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const id = url.searchParams.get("id") || "";

  // The URL carries the page's last-edited time, so a cached copy stays correct until the flyer changes.
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const cacheKey = new Request(url.toString(), { method: "GET" });
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  try {
    const image = await fetchFlyerImage(context.env, id);
    if (!image) return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=300" } });

    const response = new Response(image.body, {
      status: 200,
      headers: {
        "Content-Type": image.headers.get("content-type"),
        "Cache-Control": LONG_CACHE,
        "X-Content-Type-Options": "nosniff",
      },
    });
    if (cache) context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  } catch {
    return new Response("Flyer unavailable", { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
