import { fetchCommunityCalendarEvents } from "../../src/server/notionCalendar.js";

export async function onRequestGet(context) {
  try {
    const events = await fetchCommunityCalendarEvents(context.env);
    return new Response(
      JSON.stringify({
        ok: true,
        source: "notion-api",
        fetchedAt: new Date().toISOString(),
        events,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60, s-maxage=120",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error?.message || "Failed to fetch events from Notion.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
