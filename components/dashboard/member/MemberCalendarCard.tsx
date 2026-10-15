"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DASHBOARD_CARD } from "@/components/dashboard/members/card-styles";
import { toIsoDate } from "@/lib/dashboard/event-format";
import { useClientNow } from "@/lib/dashboard/use-client-now";
import { useDemoRegistrationChanges } from "@/lib/user-registrations/demo-state";
import { getCurrentUserRegistrations } from "@/lib/user-registrations/repository";
import { isScheduledRegistration } from "@/lib/user-registrations/rules";
import type { UserRegistration } from "@/lib/user-registrations/types";
import { RegistrationStatusBadge } from "@/components/user-registrations/RegistrationStatusBadge";
import { MEMBER_EVENTS_PATH } from "./member-events";

// Sunday-first, matching the grid below; labels live in dashboard.calendar.weekdays.
const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DATE_OPTIONS = { numberingSystem: "latn" } as const;

type Month = { year: number; month: number };

// Days-of-month for a month grid, padded with null so day 1 lands under its weekday.
function getMonthGridDays({ year, month }: Month): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const shiftMonth = ({ year, month }: Month, delta: number): Month => {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
};

/**
 * Member Dashboard calendar: the member's own scheduled registrations (events and trips,
 * excluding declined or cancelled ones), from the same source as My Events. Dates use the
 * browser's local time zone and calendar, known only after hydration.
 */
export function MemberCalendarCard() {
  const t = useTranslations("dashboard.calendar");
  const tr = useTranslations("userRegistrations");
  const format = useFormatter();
  const now = useClientNow();
  const demo = useDemoRegistrationChanges();
  const [source, setSource] = useState<UserRegistration[] | null>(null);
  const [view, setView] = useState<Month | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCurrentUserRegistrations()
      .then((result) => {
        if (active) setSource(result.state === "ready" ? result.registrations : []);
      })
      .catch(() => {
        if (active) setSource([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (now === null) {
    return (
      <div
        className={`h-[25rem] animate-pulse motion-reduce:animate-none ${DASHBOARD_CARD}`}
        aria-busy="true"
        aria-label={t("loading")}
      />
    );
  }

  const today = new Date(now);
  const todayKey = toIsoDate(today);
  const currentMonth: Month = { year: today.getFullYear(), month: today.getMonth() };
  const shown = view ?? currentMonth;
  const selected = selectedKey ?? todayKey;

  // One entry per registration (never duplicated), grouped by local calendar date.
  const byDate = new Map<string, UserRegistration[]>();
  const seen = new Set<string>();
  for (const registration of demo.apply(source ?? [])) {
    if (seen.has(registration.id) || !isScheduledRegistration(registration)) continue;
    seen.add(registration.id);
    const key = toIsoDate(new Date(registration.startsAt));
    byDate.set(key, [...(byDate.get(key) ?? []), registration]);
  }
  for (const list of byDate.values()) list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const keyFor = (day: number) => toIsoDate(new Date(shown.year, shown.month, day));
  const [selYear, selMonth, selDay] = selected.split("-").map(Number);
  const selectedDate = new Date(selYear, selMonth - 1, selDay);
  const selectedEvents = byDate.get(selected) ?? [];
  const isOnToday = selected === todayKey && shown.year === currentMonth.year && shown.month === currentMonth.month;

  const monthLabel = format.dateTime(new Date(shown.year, shown.month, 1), { ...DATE_OPTIONS, month: "long", year: "numeric" });

  return (
    <motion.section
      aria-labelledby="member-calendar-month"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col ${DASHBOARD_CARD}`}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={t("previousMonth")}
          onClick={() => setView(shiftMonth(shown, -1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/40"
        >
          <ChevronLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-col items-center">
          <h2 id="member-calendar-month" aria-live="polite" className="text-lg font-semibold text-foreground">
            {monthLabel}
          </h2>
          {!isOnToday && (
            <button
              type="button"
              onClick={() => {
                setView(null);
                setSelectedKey(null);
              }}
              className="mt-0.5 rounded-full px-2 text-xs font-semibold text-gdg-red hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-red/40"
            >
              {t("todayButton")}
            </button>
          )}
        </div>
        <button
          type="button"
          aria-label={t("nextMonth")}
          onClick={() => setView(shiftMonth(shown, 1))}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue/40"
        >
          <ChevronRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium uppercase tracking-wide text-muted" aria-hidden="true">
        {WEEKDAY_KEYS.map((weekday) => (
          <span key={weekday}>{t(`weekdays.${weekday}`)}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 mb-3">
        {getMonthGridDays(shown).map((day, index) => {
          if (day === null) return <span key={index} />;
          const key = keyFor(day);
          const events = byDate.get(key) ?? [];
          const isSelected = key === selected;
          const isToday = key === todayKey;
          const dayLabel = format.dateTime(new Date(shown.year, shown.month, day), { ...DATE_OPTIONS, dateStyle: "full" });
          return (
            <div key={index} className="flex items-center justify-center py-0.5">
              <button
                type="button"
                onClick={() => setSelectedKey(key)}
                aria-pressed={isSelected}
                aria-current={isToday ? "date" : undefined}
                aria-label={t("dayLabel", { date: dayLabel, count: events.length })}
                className={`relative flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue ${
                  isSelected
                    ? "bg-gdg-red font-semibold text-[var(--white)]"
                    : isToday
                      ? "font-semibold text-gdg-red ring-1 ring-gdg-red"
                      : "text-foreground hover:bg-surface-muted"
                }`}
              >
                {day}
                {events.length > 0 && (
                  <span className="absolute -bottom-0.5 flex gap-0.5" aria-hidden="true">
                    {events.slice(0, 3).map((event) => (
                      <span
                        key={event.id}
                        className={`h-1 w-1 rounded-full ${isSelected ? "bg-[var(--white)]" : "bg-gdg-blue-accent"}`}
                      />
                    ))}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-auto rounded-xl bg-surface-muted/60 p-3" aria-live="polite">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {selected === todayKey ? t("today") : t("selectedDay")}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">
          {format.dateTime(selectedDate, { ...DATE_OPTIONS, weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        {source === null ? (
          <p className="mt-1 text-xs text-muted">{t("loading")}</p>
        ) : selectedEvents.length === 0 ? (
          <p className="mt-1 text-xs text-muted">{t("noEvents")}</p>
        ) : (
          <>
            <p className="mt-1 text-xs text-muted">{t("eventsScheduled", { count: selectedEvents.length })}</p>
            <ul className="mt-2 space-y-1.5">
              {selectedEvents.map((registration) => (
                <li key={registration.id}>
                  <Link
                    href={`${MEMBER_EVENTS_PATH}/${registration.id}`}
                    className="flex flex-col gap-1 rounded-lg bg-surface px-2.5 py-2 text-xs transition hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gdg-blue"
                  >
                    <span className="line-clamp-2 font-semibold text-foreground">{registration.title}</span>
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
                      {tr(`kind.${registration.kind}`)}
                      <span aria-hidden="true">·</span>
                      {format.dateTime(new Date(registration.startsAt), { ...DATE_OPTIONS, timeStyle: "short" })}
                      <RegistrationStatusBadge status={registration.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </motion.section>
  );
}
