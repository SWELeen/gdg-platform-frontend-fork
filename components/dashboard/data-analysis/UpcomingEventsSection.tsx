"use client";

import { useLeaderDashboard } from "../shared/LeaderDashboardContext";
import { useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getEventDateBadge } from "@/lib/dashboard/event-format";

export function UpcomingEventsSection() {
  const { events } = useLeaderDashboard();
  const t = useTranslations("dashboard.leader");

  // Pick upcoming events
  const upcomingEvents = events.filter((e) => e.status === "Upcoming" || e.status === "Needs Update").slice(0, 3);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {t("upcomingEvents.title")}
          </h2>
          <p className="text-xs text-muted">
            {t("upcomingEvents.description")}
          </p>
        </div>
        <Link
          href="/dashboard/data-dashboard/events"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-surface-muted"
        >
          <Calendar className="size-3.5" />
          <span>{t("upcomingEvents.viewAllEvents")}</span>
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {upcomingEvents.length === 0 && (
          <p className="rounded-xl bg-surface-muted/40 px-4 py-6 text-center text-sm text-muted">
            {t("upcomingEvents.empty")}
          </p>
        )}
        {upcomingEvents.map((evt) => {
          // Seeded events store "Oct 14, 2026"; the shared parser also accepts ISO dates.
          const badge = getEventDateBadge(evt.date);
          const month = badge?.month ?? "—";
          const day = badge?.day ?? "—";
          const percent = evt.capacity > 0
            ? Math.min(100, Math.round((evt.registered / evt.capacity) * 100))
            : 0;

          return (
            <div
              key={evt.id}
              className="flex flex-col gap-3 rounded-xl border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-surface-muted/30"
            >
              <div className="flex items-center gap-3.5">
                {/* Date Square */}
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-blue-50 text-center dark:bg-blue-950/60">
                  <span className="text-[10px] font-bold tracking-wider text-blue-600 dark:text-blue-400">
                    {month}
                  </span>
                  <span className="text-base font-extrabold text-foreground leading-none">
                    {day}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-foreground sm:text-sm">
                    <Link href={`/dashboard/data-dashboard/events/${evt.id}`} className="hover:underline">
                      {evt.title}
                    </Link>
                  </h3>
                  <p className="text-[11px] text-muted">
                    {evt.time} · {evt.location}
                  </p>
                </div>
              </div>

              {/* Progress & Badge */}
              <div className="flex items-center gap-4 sm:justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted">{t("upcomingEvents.capacity")}</span>
                  <div className="h-1.5 w-16 sm:w-20 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-foreground">{percent}%</span>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  <span className="size-1.5 rounded-full bg-blue-600" />
                  {t("upcomingEvents.registered", { count: evt.registered })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
