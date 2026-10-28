"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { apiRequest } from "@/lib/api/client";
import { dashboardPathFor, dashboardWorkspacesFor, type AuthenticatedIdentity } from "@/lib/auth/dashboard-route";
import type { LeaderCommittee } from "./types";
import { leaderCommitteeConfig } from "./committee-config";

type Requirement =
  | { kind: "member" }
  | { kind: "committee-leader"; committee: LeaderCommittee }
  | { kind: "global-role"; roles: string[] };

export function DashboardAccessGate({ requirement, children }: { requirement: Requirement; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const requirementKey = JSON.stringify(requirement);

  useEffect(() => {
    const requested = JSON.parse(requirementKey) as Requirement;
    let active = true;
    void apiRequest<AuthenticatedIdentity>("/me").then((result) => {
      if (!active) return;
      if (!result.ok) {
        router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
        setReady(true);
        return;
      }
      const identity = result.data;
      const hasAccess = requested.kind === "member"
        ? identity.memberId !== null && dashboardWorkspacesFor(identity).some(({ kind }) => kind === "member")
        : requested.kind === "global-role"
          ? identity.memberId !== null && requested.roles.some((role) => identity.roles.includes(role))
          : identity.memberId !== null && identity.committees.some((item) =>
              item.code === leaderCommitteeConfig[requested.committee].committeeCode &&
              ["Leader", "Co-Leader"].includes(item.position),
            );
      setAllowed(hasAccess);
      setReady(true);
      if (!hasAccess) router.replace(dashboardPathFor(identity));
    }).catch(() => {
      if (!active) return;
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
      setReady(true);
    });
    return () => { active = false; };
  }, [requirementKey, pathname, router]);

  if (!ready || !allowed) return <main className="flex min-h-screen items-center justify-center" aria-busy="true"><span className="sr-only">Checking dashboard access</span></main>;
  return children;
}
