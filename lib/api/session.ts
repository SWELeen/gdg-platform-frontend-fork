const SESSION_KEY = "gdg_api_session";

export interface ApiSession {
  accessToken: string;
  expiresAt: number | null;
}

export function saveApiSession(session: ApiSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getApiAccessToken() {
  if (typeof window === "undefined") return null;
  try {
    const session = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) ?? "null") as ApiSession | null;
    if (!session?.accessToken) return null;
    if (session.expiresAt && Date.now() >= session.expiresAt * 1000) {
      window.sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session.accessToken;
  } catch {
    window.sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearApiSession() {
  if (typeof window !== "undefined") window.sessionStorage.removeItem(SESSION_KEY);
}
