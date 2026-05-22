import Cookies from "js-cookie";

const TOKEN_KEY = "assettrack_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || Cookies.get(TOKEN_KEY) || null;
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  Cookies.set(TOKEN_KEY, token, { expires: 1, sameSite: "strict" });
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  Cookies.remove(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
