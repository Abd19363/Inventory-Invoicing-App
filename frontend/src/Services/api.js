// Remove any trailing slashes from the base URL
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = RAW_API_URL.replace(/\/+$/, "");

export async function apiFetch(endpoint, options = {}) {
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // Ensure endpoint starts with a single leading slash
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${formattedEndpoint}`;

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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.detail || `Request failed with status ${response.status}`
    );
  }

  return data;
}