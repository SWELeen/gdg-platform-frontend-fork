import { leaderCommitteeConfig } from "@/components/dashboard/shared/committee-config";
import type { LeaderCommittee } from "@/components/dashboard/shared/types";

export type AuthenticatedIdentity = {
  memberId: number | null;
  roles: string[];
  committees: Array<{ code: string; name?: string; position: string }>;
  membershipRequestPending?: boolean;
};

const DASHBOARD_PATH = /^(?:\/[a-z]{2})?(\/dashboard(?:\/[^?#]*)?)(?:[?#].*)?$/;

export type DashboardWorkspace =
  | { kind: "club" | "developer" | "member"; path: string }
  | { kind: "committee"; path: string; committee: LeaderCommittee };

// Every dashboard the identity may open, highest responsibility first.
export function dashboardWorkspacesFor(identity: AuthenticatedIdentity): DashboardWorkspace[] {
  if (identity.memberId === null) return [];
  const workspaces: DashboardWorkspace[] = [];
  if (identity.roles.includes("GROUP_LEADER") || identity.roles.includes("GROUP_CO_LEADER")) {
    workspaces.push({ kind: "club", path: "/dashboard/club-leadership-dashboard" });
  }
  if (identity.roles.includes("DEVELOPER_COMMITTEES_LEADER")) {
    workspaces.push({ kind: "developer", path: "/dashboard/developer-committees-dashboard" });
  }
  for (const { code, position } of identity.committees) {
    if (position !== "Leader" && position !== "Co-Leader") continue;
    const entry = Object.entries(leaderCommitteeConfig).find(([, config]) => config.committeeCode === code);
    if (entry) workspaces.push({ kind: "committee", path: entry[1].routeBase, committee: entry[0] as LeaderCommittee });
  }
  workspaces.push({ kind: "member", path: "/dashboard/members-dashboard" });
  return workspaces;
}

export function dashboardPathsFor(identity: AuthenticatedIdentity): string[] {
  return dashboardWorkspacesFor(identity).map(({ path }) => path);
}

// Someone with no dashboard either waits for a membership decision or is a
// non-member who uses the public site to join events.
export function dashboardPathFor(identity: AuthenticatedIdentity) {
  return dashboardPathsFor(identity)[0] ?? (identity.membershipRequestPending ? "/signup/pending" : "/");
}

// A login return path is kept only when this identity can open it, so signing in
// with another account never lands on the previous account's dashboard.
export function canReturnTo(path: string, identity: AuthenticatedIdentity) {
  const dashboard = DASHBOARD_PATH.exec(path)?.[1];
  if (!dashboard) return true;
  return dashboardPathsFor(identity).some((base) => dashboard === base || dashboard.startsWith(`${base}/`));
}
