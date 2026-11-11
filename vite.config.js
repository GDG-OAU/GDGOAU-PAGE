import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fetchCommunityCalendarEvents } from "./src/server/notionCalendar.js";

function notionCalendarApiPlugin(env) {
  const handleEventsRequest = async (req, res, next) => {
    const url = req.url ? req.url.split("?")[0] : "";
    if (url !== "/api/events") {
      return next();
    }

    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
      return;
    }

    try {
      const events = await fetchCommunityCalendarEvents(env);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.end(
        JSON.stringify({
          ok: true,
          source: "notion-api",
          fetchedAt: new Date().toISOString(),
          events,
        })
      );
    } catch (error) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ok: false,
          error: error?.message || "Failed to fetch events from Notion.",
        })
      );
    }
  };

  return {
    name: "notion-calendar-api",
    configureServer(server) {
      server.middlewares.use(handleEventsRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleEventsRequest);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), notionCalendarApiPlugin(env)],
  };
});
