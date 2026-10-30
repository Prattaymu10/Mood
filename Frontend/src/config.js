// Where the backend lives.
//  - npm run dev   -> http://localhost:5000/api  (no .env needed)
//  - deployed      -> set VITE_API_BASE_URL (e.g. on Vercel), must end with /api
// A malformed value (quotes, a doubled "VITE_API_BASE_URL=", a missing /api)
// is repaired instead of silently breaking every request.

const LOCAL_DEFAULT = "http://localhost:5000/api";
const HOSTED_DEFAULT = "https://moodtracker-backend-0o3c.onrender.com/api";

function clean(value) {
  if (!value) return null;
  let v = String(value).trim().replace(/^["']+|["']+$/g, "");
  v = v.replace(/^(VITE_API_BASE_URL\s*=\s*)+/i, "").trim();
  if (!/^https?:\/\//i.test(v)) return null;
  v = v.replace(/\/+$/, "");
  return v.endsWith("/api") ? v : `${v}/api`;
}

const raw = import.meta.env.VITE_API_BASE_URL;
const cleaned = clean(raw);

if (raw && !cleaned) {
  console.warn(`VITE_API_BASE_URL ("${raw}") is not a valid URL, ignoring it.`);
}

export const API_BASE_URL =
  cleaned || (import.meta.env.DEV ? LOCAL_DEFAULT : HOSTED_DEFAULT);
