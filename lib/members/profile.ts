/** Read-only profile fields returned by the authenticated `/me` endpoint. */
export interface MemberProfile {
  fullName: string;
  initials: string;
  email?: string;
  committee?: string;
  role?: string;
}
