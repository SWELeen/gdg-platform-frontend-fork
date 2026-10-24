"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { apiRequest } from "@/lib/api/client";
import type { LeaderCommittee } from "./types";
import { leaderCommitteeConfig } from "./committee-config";

type DashboardIdentity = {
  memberId: number | null;
  roles: string[];
  committees: Array<{ code: string; position: string }>;
};

type Requirement =
  | { kind: "member" }
  | { kind: "committee-leader"; committee: LeaderCommittee }
  | { kind: "global-role"; roles: string[] };

export function DashboardAccessGate({ requirement, children }: { requirement: Requirement; children: ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const requirementKey = JSON.stringify(requirement);

  useEffect(() => {
    const requested = JSON.parse(requirementKey) as Requirement;
    let active = true;
    void apiRequest<DashboardIdentity>("/me").then((result) => {
      if (!active) return;
      if (!result.ok) {
        router.replace("/login");
        setReady(true);
        return;
      }
      const identity = result.data;
      const hasAccess = requested.kind === "member"
        ? identity.memberId !== null
        : requested.kind === "global-role"
          ? identity.memberId !== null && requested.roles.some((role) => identity.roles.includes(role))
          : identity.memberId !== null && identity.committees.some((item) =>
              item.code === leaderCommitteeConfig[requested.committee].committeeCode &&
              ["Leader", "Co-Leader"].includes(item.position),
            );
      setAllowed(hasAccess);
      setReady(true);
      if (!hasAccess) router.replace(identity.memberId ? "/dashboard/members-dashboard" : "/signup/pending");
    }).catch(() => {
      if (!active) return;
      router.replace("/login");
      setReady(true);
    });
    return () => { active = false; };
  }, [requirementKey, router]);

  if (!ready || !allowed) return <main className="flex min-h-screen items-center justify-center" aria-busy="true"><span className="sr-only">Checking dashboard access</span></main>;
  return children;
}
