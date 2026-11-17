/* Registration proxy. The browser posts the form here; the shared token is added on the server,
   so it never ships in the public JavaScript. */

const REQUIRED = ["fullName", "department", "email", "phone", "pictureLink", "birthday", "interest"];
const MAX_BODY = 8 * 1024;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export async function handleRegistration(request, env = {}) {
  if (request.method !== "POST") return json({ success: false, message: "Method not allowed" }, 405);

  // Prefer the server-only names. The VITE_ names are accepted only so an older setup keeps working.
  const scriptUrl = env.GOOGLE_SCRIPT_URL || env.VITE_GOOGLE_SCRIPT_URL;
  const token = env.REGISTRATION_API_SECRET || env.VITE_REGISTRATION_API_SECRET;
  if (!scriptUrl || !token) return json({ success: false, message: "Registration is not configured." }, 500);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ success: false, message: "Request too large." }, 413);

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ success: false, message: "Invalid request." }, 400);
  }
  if (!data || typeof data !== "object" || REQUIRED.some((k) => typeof data[k] !== "string" || !data[k].trim())) {
    return json({ success: false, message: "Please complete all required fields." }, 400);
  }

  const payload = {
    fullName: data.fullName.trim(),
    department: data.department.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    pictureLink: data.pictureLink.trim(),
    photoUrl: data.pictureLink.trim(),
    birthdayPhotoConsent: Boolean(data.birthdayPhotoConsent),
    birthday: data.birthday.trim(),
    interest: data.interest.trim(),
    token,
  };

  try {
    const upstream = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      redirect: "follow",
      body: JSON.stringify(payload),
    });
    const text = await upstream.text();
    try {
      const result = JSON.parse(text);
      return json(
        result.success
          ? { success: true }
          : { success: false, message: result.message || "Registration could not be completed." },
        result.success ? 200 : 400
      );
    } catch {
      // Apps Script sometimes answers with a plain page on success.
      return upstream.ok
        ? json({ success: true })
        : json({ success: false, message: "Registration could not be completed." }, 502);
    }
  } catch {
    return json({ success: false, message: "Could not reach the registration service. Please try again." }, 502);
  }
}

export const onRequestPost = (context) => handleRegistration(context.request, context.env);
