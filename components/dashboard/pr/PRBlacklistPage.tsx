"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CalendarDays, Mail, ShieldAlert } from "lucide-react";
import { API_ENABLED } from "@/lib/api/client";
import {
  fetchRegistrationBlacklist,
  type RegistrationBlacklistEntry,
  type RegistrationBlacklistReason,
} from "@/lib/pr-registrations/api";

type ReasonFilter = "all" | RegistrationBlacklistReason;

export function PRBlacklistPage() {
  const t = useTranslations("dashboard.leader");
  const locale = useLocale();
  const [entries, setEntries] = useState<RegistrationBlacklistEntry[]>([]);
  const [filter, setFilter] = useState<ReasonFilter>("all");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!API_ENABLED) {
      setLoading(false);
      return;
    }
    fetchRegistrationBlacklist()
      .then((items) => {
        if (active) setEntries(items);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleEntries = useMemo(
    () => (filter === "all" ? entries : entries.filter((entry) => entry.reason === filter)),
    [entries, filter],
  );
  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" }),
    [locale],
  );
  const filters: ReasonFilter[] = ["all", "NO_CHECK_IN", "CONFIRMATION_EXPIRED", "LATE_CANCELLATION"];

  return (
    <div className="space-y-6">
      <header className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
          <ShieldAlert aria-hidden="true" className="size-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("blacklist.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("blacklist.description")}</p>
        </div>
      </header>

      {!API_ENABLED ? (
        <p role="status" className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">{t("blacklist.apiDisabled")}</p>
      ) : failed ? (
        <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-50/50 p-5 text-sm text-rose-700 dark:bg-rose-950/20 dark:text-rose-300">{t("blacklist.loadError")}</p>
      ) : (
        <section aria-label={t("blacklist.title")} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xs">
          <div className="flex flex-wrap gap-2 border-b border-border p-4" role="group" aria-label={t("blacklist.filterLabel")}>
            {filters.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === value ? "border-blue-600 bg-blue-600 text-white" : "border-border text-muted hover:bg-surface-muted hover:text-foreground"}`}
              >
                {t(value === "all" ? "blacklist.filters.all" : `blacklist.reasons.${value}`)}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="p-5 text-sm text-muted" role="status">{t("blacklist.loading")}</p>
          ) : visibleEntries.length === 0 ? (
            <p className="p-5 text-sm text-muted">{t("blacklist.empty")}</p>
          ) : (
            <ul className="divide-y divide-border">
              {visibleEntries.map((entry) => (
                <li key={entry.entryId} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-bold text-foreground">{entry.registration.name}</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                        <AlertTriangle aria-hidden="true" className="size-3" />
                        {t(`blacklist.reasons.${entry.reason}`)}
                      </span>
                    </div>
                    {entry.registration.email && (
                      <p className="mt-1 flex min-w-0 items-center gap-1.5 break-all text-xs text-muted">
                        <Mail aria-hidden="true" className="size-3.5 shrink-0" /> {entry.registration.email}
                      </p>
                    )}
                    <p className="mt-2 truncate text-xs font-medium text-foreground/80">{entry.registration.event.name}</p>
                    {entry.resolutionReason && <p className="mt-1 text-xs text-muted">{entry.resolutionReason}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted sm:justify-end">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      {dateFormat.format(new Date(entry.registration.event.startsAt))}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 font-semibold ${entry.resolvedAt ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"}`}>
                      {t(entry.resolvedAt ? "blacklist.resolved" : "blacklist.unresolved")}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
