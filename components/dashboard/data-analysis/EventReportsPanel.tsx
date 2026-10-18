"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Users, UserCheck, ScanLine } from "lucide-react";
import { useLeaderDashboard } from "../shared/LeaderDashboardContext";

type ReportKind = "all" | "going" | "checked-in";
type Guest = { name: string; email: string; registeredAt: string; status: "Pending" | "Going" | "Not Going"; checkedIn: boolean };

const demoGuests: Guest[] = [
  { name: "Jury Khallaf", email: "jourikhallaf@gmail.com", registeredAt: "Sep 21, 2026", status: "Going", checkedIn: true },
  { name: "Tuleen Tabaani", email: "tuleen.taabani@gmail.com", registeredAt: "Sep 20, 2026", status: "Pending", checkedIn: false },
  { name: "Asrar Abdulhamid", email: "asrarabdulhamid99@gmail.com", registeredAt: "Sep 19, 2026", status: "Going", checkedIn: false },
  { name: "Rana Aljawi", email: "ranaaljawi2@gmail.com", registeredAt: "Sep 19, 2026", status: "Going", checkedIn: true },
  { name: "Jawan Alorabi", email: "jawanh53@gmail.com", registeredAt: "Sep 19, 2026", status: "Not Going", checkedIn: false },
  { name: "Hadeel Aljohani", email: "hadel7823h@gmail.com", registeredAt: "Sep 19, 2026", status: "Going", checkedIn: true },
];

const reports: { id: ReportKind; titleKey: string; descriptionKey: string; icon: typeof Users; rows: (guest: Guest) => boolean }[] = [
  { id: "all", titleKey: "allGuests", descriptionKey: "allGuestsDescription", icon: Users, rows: () => true },
  { id: "going", titleKey: "going", descriptionKey: "goingDescription", icon: UserCheck, rows: (guest) => guest.status === "Going" },
  { id: "checked-in", titleKey: "checkedIn", descriptionKey: "checkedInDescription", icon: ScanLine, rows: (guest) => guest.checkedIn },
];

function downloadExcelReport(title: string, eventName: string, guests: Guest[]) {
  const cell = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  const rows = guests.map((guest) => `<tr><td>${cell(guest.name)}</td><td>${cell(guest.email)}</td><td>${cell(guest.registeredAt)}</td><td>${cell(guest.status)}</td><td>${guest.checkedIn ? "Yes" : "No"}</td></tr>`).join("");
  const html = `<html><head><meta charset="utf-8"></head><body><table><thead><tr><th>Guest</th><th>Email</th><th>Registered</th><th>Status</th><th>Checked In</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  const url = URL.createObjectURL(new Blob(["\ufeff", html], { type: "application/vnd.ms-excel;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${eventName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${title.toLowerCase().replaceAll(" ", "-")}.xls`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function EventReportsPanel({ eventId }: { eventId?: string }) {
  const t = useTranslations("dashboard.leader.eventReports");
  const { events } = useLeaderDashboard();
  const reportableEvents = events.filter((event) => event.status !== "Draft" && !event.isDraft);
  const [selectedId, setSelectedId] = useState(eventId ?? reportableEvents[0]?.id ?? "");
  const selectedEvent = reportableEvents.find((event) => event.id === (eventId ?? selectedId));
  const guests = useMemo(() => demoGuests, []);
  const eventName = selectedEvent?.title ?? "Event";

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
          {reports.map((report) => {
            const Icon = report.icon;
            const rows = guests.filter(report.rows);
            return (
              <article key={report.id} className="flex min-h-52 flex-col rounded-2xl border border-border bg-surface p-5 shadow-2xs">
                <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300"><Icon className="size-5" /></span>
                <h3 className="mt-4 text-base font-bold text-foreground">{t(report.titleKey)}</h3>
                <p className="mt-1 flex-1 text-sm text-muted">{t(report.descriptionKey)}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs font-medium text-muted">{t("guestCount", { count: rows.length })}</span>
                  <button type="button" onClick={() => downloadExcelReport(t(report.titleKey), eventName, rows)} className="inline-flex items-center gap-2 rounded-lg bg-gdg-green px-3 py-2 text-xs font-semibold text-white transition hover:bg-gdg-green/90">
                    <Download className="size-3.5" /> {t("download")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted">{t("sampleNotice")}</p>
    </section>
  );
}
