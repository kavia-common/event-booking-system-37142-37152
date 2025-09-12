//
// API Client utilities for React frontend
//
// Provides a reusable fetch wrapper with:
// - Base URL from environment (REACT_APP_API_BASE)
// - Standardized error handling and JSON parsing
// - Timeout support
// - Simple GET/POST helpers
// - Domain-specific helpers for this project
//

const DEFAULT_TIMEOUT_MS = 15000;

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the API base URL from environment variables.
   * Falls back to http://localhost:3001 if not set.
   */
  const fromEnv = process.env.REACT_APP_API_BASE;
  return (fromEnv && fromEnv.trim()) || "http://localhost:3001";
}

// Normalize error shape for consistent handling across app
function buildApiError({ status, statusText, url, method, body, error }) {
  return {
    ok: false,
    status: typeof status === "number" ? status : 0,
    statusText: statusText || "",
    url,
    method,
    body,
    errorMessage:
      (error && (error.message || error.toString())) ||
      statusText ||
      "Request failed",
    // raw error for debugging if needed
    error,
  };
}

// PUBLIC_INTERFACE
export async function apiFetch(path, options = {}) {
  /** Core fetch wrapper for API calls.
   * - path: string path or absolute URL
   * - options: {
   *     method, headers, body (object will be JSON.stringified),
   *     signal, timeoutMs, parseJson (default true)
   *   }
   * Returns: { ok, data, status } or throws an Error shaped by buildApiError when network fails
   */
  const {
    method = "GET",
    headers = {},
    body,
    signal,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    parseJson = true,
  } = options;

  const isAbsolute = /^https?:\/\//i.test(path);
  const base = getApiBaseUrl();
  const url = isAbsolute ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  // Setup headers
  const finalHeaders = { ...headers };
  let finalBody = body;

  // If body is a plain object, send JSON
  const isPlainObject =
    body &&
    typeof body === "object" &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer);

  if (isPlainObject) {
    finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
    finalBody = JSON.stringify(body);
  }

  // Timeout handling via AbortController
  const controller = new AbortController();
  let timeoutId;
  if (timeoutMs && !signal) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  // Merge signals if provided
  const finalSignal = signal
    ? (() => {
        // If a signal is provided, aborting either should cancel the request
        signal.addEventListener("abort", () => controller.abort());
        return controller.signal;
      })()
    : controller.signal;

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
      signal: finalSignal,
    });

    let data = null;

    // Try to parse JSON if expected
    if (parseJson) {
      const contentType = res.headers.get("content-type") || "";
      const looksJson = contentType.includes("application/json");
      if (looksJson) {
        try {
          data = await res.json();
        } catch (jsonErr) {
          // JSON parse failed; keep data as null and include message below
          data = null;
        }
      } else {
        // Not JSON; fallback to text for 2xx for potential messages
        try {
          data = await res.text();
        } catch {
          data = null;
        }
      }
    } else {
      // If not parsing JSON, still try text for convenience
      try {
        data = await res.text();
      } catch {
        data = null;
      }
    }

    // Normalize success and failure without throwing on non-2xx
    return {
      ok: res.ok,
      status: res.status,
      data,
      url,
      method,
    };
  } catch (err) {
    // Network or timeout error
    throw buildApiError({
      status: 0,
      statusText: "Network error",
      url,
      method,
      body,
      error: err,
    });
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

// PUBLIC_INTERFACE
export async function apiGet(path, options = {}) {
  /** Convenience GET wrapper */
  return apiFetch(path, { ...options, method: "GET" });
}

// PUBLIC_INTERFACE
export async function apiPost(path, body, options = {}) {
  /** Convenience POST wrapper */
  return apiFetch(path, { ...options, method: "POST", body });
}

// PUBLIC_INTERFACE
export function isApiSuccess(response) {
  /** Returns true if response is non-null and ok === true */
  return Boolean(response && response.ok);
}

// PUBLIC_INTERFACE
export function getApiErrorMessage(responseOrError, fallback = "Something went wrong") {
  /** Extracts a user-friendly error message from either a failed response (non-ok)
   *  or a thrown error shaped by buildApiError.
   */
  if (!responseOrError) return fallback;

  // If it's a thrown error from apiFetch
  if (responseOrError.errorMessage) {
    return responseOrError.errorMessage || fallback;
  }

  // If it's a non-ok response object with data containing message
  if (responseOrError.data) {
    const d = responseOrError.data;
    if (typeof d === "string" && d.trim()) return d;
    if (typeof d === "object") {
      // common error fields
      if (d.detail) return Array.isArray(d.detail) ? d.detail.map(x => x.msg || x).join(", ") : d.detail;
      if (d.message) return d.message;
      if (d.error) return d.error;
    }
  }

  // fallback to status info
  if (responseOrError.status && responseOrError.statusText) {
    return `${responseOrError.status} ${responseOrError.statusText}`;
  }

  return fallback;
}

/* Domain-specific helpers for this project (Event Booking) */

// PUBLIC_INTERFACE
export async function fetchEvents() {
  /** Fetch list of events: GET /events */
  return apiGet("/events");
}

// PUBLIC_INTERFACE
export async function fetchEventById(eventId) {
  /** Fetch event details by ID: GET /events/{id} */
  return apiGet(`/events/${encodeURIComponent(eventId)}`);
}

// PUBLIC_INTERFACE
export async function fetchBookings() {
  /** Fetch all bookings: GET /bookings */
  return apiGet("/bookings");
}

// PUBLIC_INTERFACE
export async function createBooking(payload) {
  /** Create a booking: POST /bookings
   * payload: { event_id, user_name, user_email, seats }
   */
  return apiPost("/bookings", payload);
}

// PUBLIC_INTERFACE
export function getSseUrlForEvent(eventId) {
  /** Returns the SSE URL for seat updates for a specific event */
  const base = getApiBaseUrl();
  return `${base}/events/${encodeURIComponent(eventId)}/stream`;
}
