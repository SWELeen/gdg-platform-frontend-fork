/** Optimistic navigation only. NestJS validates the session and permissions. */
export function loginRedirect(pathname: string, search: string, hasSessionCookie: boolean): string | null {
  if (hasSessionCookie) return null;
  const match = /^\/(en|ar)(\/.*)?$/.exec(pathname);
  if (!match) return null;
  const path = match[2] ?? '/';
  if (!/^\/(dashboard|profile|registrations)(\/|$)/.test(path)) return null;
  return `/${match[1]}/login?returnTo=${encodeURIComponent(path + search)}`;
}
