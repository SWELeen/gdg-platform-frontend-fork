import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { Announcement } from "@/lib/announcements/types";
import { useAnnouncementDate } from "./AnnouncementMeta";
import { PillAction } from "./PillAction";

// Google Calendar all-day event on the deadline (end date is exclusive).
function calendarUrl(title: string, date: string) {
  const start = new Date(`${date}T00:00:00Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const compact = (d: Date) => d.toISOString().slice(0, 10).replaceAll("-", "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${compact(start)}/${compact(end)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-end text-sm font-semibold text-foreground">{children}</dd>
    </div>
  );
}

// Sidebar facts. Optional rows and actions render only when the data has them.
export function AnnouncementInfoCard({ announcement }: { announcement: Announcement }) {
  const t = useTranslations("announcements.details");
  const tCategories = useTranslations("announcements.categories");
  const formatDate = useAnnouncementDate();
  const { deadline, status, primaryAction } = announcement;

  return (
    <aside
      aria-labelledby="announcement-info-heading"
      className="h-fit rounded-card border border-border bg-surface p-5 lg:sticky lg:top-[calc(var(--home-nav-height)+1rem)]"
    >
      <h2
        id="announcement-info-heading"
        className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500"
      >
        {t("info.title")}
      </h2>

      <dl className="mt-2">
        <Row label={t("info.published")}>
          <time dateTime={announcement.publishedAt}>
            {formatDate(announcement.publishedAt, "numeric")}
          </time>
        </Row>
        <Row label={t("info.category")}>{tCategories(announcement.category)}</Row>
        {deadline && (
          <Row label={deadline.label}>
            <time dateTime={deadline.date}>{formatDate(deadline.date, "numeric")}</time>
          </Row>
        )}
        {status && (
          <Row label={t("info.status")}>
            <span className={status === "open" ? "text-[var(--dashboard-green-text)]" : "text-gray-500"}>
              {t(`status.${status}`)}
            </span>
          </Row>
        )}
      </dl>

      {(primaryAction || deadline) && (
        <div className="mt-4 flex flex-col gap-2.5">
          {primaryAction && (
            <PillAction href={primaryAction.href} external variant="blue" className="w-full">
              {primaryAction.label}
            </PillAction>
          )}
          {deadline && (
            <PillAction
              href={calendarUrl(`${announcement.title} — ${deadline.label}`, deadline.date)}
              external
              variant="light"
              className="w-full"
            >
              {t("addToCalendar")}
            </PillAction>
          )}
        </div>
      )}
    </aside>
  );
}
