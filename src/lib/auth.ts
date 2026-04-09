const AUTH_URL = "https://functions.poehali.dev/20b27f3b-3d77-49d7-9a2f-69026f4328a2";
const TOKEN_KEY = "om_token";

export interface User {
  id: number;
  name: string;
  email: string;
  city?: string;
  phone?: string;
  about?: string;
}

async function call(action: string, body?: object, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${AUTH_URL}/?action=${action}`, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function register(name: string, email: string, password: string, city: string): Promise<{ token: string; user: User }> {
  return call("register", { name, email, password, city });
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  return call("login", { email, password });
}

export async function getMe(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  const data = await call("me", undefined, token);
  return data.user;
}

export async function logout() {
  const token = getToken();
  if (token) await call("logout", {}, token).catch(() => {});
  clearToken();
}

export async function updateProfile(data: { name: string; city?: string; phone?: string; about?: string }): Promise<User> {
  const token = getToken();
  if (!token) throw new Error("Не авторизован");
  const res = await call("update", data, token);
  return res.user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Не авторизован");
  await call("change_password", { current_password: currentPassword, new_password: newPassword }, token);
}