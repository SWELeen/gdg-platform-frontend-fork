const SESSION_KEY = "gdg_api_session";

export interface ApiSession {
  accessToken: string;
  expiresAt: number | null;
}

export function saveApiSession(session: ApiSession) {
  void session;
  if (typeof window !== "undefined") window.sessionStorage.removeItem(SESSION_KEY);
}

export function getApiAccessToken() {
  if (typeof window === "undefined") return null;
  window.sessionStorage.removeItem(SESSION_KEY);
  return null;
}

export function clearApiSession() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(SESSION_KEY);
}
