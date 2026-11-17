const KEY = "gdgoau:events:v1";
const MAX_AGE = 7 * 24 * 3600 * 1000;

function readCache() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { at, events } = JSON.parse(raw);
    if (!Array.isArray(events) || Date.now() - at > MAX_AGE) return null;
    return events;
  } catch {
    return null;
  }
}

function writeCache(events) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), events }));
  } catch {
    /* storage full or blocked: caching is optional */
  }
}

/* Stale-while-revalidate: calls onData with the saved copy at once (if any), then again with fresh data.
   Flyer URLs are stable, so the browser reuses its cached images either way. Resolves with the fresh events. */
export async function loadEvents(onData) {
  const cached = readCache();
  if (cached && onData) onData(cached, true);

  const response = await fetch("/api/events", { headers: { Accept: "application/json" }, cache: "no-store" });
  const type = response.headers.get("content-type") || "";
  if (!type.includes("application/json")) {
    throw new Error("Calendar API endpoint (/api/events) did not return JSON. Ensure Cloudflare Pages Functions are deployed.");
  }
  const payload = await response.json();
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load events from Notion.");

  writeCache(payload.events || []);
  if (onData) onData(payload.events || [], false);
  return payload.events || [];
}
