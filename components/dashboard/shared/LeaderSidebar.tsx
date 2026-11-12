"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  DashboardMobileDrawer,
  DashboardSidebarAside,
  SidebarNavLink,
  SidebarSectionLabel,
  useSidebarCollapsed,
} from "./DashboardSidebar";
import { committeeTranslationKeys, leaderCommitteeConfig } from "./committee-config";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  Trophy,
  Settings,
  X,
  ClipboardCheck,
  Megaphone,
  ShieldAlert,
} from "lucide-react";

interface LeaderSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  committee?: import("./types").LeaderCommittee;
  developerCommitteesLeader?: boolean;
  clubLeadership?: boolean;
}

export function LeaderSidebar({
  mobileOpen = false,
  onCloseMobile,
  committee = "data-analysis",
  developerCommitteesLeader = false,
  clubLeadership = false,
}: LeaderSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.leader");
  const config = leaderCommitteeConfig[committee];
  const basePath = developerCommitteesLeader ? "/dashboard/developer-committees-dashboard" : clubLeadership ? "/dashboard/club-leadership-dashboard" : config.routeBase;
  const leadershipT = useTranslations("dashboard.leadershipDashboard");
  const navItems = developerCommitteesLeader ? [
    { id: "overview", label: t("nav.overview"), href: basePath, icon: LayoutDashboard },
    { id: "tasks", label: t("nav.tasks"), href: `${basePath}/tasks`, icon: CheckSquare },
    { id: "points", label: t("nav.points"), href: `${basePath}/points`, icon: Trophy },
    { id: "approvals", label: leadershipT("approvalNavigation"), href: `${basePath}#leadership-approvals-title`, icon: ClipboardCheck },
  ] : clubLeadership ? [
    { id: "overview", label: t("nav.overview"), href: basePath, icon: LayoutDashboard },
    { id: "announcements", label: leadershipT("announcementsTitle"), href: `${basePath}/announcements`, icon: Megaphone },
    { id: "members", label: t("nav.members"), href: `${basePath}/members`, icon: Users },
    { id: "tasks", label: t("nav.tasks"), href: `${basePath}/tasks`, icon: CheckSquare },
    { id: "points", label: t("nav.points"), href: `${basePath}/points`, icon: Trophy },
    { id: "settings", label: t("nav.settings"), href: `${basePath}/settings`, icon: Settings },
    { id: "approvals", label: leadershipT("approvalNavigation"), href: `${basePath}#leadership-approvals-title`, icon: ClipboardCheck },
  ] : [
    { id: "overview", label: t("nav.overview"), href: basePath, icon: LayoutDashboard },
    { id: "events", label: t(committee === "pr" ? "nav.eventRegistrations" : "nav.events"), href: `${basePath}/events`, icon: Calendar },
    ...(committee === "pr" ? [{ id: "blacklist", label: t("nav.blacklist"), href: `${basePath}/blacklist`, icon: ShieldAlert }] : []),
    { id: "members", label: t("nav.members"), href: `${basePath}/members`, icon: Users },
    { id: "tasks", label: t("nav.tasks"), href: `${basePath}/tasks`, icon: CheckSquare },
    { id: "points", label: t("nav.points"), href: `${basePath}/points`, icon: Trophy },
    { id: "settings", label: t("nav.settings"), href: `${basePath}/settings`, icon: Settings },
  ];

  const isItemActive = (href: string) => {
    if (href === basePath) {
      return pathname === basePath || pathname === `${basePath}/`;
    }
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-3 text-foreground">
      <div>
        {/* Workspace Pill Card (hidden, not unmounted, while the desktop rail is collapsed) */}
        <WorkspaceCard
          title={t("nav.leaderWorkspace")}
          onCloseMobile={onCloseMobile}
          closeLabel={t("nav.closeMenu")}
        >
          <WorkspaceSwitcher
            className="mt-1 w-full"
            fallback={
              <span className="mt-0.5 block text-sm font-semibold text-foreground">
                {developerCommitteesLeader ? leadershipT("developerTitle") : clubLeadership ? leadershipT("groupTitle") : t(`nav.${committeeTranslationKeys[committee]}`)}
              </span>
            }
          />
        </WorkspaceCard>

        {/* Navigation Section */}
        <div>
          <SidebarSectionLabel>{t("nav.workspace")}</SidebarSectionLabel>

          <nav className="mt-2 flex flex-col gap-1">
            {navItems.map((item) => (
              <SidebarNavLink
                key={item.id}
                href={item.href}
                label={item.label}
                Icon={item.icon}
                active={isItemActive(item.href)}
                onClick={onCloseMobile}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (collapsible) matching member dashboard sidebar */}
      <DashboardSidebarAside>{navContent}</DashboardSidebarAside>

      {/* Mobile Drawer (Overlay) */}
      <DashboardMobileDrawer open={mobileOpen} onClose={onCloseMobile}>
        {navContent}
      </DashboardMobileDrawer>
    </>
  );
}

function WorkspaceCard({
  title,
  children,
  onCloseMobile,
  closeLabel,
}: {
  title: string;
  children: ReactNode;
  onCloseMobile?: () => void;
  closeLabel: string;
}) {
  const [collapsed] = useSidebarCollapsed();

  return (
    <div
      className={`mb-4 items-center justify-between rounded-lg border border-border bg-surface-muted/60 p-3 ${
        collapsed ? "flex lg:hidden" : "flex"
      }`}
    >
      <div className="min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">{title}</span>
        {children}
      </div>
      {onCloseMobile && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="cursor-pointer rounded-full p-1 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground lg:hidden"
          aria-label={closeLabel}
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}
