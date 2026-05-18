const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken =
    typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
  if (!refreshToken) return false;

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) return false;

  const data = await response.json();
  localStorage.setItem("access_token", data.access_token);
  return true;
}

async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (response.status === 401) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      const newToken =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;
      if (newToken) headers["Authorization"] = `Bearer ${newToken}`;
      return fetch(`${API_URL}${path}`, { ...options, headers });
    }
  }

  return response;
}

export const api = {
  get: (path: string) => fetchWithAuth(path, { method: "GET" }),

  post: (path: string, body: unknown) =>
    fetchWithAuth(path, { method: "POST", body: JSON.stringify(body) }),

  put: (path: string, body: unknown) =>
    fetchWithAuth(path, { method: "PUT", body: JSON.stringify(body) }),

  delete: (path: string) => fetchWithAuth(path, { method: "DELETE" }),

  postForm: (path: string, body: FormData): Promise<Response> => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${API_URL}${path}`, { method: "POST", body, headers });
  },
};
