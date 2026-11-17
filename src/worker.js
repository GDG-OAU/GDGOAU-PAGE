import { onRequestGet } from "../functions/api/events.js";
import { onRequestGet as onFlyerGet } from "../functions/api/flyer.js";
import { handleRegistration } from "../functions/api/register.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/api/events") {
      if (request.method !== "GET") {
        return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" },
        });
      }
      return onRequestGet({ request, env });
    }
    if (url.pathname === "/api/register") {
      return handleRegistration(request, env);
    }
    if (url.pathname === "/api/flyer" && request.method === "GET") {
      return onFlyerGet({ request, env, waitUntil: (p) => ctx.waitUntil(p) });
    }
    return env.ASSETS.fetch(request);
  },
};
