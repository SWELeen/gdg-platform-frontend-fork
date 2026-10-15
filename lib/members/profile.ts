import { currentUser } from "@/components/dashboard/mock-data";

/** What the member dashboard shows about the signed-in member. Fields are optional
 * because the future authenticated profile API may not provide all of them. */
export interface MemberProfile {
  fullName: string;
  initials: string;
  email?: string;
  committee?: string;
  role?: string;
  /** True while the profile comes from demo data rather than an authenticated session. */
  isDemo: boolean;
}

// TEMPORARY: no authenticated profile API is published yet, so this maps the member
// dashboard's demo user. The demo user has no email address, so none is shown.
// Replace the body with the documented endpoint when it exists.
export async function getCurrentMemberProfile(): Promise<MemberProfile> {
  return {
    fullName: currentUser.name,
    initials: currentUser.initials,
    committee: currentUser.role,
    role: currentUser.membership,
    isDemo: true,
  };
}
