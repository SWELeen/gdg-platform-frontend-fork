import { leaderCommitteeConfig } from "@/components/dashboard/shared/committee-config";

export type AuthenticatedIdentity = {
  memberId: number | null;
  roles: string[];
  committees: Array<{ code: string; position: string }>;
};

const DASHBOARD_PATH = /^(?:\/[a-z]{2})?(\/dashboard(?:\/[^?#]*)?)(?:[?#].*)?$/;

// Every dashboard the identity may open, highest responsibility first.
export function dashboardPathsFor(identity: AuthenticatedIdentity): string[] {
  if (identity.memberId === null) return [];
  const paths: string[] = [];
  if (identity.roles.includes("GROUP_LEADER") || identity.roles.includes("GROUP_CO_LEADER")) {
    paths.push("/dashboard/club-leadership-dashboard");
  }
  if (identity.roles.includes("DEVELOPER_COMMITTEES_LEADER")) {
    paths.push("/dashboard/developer-committees-dashboard");
  }
  for (const { code, position } of identity.committees) {
    if (position !== "Leader" && position !== "Co-Leader") continue;
    const config = Object.values(leaderCommitteeConfig).find(({ committeeCode }) => committeeCode === code);
    if (config) paths.push(config.routeBase);
  }
  paths.push("/dashboard/members-dashboard");
  return paths;
}

export function dashboardPathFor(identity: AuthenticatedIdentity) {
  return dashboardPathsFor(identity)[0] ?? "/signup/pending";
}

// A login return path is kept only when this identity can open it, so signing in
// with another account never lands on the previous account's dashboard.
export function canReturnTo(path: string, identity: AuthenticatedIdentity) {
  const dashboard = DASHBOARD_PATH.exec(path)?.[1];
  if (!dashboard) return true;
  return dashboardPathsFor(identity).some((base) => dashboard === base || dashboard.startsWith(`${base}/`));
}
