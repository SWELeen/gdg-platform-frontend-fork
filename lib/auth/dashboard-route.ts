import { leaderCommitteeConfig } from "@/components/dashboard/shared/committee-config";

export type AuthenticatedIdentity = {
  memberId: number | null;
  roles: string[];
  committees: Array<{ code: string; position: string }>;
};

export function dashboardPathFor(identity: AuthenticatedIdentity) {
  if (identity.roles.includes("GROUP_LEADER") || identity.roles.includes("GROUP_CO_LEADER")) {
    return "/dashboard/club-leadership-dashboard";
  }
  if (identity.roles.includes("DEVELOPER_COMMITTEES_LEADER")) {
    return "/dashboard/developer-committees-dashboard";
  }
  const committeeLeader = identity.committees.find(({ position }) => position === "Leader" || position === "Co-Leader");
  if (committeeLeader) {
    const config = Object.values(leaderCommitteeConfig).find(({ committeeCode }) => committeeCode === committeeLeader.code);
    if (config) return config.routeBase;
  }
  return identity.memberId ? "/dashboard/members-dashboard" : "/signup/pending";
}
