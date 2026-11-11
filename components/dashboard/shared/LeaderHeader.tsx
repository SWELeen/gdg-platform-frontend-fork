"use client";

import { usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { committeeTranslationKeys, leaderCommitteeConfig } from "./committee-config";
import type { LeaderCommittee } from "./types";
import { useLeaderDashboard } from "./LeaderDashboardContext";
import { apiRequest } from "@/lib/api/client";
import { SidebarCollapseToggle } from "./DashboardSidebar";

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
  let pageTitle = developerCommitteesLeader ? leadershipT("developerTitle") : clubLeadership ? leadershipT("groupTitle") : t("nav.overview");
  if (pathname.startsWith(`${routeRoot}/events`)) {
    pageTitle = t(committee === "pr" ? "nav.eventRegistrations" : "nav.events");
  } else if (pathname.startsWith(`${routeRoot}/members`)) pageTitle = t("nav.members");
  else if (pathname.startsWith(`${routeRoot}/tasks`)) pageTitle = t("nav.tasks");
  else if (pathname.startsWith(`${routeRoot}/points`)) pageTitle = t("nav.points");
  else if (pathname.startsWith(`${routeRoot}/settings`)) pageTitle = t("nav.settings");
  else if (clubLeadership && pathname.startsWith(`${routeRoot}/announcements`)) pageTitle = leadershipT("announcementsTitle");

  return (
    <div className="border-b border-border bg-surface px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-row items-center justify-between gap-3">
        {/* Left: sidebar toggle & Title */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-foreground/70 transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground lg:hidden"
            aria-label={t("nav.openSidebar")}
          >
            <Menu className="size-5" />
          </button>
          <SidebarCollapseToggle className="max-lg:hidden" />
          <span className="mx-1 h-4 w-px self-center bg-border max-lg:hidden" aria-hidden="true" />

          <div className="min-w-0">
            <h1 className="break-words text-[clamp(1.35rem,1rem+1.4vw,1.875rem)] font-semibold text-foreground">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right: Profile Info */}
        <div className="flex min-w-0 shrink-0 items-center gap-3 sm:ms-auto">
          {/* Profile Card */}
          <div className="flex min-w-0 max-w-full items-center gap-2.5 rounded-full border-0 bg-transparent p-0 sm:rounded-lg sm:border sm:border-border sm:bg-surface-muted/50 sm:px-3 sm:py-1.5 sm:transition-colors sm:hover:bg-surface-muted">
              <div role="img" aria-label={displayName || pageTitle} title={displayName || undefined} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-avatar-bg text-sm font-semibold text-foreground ring-2 ring-surface sm:ring-0">
              {leaderInitials}
            </div>
            <div className="hidden min-w-0 text-start sm:block">
              <span className="block truncate text-xs font-semibold leading-tight text-foreground">
                {displayName}
              </span>
              <span className="block truncate text-[10px] leading-tight text-muted">
                {developerCommitteesLeader ? leadershipT("developerTitle") : clubLeadership ? leadershipT("groupTitle") : t(`nav.${committeeTranslationKeys[committee]}`)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
