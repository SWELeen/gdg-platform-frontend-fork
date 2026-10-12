// MOCK DATA — demonstration only. There is no approved achievements/leaderboard API contract yet
// (see docs/api-integration.md). Scoping to the user's committee and excluding leaders is done
// client-side here for display and is NOT access control; the backend must own that.

export interface AchievementMember {
  id: string;
  name: string;
  initials: string;
  committeeId: string;
  /** Leaders are excluded from the member leaderboard. */
  isLeader: boolean;
  points: number;
}

/** Mock reference for the logged-in user; matches `currentUser` in ../mock-data.ts. */
export const mockCurrentUserId = "m-1";
export const mockCurrentCommitteeId = "web";

export const achievementMembers: AchievementMember[] = [
  { id: "m-1", name: "Leen Kharraz", initials: "LK", committeeId: "web", isLeader: false,   points: 420 },
    { id: "m-2", name: "Leen Alghamdi", initials: "WI", committeeId: "web", isLeader: true, points: 900 },
    { id: "m-3", name: "Sara Nasser", initials: "SN", committeeId: "web", isLeader: false, points: 510 },
    { id: "m-4", name: "Yazan Khalil", initials: "YK", committeeId: "web", isLeader: false, points: 40 },
    { id: "m-13", name: "Lina Barakat", initials: "LB", committeeId: "web", isLeader: false, points: 365 },
    { id: "m-14", name: "Fadi Qasem", initials: "FQ", committeeId: "web", isLeader: false, points: 280 },
    { id: "m-15", name: "Aya Mustafa", initials: "AM", committeeId: "web", isLeader: false, points: 150 },
    { id: "m-5", name: "Dana Mansour", initials: "DM", committeeId: "mobile", isLeader: false, points: 610 },
    { id: "m-6", name: "Khaled Abbas", initials: "KA", committeeId: "mobile", isLeader: true, points: 840 },
];
