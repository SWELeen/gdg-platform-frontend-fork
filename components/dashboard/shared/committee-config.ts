import type { LeaderCommittee, MemberRole } from "./types";
import { leaderDashboardMockData } from "@/data/leader-dashboard";

export interface LeaderCommitteeConfig {
  name: string;
  description: string;
  routeBase: string;
  committeeCode: string;
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

export const committeeTranslationKeys: Record<LeaderCommittee, string> = {
  pr: "committeePR",
  "data-analysis": "committeeData",
  "content-writing": "committeeContentWriting",
  "web-development": "committeeWebDevelopment",
  "automation-ai": "committeeAutomation",
  "artificial-intelligence": "committeeAI",
  "robotics-iot": "committeeRoboticsIot",
  cybersecurity: "committeeCybersecurity",
  "digital-media-design": "committeeDigitalMediaDesign",
};

function makeGeneralCommitteeConfig(
  committee: Exclude<LeaderCommittee, "data-analysis" | "pr">,
  route: string,
  code: string,
): LeaderCommitteeConfig {
  return {
    ...leaderDashboardMockData[committee],
    routeBase: `/dashboard/${route}`,
    committeeCode: code,
    eventsLabel: "Events",
    overviewMode: "event-management",
    canManageEvents: false,
    canManageRegistrations: false,
    canGrantTemporaryAccess: true,
    defaultMemberRole: "Member",
    memberRoleOptions: ["Member", "Leader"],
    registrationNotificationTitle: "Notify on new submissions",
    registrationNotificationDescription: "Receive dashboard alerts when committee members submit work.",
  };
}

export const leaderCommitteeConfig: Record<LeaderCommittee, LeaderCommitteeConfig> = {
  "data-analysis": {
    ...leaderDashboardMockData["data-analysis"],
    routeBase: "/dashboard/data-dashboard",
    committeeCode: "DATA",
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
    committeeCode: "PR",
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
  "content-writing": makeGeneralCommitteeConfig("content-writing", "content-writing-dashboard", "CONTENT"),
  "web-development": makeGeneralCommitteeConfig("web-development", "web-development-dashboard", "WEB"),
  "automation-ai": makeGeneralCommitteeConfig("automation-ai", "automation-ai-dashboard", "AUTOMATION"),
  "artificial-intelligence": makeGeneralCommitteeConfig("artificial-intelligence", "artificial-intelligence-dashboard", "AI"),
  "robotics-iot": makeGeneralCommitteeConfig("robotics-iot", "robotics-iot-dashboard", "ROBOTICS"),
  cybersecurity: makeGeneralCommitteeConfig("cybersecurity", "cybersecurity-dashboard", "CYBER"),
  "digital-media-design": makeGeneralCommitteeConfig("digital-media-design", "digital-media-design-dashboard", "DMD"),
};
