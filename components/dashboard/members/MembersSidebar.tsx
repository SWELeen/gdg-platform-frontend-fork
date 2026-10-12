"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { sidebarPrimaryItems, sidebarSecondaryItems } from "@/components/dashboard/mock-data";
import { sidebarIcons } from "./nav-icons";
import type { IconComponent } from "./nav-icons";
import { isSidebarItemActive, useLocalizedHref } from "./nav-utils";

function SidebarLink({
  href,
  label,
  Icon,
  active,
  muted = false,
}: {
  href: string;
  label: string;
  Icon: IconComponent;
  active?: boolean;
  muted?: boolean;
}): ReactElement {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active
          ? "border-s-4 border-gdg-red bg-[var(--dashboard-red-bg)] ps-2.5 font-semibold text-[var(--dashboard-red-text)]"
          : muted
          ? "font-normal text-muted hover:bg-surface-muted hover:text-foreground"
          : "font-semibold text-foreground/70 hover:bg-surface-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
    </a>
  );
}

// Desktop (lg+) only — the vertical text+icon sidebar. Below lg, `MembersCompactNav`
// takes over instead.
export function MembersSidebar(): ReactElement {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const localize = useLocalizedHref();

  return (
    <aside className="hidden shrink-0 border-e border-border bg-surface px-3 py-6 lg:block lg:w-60 xl:w-64">
      <nav aria-label={t("sectionsLabel")} className="flex flex-col gap-1">
        {sidebarPrimaryItems.map((item) => (
          <SidebarLink
            key={item.id}
            href={localize(item.href)}
            label={t(`items.${item.id}`)}
            Icon={sidebarIcons[item.id]}
            active={isSidebarItemActive(pathname, item)}
          />
        ))}
      </nav>

      <div className="my-4 border-t border-border" />

      <nav aria-label={t("accountLabel")} className="flex flex-col gap-1">
        {sidebarSecondaryItems.map((item) => (
          <SidebarLink
            key={item.id}
            href={localize(item.href)}
            label={t(`items.${item.id}`)}
            Icon={sidebarIcons[item.id]}
            active={isSidebarItemActive(pathname, item)}
            muted
          />
        ))}
      </nav>
    </aside>
  );
}
