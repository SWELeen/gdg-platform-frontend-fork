"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { sidebarPrimaryItems, sidebarSecondaryItems } from "@/components/dashboard/mock-data";
import {
  DashboardSidebarAside,
  SidebarCollapseToggle,
  SidebarNavLink,
} from "@/components/dashboard/shared/DashboardSidebar";
import { sidebarIcons } from "./nav-icons";
import { isSidebarItemActive  } from "./nav-utils";

// Desktop (lg+) only — the collapsible vertical text+icon sidebar (collapses to an icon rail).
// Below lg, `MembersCompactNav` takes over instead.
export function MembersSidebar(): ReactElement {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");

  return (
    <DashboardSidebarAside>
      <div className="px-3 py-4">
        <div className="mb-3 flex justify-end         group-data-[collapsed=true]/sidebar:justify-center">
          <SidebarCollapseToggle />
        </div>

        <nav aria-label={t("sectionsLabel")} className="flex flex-col gap-1">
          {sidebarPrimaryItems.map((item) => (
            <SidebarNavLink
              key={item.id}
              href={item.href}
              label={t(`items.${item.id}`)}
              Icon={sidebarIcons[item.id]}
              active={isSidebarItemActive(pathname, item)}
            />
          ))}
        </nav>

        <div className="my-4 border-t border-border" />

        <nav aria-label={t("accountLabel")} className="flex flex-col gap-1">
          {sidebarSecondaryItems.map((item) => (
            <SidebarNavLink
              key={item.id}
              href={item.href}
              label={t(`items.${item.id}`)}
              Icon={sidebarIcons[item.id]}
              active={isSidebarItemActive(pathname, item)}
              muted
            />
          ))}
        </nav>
      </div>
    </DashboardSidebarAside>
  );
}