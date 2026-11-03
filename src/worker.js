export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS" && url.pathname === "/api/register") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Handle registration API
    if (url.pathname === "/api/register" && request.method === "POST") {
      try {
        const body = await request.json();

        const googleScriptUrl =
          env.GOOGLE_SCRIPT_URL ||
          env.VITE_GOOGLE_SCRIPT_URL ||
          "https://script.google.com/macros/s/AKfycbzGq1PdZ-ZywqafIlyf6sxbMAPoNKjQOB4EayQ10QVxvMQBqO-rxwFJTbD1j2EnFtFyBQ/exec";

        const secretToken =
          env.REGISTRATION_API_SECRET ||
          env.VITE_REGISTRATION_API_SECRET ||
          "120cc12138f9e2c1795b68487bb577e48d390280a59b73dc44f086d12c63db81";

        // Forward to Google Apps Script with secret token
        const googleResponse = await fetch(googleScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            photoUrl: body.photoUrl || body.pictureLink,
            token: secretToken,
          }),
        });

        const data = await googleResponse.json();

        return new Response(JSON.stringify(data), {
          status: googleResponse.ok ? 200 : 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        return new Response(
          JSON.stringify({
            success: false,
            message: err.message || "Registration processing error",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    // Serve static assets for all other routes
    return env.ASSETS.fetch(request);
  },
};
