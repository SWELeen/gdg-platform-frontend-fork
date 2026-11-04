"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarCheck, Download, FileSpreadsheet, LoaderCircle, ScanLine, UserCheck } from "lucide-react";
import { fetchDataEventReport, fetchDataEventReportEvents, type DataEventReportEvent, type DataEventReportGroup, type DataEventReportRow } from "@/lib/data-exports/api";
import { useLeaderDashboard } from "../shared/LeaderDashboardContext";

function csvCell(value: string | number | null) {
  const text = value == null ? "" : String(value);
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

function makeCsv(
  rows: DataEventReportRow[],
  headers: string[],
  sourceLabel: (source: NonNullable<DataEventReportRow["discoverySource"]>) => string,
) {
  const lines = rows.map((row) => [
    row.name,
    row.email,
    row.status,
    row.registeredAt,
    row.checkedInAt,
    row.discoverySource ? sourceLabel(row.discoverySource) : null,
  ]);
  return `\uFEFF${[headers, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n")}`;
}

export function EventReportsPanel({ eventId }: { eventId?: string }) {
  const t = useTranslations("dashboard.leader.eventReports");
  const tSource = useTranslations("eventRegistration.discoverySource.options");
  const { committee, currentMember } = useLeaderDashboard();
  const isDataCommitteeLeader = committee === "data-analysis" && (currentMember?.role === "Leader" || currentMember?.role === "Co-Leader");
  const [events, setEvents] = useState<DataEventReportEvent[]>([]);
  const [selectedId, setSelectedId] = useState(eventId ?? "");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<DataEventReportGroup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportableEvents = useMemo(() => events.filter((event) => event.status !== "DRAFT"), [events]);
  const selectedEvent = reportableEvents.find((event) => String(event.eventId) === selectedId) ?? reportableEvents[0];

  useEffect(() => {
    if (!isDataCommitteeLeader) return;
    let active = true;
    void fetchDataEventReportEvents().then((result) => {
      if (!active) return;
      if (result.ok) {
        setEvents(result.data);
        setSelectedId((current) => eventId || current || String(result.data[0]?.eventId ?? ""));
      } else {
        setError(t("loadFailed"));
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [eventId, isDataCommitteeLeader, t]);

  async function download(group: DataEventReportGroup) {
    if (!selectedEvent || downloading) return;
    setError(null);
    setDownloading(group);
    try {
      const result = await fetchDataEventReport(selectedEvent.eventId, group);
      if (!result.ok) {
        setError(t("downloadFailed"));
        return;
      }
      const sourceLabel = (source: NonNullable<DataEventReportRow["discoverySource"]>) => tSource(source);
      const headers = [t("columns.name"), t("columns.email"), t("columns.status"), t("columns.registeredAt"), t("columns.checkedInAt"), t("columns.discoverySource")];
      const blob = new Blob([makeCsv(result.data.items, headers, sourceLabel)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const slug = selectedEvent.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `event-${selectedEvent.eventId}`;
      anchor.href = url;
      anchor.download = `gdg-${slug}-${group}.csv`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(t("downloadFailed"));
    } finally {
      setDownloading(null);
    }
  }

  if (!isDataCommitteeLeader) return null;

  const reports: { group: DataEventReportGroup; label: string; description: string; count: number; icon: typeof CalendarCheck }[] = selectedEvent ? [
    { group: "all", label: t("allGuests"), description: t("allGuestsDescription"), count: selectedEvent.registered, icon: CalendarCheck },
    { group: "going", label: t("going"), description: t("goingDescription"), count: selectedEvent.going, icon: UserCheck },
    { group: "checked-in", label: t("checkedIn"), description: t("checkedInDescription"), count: selectedEvent.checkedIn, icon: ScanLine },
  ] : [];

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">{t("eyebrow")}</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("description")}</p>
        </div>
        {reportableEvents.length > 0 && (
          <label className="flex flex-col gap-1 text-xs font-medium text-muted">
            {t("event")}
            <select value={String(selectedEvent?.eventId ?? "")} onChange={(event) => setSelectedId(event.target.value)} className="h-10 min-w-56 rounded-xl border border-border bg-surface px-3 text-sm text-foreground">
              {reportableEvents.map((event) => <option key={event.eventId} value={event.eventId}>{event.name}</option>)}
            </select>
          </label>
        )}
      </header>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-8 text-sm text-muted"><LoaderCircle className="size-4 animate-spin" />{t("loading")}</div>
      ) : !selectedEvent ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">{t("empty")}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {reports.map(({ group, label, description, count, icon: Icon }) => (
            <article key={group} className="flex min-h-56 flex-col rounded-2xl border border-border bg-surface p-5 shadow-2xs">
              <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300"><Icon className="size-5" /></span>
              <h3 className="mt-4 text-base font-bold text-foreground">{label}</h3>
              <p className="mt-1 text-sm text-muted">{description}</p>
              <span className="mt-2 text-3xl font-bold text-foreground">{count}</span>
              <button type="button" onClick={() => void download(group)} disabled={downloading !== null} className="mt-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60">
                {downloading === group ? <LoaderCircle className="size-4 animate-spin" /> : downloading ? <FileSpreadsheet className="size-4" /> : <Download className="size-4" />}
                {downloading === group ? t("downloading") : t("download")}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}