"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { apiRequest } from "@/lib/api/client";
import { dashboardWorkspacesFor, type AuthenticatedIdentity, type DashboardWorkspace } from "@/lib/auth/dashboard-route";
import { committeeTranslationKeys } from "./committee-config";

// Lets someone with several roles move between their dashboards. The list comes
// from /me, and every dashboard still checks access on its own.
export function WorkspaceSwitcher({ fallback = null, className = "" }: { fallback?: ReactNode; className?: string }) {
  const t = useTranslations("common.workspaces");
  const leadershipT = useTranslations("dashboard.leadershipDashboard");
  const leaderT = useTranslations("dashboard.leader");
  const pathname = usePathname();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<DashboardWorkspace[]>([]);

  useEffect(() => {
    let active = true;
    void apiRequest<AuthenticatedIdentity>("/me").then((result) => {
      if (active && result.ok) setWorkspaces(dashboardWorkspacesFor(result.data));
    });
    return () => { active = false; };
  }, []);

  if (workspaces.length < 2) return fallback;

  const label = (workspace: DashboardWorkspace) => {
    if (workspace.kind === "club") return leadershipT("groupTitle");
    if (workspace.kind === "developer") return leadershipT("developerTitle");
    if (workspace.kind === "committee") return leaderT(`nav.${committeeTranslationKeys[workspace.committee]}`);
    return t("memberDashboard");
  };
  const current = workspaces.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`));

  return (
    <select
      value={current?.path ?? ""}
      onChange={(event) => router.push(event.target.value)}
      aria-label={t("label")}
      className={`max-w-full cursor-pointer rounded-md border border-border bg-surface px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-blue-500 ${className}`}
    >
      {!current && <option value="" disabled>{t("label")}</option>}
      {workspaces.map((workspace) => (
        <option key={workspace.path} value={workspace.path}>{label(workspace)}</option>
      ))}
    </select>
  );
}
