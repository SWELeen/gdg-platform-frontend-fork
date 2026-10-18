import type { LeaderCommittee, MemberRole } from "./types";
import { leaderDashboardMockData } from "@/data/leader-dashboard";

export interface LeaderCommitteeConfig {
  name: string;
  description: string;
  routeBase: string;
  eventsLabel: string;
  headerSubtitle: string;
  overviewMode: "event-management" | "registration-management";
  canManageEvents: boolean;
  canManageRegistrations: boolean;
  canGrantTemporaryAccess: boolean;
  memberRoleOptions: readonly MemberRole[];
  defaultMemberRole: MemberRole;
  leaderDisplayName: string;
  coLeaderDisplayName: string;
  leaderRoleDescription: string;
  coLeaderRoleDescription: string;
  registrationNotificationTitle: string;
  registrationNotificationDescription: string;
}

export const leaderCommitteeConfig: Record<LeaderCommittee, LeaderCommitteeConfig> = {
  "data-analysis": {
    ...leaderDashboardMockData["data-analysis"],
    routeBase: "/dashboard/data-dashboard",
    eventsLabel: "Events",
    overviewMode: "event-management",
    canManageEvents: false,
    canManageRegistrations: false,
    canGrantTemporaryAccess: true,
    defaultMemberRole: "Data Analyst",
    memberRoleOptions: [
      "Data Analyst",
      "Data Coordinator",
      "Event Data Member",
      "Database Member",
      "Research Member",
    ],
    registrationNotificationTitle: "Notify on new event submissions",
    registrationNotificationDescription:
      "Receive dashboard alerts when committee members submit drafts.",
  },
  pr: {
    ...leaderDashboardMockData.pr,
    routeBase: "/dashboard/pr-dashboard",
    eventsLabel: "Events / Registrations",
    overviewMode: "registration-management",
    canManageEvents: true,
    canManageRegistrations: true,
    canGrantTemporaryAccess: true,
    defaultMemberRole: "Member",
    memberRoleOptions: [
      "Public Relations Co-Lead",
      "Member",
    ],
    registrationNotificationTitle: "Notify on new registrations",
    registrationNotificationDescription:
      "Receive dashboard alerts when an applicant registers for an event.",
  },
};
