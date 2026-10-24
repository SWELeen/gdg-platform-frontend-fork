"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { committeeTranslationKeys, leaderCommitteeConfig } from "./committee-config";
import {
  LayoutDashboard,
  Calendar,
  Users,
  CheckSquare,
  Trophy,
  Settings,
  X,
} from "lucide-react";

interface LeaderSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  committee?: import("./types").LeaderCommittee;
}

export function LeaderSidebar({
  mobileOpen = false,
  onCloseMobile,
  committee = "data-analysis",
}: LeaderSidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("dashboard.leader");
  const config = leaderCommitteeConfig[committee];
  const basePath = config.routeBase;
  const navItems = [
    { id: "overview", label: t("nav.overview"), href: basePath, icon: LayoutDashboard },
    { id: "events", label: t(committee === "pr" ? "nav.eventRegistrations" : "nav.events"), href: `${basePath}/events`, icon: Calendar },
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
    <div className="flex h-full flex-col justify-between p-4 text-foreground">
      <div>
        {/* Workspace Pill Card */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-surface-muted/60 p-3 shadow-2xs">
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
              {t("nav.leaderWorkspace")}
            </span>
            <span className="mt-0.5 block text-sm font-semibold text-foreground">
              {t(`nav.${committeeTranslationKeys[committee]}`)}
            </span>
          </div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 text-muted hover:text-foreground lg:hidden"
              aria-label={t("nav.closeMenu")}
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div>
          <span className="block px-3 text-[11px] font-bold uppercase tracking-wider text-muted">
            {t("nav.workspace")}
          </span>

          <nav className="mt-2 flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-s-4 border-gdg-blue bg-surface-muted ps-2.5 font-semibold text-foreground"
                      : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    className={`size-4.5 shrink-0 transition-colors ${
                      active ? "text-gdg-blue" : "text-muted group-hover:text-foreground"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) matching member dashboard sidebar */}
      <aside className="hidden w-60 shrink-0 border-e border-border bg-surface lg:block self-stretch">
        {navContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 h-full w-72 border-e border-border bg-surface shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
