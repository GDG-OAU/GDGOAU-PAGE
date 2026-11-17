import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fetchCommunityCalendarEvents, fetchFlyerImage } from "./src/server/notionCalendar.js";
import { handleRegistration } from "./functions/api/register.js";

function notionCalendarApiPlugin(env) {
  const handleEventsRequest = async (req, res, next) => {
    const url = req.url ? req.url.split("?")[0] : "";
    if (url === "/api/register") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const request = new Request("http://localhost/api/register", {
        method: req.method,
        headers: { "Content-Type": "text/plain" },
        body: req.method === "POST" ? Buffer.concat(chunks) : undefined,
      });
      const response = await handleRegistration(request, env);
      res.statusCode = response.status;
      res.setHeader("Content-Type", "application/json");
      res.end(await response.text());
      return;
    }
    if (url === "/api/flyer") {
      try {
        const id = new URL(req.url, "http://localhost").searchParams.get("id") || "";
        const image = await fetchFlyerImage(env, id);
        if (!image) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", image.headers.get("content-type"));
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.end(Buffer.from(await image.arrayBuffer()));
      } catch {
        res.statusCode = 502;
        res.end("Flyer unavailable");
      }
      return;
    }
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
