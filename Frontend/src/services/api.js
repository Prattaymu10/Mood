import { API_BASE_URL } from "../config";
import { getToken } from "../utils/auth";
import { trackSlowRequest } from "./apiStatus";

export class ApiError extends Error {
  constructor(message, { status = 0, code = null, data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

// App.jsx registers this: called when a logged-in request gets a 401
// (expired / invalid token) so the user is sent back to the login page.
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

// The backend uses this to decide where "today" starts for the daily limit
const timezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

/**
 * Every request goes through here.
 *  - always resolves to parsed JSON, or throws an ApiError with a readable message
 *  - allowErrorBody: resolve (not throw) when the server answers 4xx/5xx with JSON
 *    (login/signup use it so the form can show the server's message)
 */
async function request(
  path,
  { method = "GET", body, query, token, authed = true, allowErrorBody = false } = {}
) {
  const headers = { "X-Timezone": timezone() };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const bearer = token ?? (authed ? getToken() : null);
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const finish = trackSlowRequest();
  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      `Can't reach the server at ${API_BASE_URL}. Make sure the backend is running (and that VITE_API_BASE_URL is correct if you set it).`,
      { code: "NETWORK" }
    );
  } finally {
    finish();
  }

  const data = await res.json().catch(() => null);
  if (data === null) {
    throw new ApiError(
      `The server at ${API_BASE_URL} sent an unexpected response (HTTP ${res.status}). Check that VITE_API_BASE_URL points to the backend and ends with /api.`,
      { status: res.status, code: "BAD_RESPONSE" }
    );
  }

  if (!res.ok) {
    if (res.status === 401 && authed && bearer && unauthorizedHandler) {
      unauthorizedHandler(data.code);
    }
    if (!allowErrorBody) {
      throw new ApiError(data.message || `Request failed (HTTP ${res.status})`, {
        status: res.status,
        code: data.code,
        data,
      });
    }
  }
  return data;
}

export const authApi = {
  login: (credentials) =>
    request("/auth/login", { method: "POST", body: credentials, authed: false, allowErrorBody: true }),

  signup: (details) =>
    request("/auth/signup", { method: "POST", body: details, authed: false, allowErrorBody: true }),

  // Throws ApiError (status 401) when the token is no longer valid
  verify: (token) => request("/auth/verify", { token, authed: false }),
};

export const moodApi = {
  getDashboard: () => request("/moods/dashboard"),
  getDailyCount: () => request("/moods/daily-count"),
  getInsights: () => request("/moods/insights"),
  list: (query) => request("/moods", { query }),
  add: (body) => request("/moods", { method: "POST", body }),
  update: (id, body) => request(`/moods/${id}`, { method: "PUT", body }),
  remove: (id) => request(`/moods/${id}`, { method: "DELETE" }),
};
