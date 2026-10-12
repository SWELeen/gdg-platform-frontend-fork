"use client";

import type { ReactElement } from "react";
import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";
import { sidebarPrimaryItems, sidebarSecondaryItems } from "@/components/dashboard/mock-data";
import { sidebarIcons } from "./nav-icons";
import type { IconComponent } from "./nav-icons";
import { isSidebarItemActive, useLocalizedHref } from "./nav-utils";

// Below lg: a single-row, icons-only nav (primary items at the start, Setting/Help at the
// end). `justify-between` on the row splits the two groups; neither group ever wraps (no
// `flex-wrap` is used), so all seven icons stay on one line even at narrow phone widths.
function NavIconButton({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: IconComponent;
  active?: boolean;
}): ReactElement {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
        active ? "bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]" : "text-muted hover:bg-surface-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
    </a>
  );
}

export function MembersCompactNav(): ReactElement {
  const pathname = usePathname();
  const t = useTranslations("dashboard.nav");
  const localize = useLocalizedHref();

  return (
    <nav aria-label={t("compactLabel")} className="flex items-center justify-between gap-2 lg:hidden">
      <div className="flex items-center gap-1" role="group" aria-label={t("sectionsLabel")}>
        {sidebarPrimaryItems.map((item) => (
          <NavIconButton
            key={item.id}
            href={localize(item.href)}
            label={t(`items.${item.id}`)}
            Icon={sidebarIcons[item.id]}
            active={isSidebarItemActive(pathname, item)}
          />
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-1" role="group" aria-label={t("accountLabel")}>
        {sidebarSecondaryItems.map((item) => (
          <NavIconButton
            key={item.id}
            href={localize(item.href)}
            label={t(`items.${item.id}`)}
            Icon={sidebarIcons[item.id]}
            active={isSidebarItemActive(pathname, item)}
          />
        ))}
      </div>
    </nav>
  );
}
