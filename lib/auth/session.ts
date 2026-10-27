export interface AuthSession {
  authenticated?: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  universityEmailVerificationRequired?: boolean;
  registrationPendingApproval?: boolean;
}

const SESSION_KEY = 'gdg.auth.session';

export function readAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const value = window.sessionStorage.getItem(SESSION_KEY);
  if (value === 'authenticated') return { authenticated: true };
  if (value) window.sessionStorage.removeItem(SESSION_KEY);
  return null;
}

export function storeAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  if (session.authenticated !== false) window.sessionStorage.setItem(SESSION_KEY, 'authenticated');
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(SESSION_KEY);
}
