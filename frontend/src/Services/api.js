export function getApiBaseUrl() {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
  const isBrowser = typeof window !== "undefined";
  const host = isBrowser ? window.location.hostname : "";
  const isLocal = !isBrowser || host === "localhost" || host === "127.0.0.1";

  if (!isLocal) {
    if (envUrl && !/vercel\.app/i.test(envUrl)) {
      return envUrl;
    }
    return "/backend";
  }

  return envUrl || "http://127.0.0.1:8000";
}

export function htmlApiMisconfigMessage() {
  return "The login request hit the Vercel website instead of the Railway API. On Vercel set BACKEND_URL (and NEXT_PUBLIC_API_URL) to your Railway URL with no trailing slash, then Redeploy.";
}

export async function apiFetch(endpoint, options = {}) {
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${getApiBaseUrl()}${formattedEndpoint}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),

      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),

      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html")) {
    throw new Error(htmlApiMisconfigMessage());
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail || `Request failed with status ${response.status}`
    );
  }

  return data;
}
