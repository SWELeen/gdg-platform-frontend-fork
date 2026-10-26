"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import {
  sidebarPrimaryItems,
  sidebarSecondaryItems,
} from "@/components/dashboard/mock-data";
import { MembersUserInfo } from "./MembersUserInfo";
import { isSidebarItemActive } from "./nav-utils";

const navItems = [...sidebarPrimaryItems, ...sidebarSecondaryItems];

// Title comes from the nav item matching the current route (same matching as the sidebar and
// compact nav); no match means no title. Rendered as the page's only <h1>.
export function MembersPageHeader(): ReactElement {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const activeItem = navItems.find((item) => isSidebarItemActive(pathname, item));

  return (
    <header className="flex items-center justify-between gap-3">
      {activeItem && (
        <h1 className="min-w-0 text-2xl font-semibold text-foreground sm:text-3xl">
          {t(`items.${activeItem.id}`)}
        </h1>
      )}
      <div className="ms-auto shrink-0">
        <MembersUserInfo />
      </div>
    </header>
  );
}
