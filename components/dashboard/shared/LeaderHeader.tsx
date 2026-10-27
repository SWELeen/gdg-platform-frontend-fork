"use client";

import { usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { committeeTranslationKeys, leaderCommitteeConfig } from "./committee-config";
import type { LeaderCommittee } from "./types";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { apiRequest } from "@/lib/api/client";

interface LeaderHeaderProps {
  onOpenMobileMenu?: () => void;
  committee?: LeaderCommittee;
  developerCommitteesLeader?: boolean;
  clubLeadership?: boolean;
}

export function LeaderHeader({
  onOpenMobileMenu,
  committee = "data-analysis",
  developerCommitteesLeader = false,
  clubLeadership = false,
}: LeaderHeaderProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.leader");
  const leadershipT = useTranslations("dashboard.leadershipDashboard");
  const config = leaderCommitteeConfig[committee];
  const { currentMember } = useLeaderDashboard();
  const [identityName, setIdentityName] = useState("");
  useEffect(() => {
    if (!developerCommitteesLeader || currentMember?.name) return;
    let active = true;
    void apiRequest<{ fullName: string }>("/me").then((result) => {
      if (active && result.ok) setIdentityName(result.data.fullName);
    });
    return () => { active = false; };
  }, [currentMember?.name, developerCommitteesLeader]);
  const routeRoot = developerCommitteesLeader ? "/dashboard/developer-committees-dashboard" : clubLeadership ? "/dashboard/club-leadership-dashboard" : config.routeBase;
  const displayName = currentMember?.name ?? identityName;
  const leaderInitials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  // Determine current section title based on pathname
  let pageTitle = developerCommitteesLeader ? leadershipT("developerTitle") : clubLeadership ? leadershipT("clubTitle") : t("nav.overview");
  if (pathname.startsWith(`${routeRoot}/events`)) {
    pageTitle = t(committee === "pr" ? "nav.eventRegistrations" : "nav.events");
  } else if (pathname.startsWith(`${routeRoot}/members`)) pageTitle = t("nav.members");
  else if (pathname.startsWith(`${routeRoot}/tasks`)) pageTitle = t("nav.tasks");
  else if (pathname.startsWith(`${routeRoot}/points`)) pageTitle = t("nav.points");
  else if (pathname.startsWith(`${routeRoot}/settings`)) pageTitle = t("nav.settings");

  return (
    <div className="border-b border-border bg-surface px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Mobile hamburger & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-1.5 text-foreground/70 hover:text-foreground lg:hidden"
            aria-label={t("nav.openSidebar")}
          >
            <Menu className="size-5" />
          </button>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Profile Info */}
        <div className="flex items-center gap-3">
          {/* Profile Card */}
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-muted/50 px-3 py-1.5">
              <div className="flex size-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-200">
              {leaderInitials}
            </div>
            <div className="text-start">
              <span className="block text-xs font-semibold text-foreground leading-tight">
                {displayName}
              </span>
              <span className="block text-[10px] text-muted leading-tight">
                {developerCommitteesLeader ? leadershipT("developerTitle") : clubLeadership ? leadershipT("clubTitle") : t(`nav.${committeeTranslationKeys[committee]}`)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
