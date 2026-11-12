import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Announcement } from "@/lib/announcements/types";
import { AnnouncementMeta } from "./AnnouncementMeta";
import { AnnouncementShareActions } from "./AnnouncementShareActions";
import { CategoryBadge } from "./CategoryBadge";

const crumbLink =
  "rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gdg-blue";

// Breadcrumb, category, title, meta and share row at the top of the details page.
export function AnnouncementDetailsHeader({ announcement }: { announcement: Announcement }) {
  const t = useTranslations("announcements.details");

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5">
      <nav aria-label={t("breadcrumb")}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
          <li>
            <Link href="/" className={crumbLink}>
              {t("home")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/announcements" className={crumbLink}>
              {t("announcements")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-foreground">
            {announcement.title}
          </li>
        </ol>
      </nav>

      <CategoryBadge category={announcement.category} />

      <h1 className="max-w-[min(72rem,85vw)] text-[clamp(1.6625rem,1.425rem_+_0.665vw,2.85rem)] font-bold leading-tight text-foreground">
        {announcement.title}
      </h1>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <AnnouncementMeta announcement={announcement} />
        <AnnouncementShareActions title={announcement.title} />
      </div>
    </header>
  );
}
