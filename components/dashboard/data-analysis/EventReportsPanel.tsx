"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarCheck, UserCheck, ScanLine } from "lucide-react";
import { useLeaderDashboard } from "../shared/LeaderDashboardContext";

export function EventReportsPanel({ eventId }: { eventId?: string }) {
  const t = useTranslations("dashboard.leader.eventReports");
  const { events, committee, currentMember, canManageRegistrations } = useLeaderDashboard();
  const reportableEvents = events.filter((event) => event.status !== "Draft" && !event.isDraft);
  const [selectedId, setSelectedId] = useState(eventId ?? reportableEvents[0]?.id ?? "");
  const selectedEvent = useMemo(
    () => reportableEvents.find((event) => event.id === (eventId ?? selectedId)),
    [eventId, selectedId, reportableEvents],
  );
  const isDataCommitteeLeader = committee === "data-analysis" && (currentMember?.role === "Leader" || currentMember?.role === "Co-Leader");
  if (!isDataCommitteeLeader || !canManageRegistrations) return null;

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("eyebrow")}</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("description")}</p>
        </div>
        {!eventId && reportableEvents.length > 0 && (
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            {t("event")}
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="h-10 min-w-56 rounded-xl border border-border bg-surface px-3 text-sm text-foreground">
              {reportableEvents.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
            </select>
          </label>
        )}
      </header>

      {!selectedEvent ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">{t("empty")}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: t("allGuests"), value: selectedEvent.registered, icon: CalendarCheck },
            { label: t("going"), value: selectedEvent.confirmed ?? 0, icon: UserCheck },
            { label: t("checkedIn"), value: selectedEvent.checkedIn ?? 0, icon: ScanLine },
          ].map(({ label, value, icon: Icon }) => (
            <article key={label} className="flex min-h-40 flex-col rounded-2xl border border-border bg-surface p-5 shadow-2xs">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300"><Icon className="size-5" /></span>
              <h3 className="mt-4 text-base font-bold text-foreground">{label}</h3>
              <span className="mt-2 text-3xl font-bold text-foreground">{value}</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
