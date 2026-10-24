export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

const SESSION_KEY = 'gdg.auth.session';

export function readAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const session = JSON.parse(value) as Partial<AuthSession>;
    return typeof session.accessToken === 'string' && typeof session.refreshToken === 'string'
      ? session as AuthSession
      : null;
  } catch {
    return null;
  }
}

export function storeAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_KEY);
}
