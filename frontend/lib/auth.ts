const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "visitor" | "client" | "agent" | "admin";
  agency_id: string | null;
}

function isClient() {
  return typeof window !== "undefined";
}

async function login(email: string, password: string): Promise<AuthUser> {
  // Purge any existing session before logging in a new user
  if (isClient()) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("ymmo_user");
    document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
  }

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? "Identifiants invalides");
  }

  const data = await res.json();
  if (isClient()) {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("ymmo_user", JSON.stringify(data.user));
    document.cookie = `access_token=${data.access_token}; path=/; max-age=${30 * 60}; SameSite=Lax`;
  }
  return data.user as AuthUser;
}

async function register(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? "Erreur lors de l'inscription");
  }

  return login(email, password);
}

async function refreshToken(): Promise<boolean> {
  if (!isClient()) return false;
  const token = localStorage.getItem("refresh_token");
  if (!token) return false;

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: token }),
  });

  if (!res.ok) {
    logout();
    return false;
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  document.cookie = `access_token=${data.access_token}; path=/; max-age=${30 * 60}; SameSite=Lax`;
  return true;
}

function logout(): void {
  if (!isClient()) return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("ymmo_user");
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

function getUser(): AuthUser | null {
  if (!isClient()) return null;
  const raw = localStorage.getItem("ymmo_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function getToken(): string | null {
  if (!isClient()) return null;
  return localStorage.getItem("access_token");
}

export const auth = { login, register, logout, refreshToken, getUser, getToken };
