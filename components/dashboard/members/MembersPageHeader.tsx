"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import {
  sidebarPrimaryItems,
  sidebarSecondaryItems,
} from "@/components/dashboard/mock-data";
import { WorkspaceSwitcher } from "@/components/dashboard/shared/WorkspaceSwitcher";
import { MembersUserInfo } from "./MembersUserInfo";
import { isSidebarItemActive } from "./nav-utils";
import { useMemberWorkspace } from "./MemberWorkspaceContext";

const navItems = [...sidebarPrimaryItems, ...sidebarSecondaryItems];

// Title comes from the nav item matching the current route (same matching as the sidebar and
// compact nav); no match means no title. Rendered as the page's only <h1>.
export function MembersPageHeader(): ReactElement {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const activeItem = navItems.find((item) => isSidebarItemActive(pathname, item));
  const { committees, selectedCommittee, selectCommittee } = useMemberWorkspace();

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border pb-4">
      {activeItem && (
        <h1 className="min-w-0 text-2xl font-semibold text-foreground sm:text-3xl">
          {t(`items.${activeItem.id}`)}
        </h1>
      )}
      <div className="ms-auto flex shrink-0 items-center gap-3">
        <WorkspaceSwitcher className="w-[min(18rem,45vw)] sm:w-auto sm:min-w-52 sm:max-w-[22rem]" taskCommittees={committees} selectedCommittee={selectedCommittee} onSelectCommittee={selectCommittee} />
        <MembersUserInfo />
      </div>
    </header>
  );
}
