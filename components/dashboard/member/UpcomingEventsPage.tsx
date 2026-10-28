"use client";

import { useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowLeft, ArrowUpRight, CalendarX2, Clock, MapPin, Search, SearchX, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { EventType } from "@/components/dashboard/shared/types";
import { useClientNow } from "@/lib/dashboard/use-client-now";
import { isUpcomingEventDate, parseEventDate, parseEventDateTime } from "@/lib/dashboard/event-format";
import type { PlatformEvent } from "@/lib/events/types";
import { MEMBER_EVENTS_PATH, UPCOMING_EVENTS_PATH, memberEventAccents } from "./member-events";

const eventTypes: EventType[] = ["Workshop", "Conference", "Talk", "Panel", "Hackathon", "Trip"];
const dateOptions = { numberingSystem: "latn" } as const;

function UpcomingEventCard({ event, accent }: { event: PlatformEvent; accent: string }) {
  const t = useTranslations("dashboard.upcomingEventsPage");
  const tType = useTranslations("dashboard.leader.eventFilters");
  const format = useFormatter();
  const date = parseEventDate(event.date);
  const seatsLeft = Math.max(0, event.capacity - event.registered);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group relative flex h-full flex-col rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-gdg-gray-light transition-shadow focus-within:ring-2 focus-within:ring-gdg-blue hover:shadow-md sm:p-5"
    >
      <div className="flex items-start gap-3">
        {date && (
          <div className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${accent}`}>
            <span className="text-xs font-medium uppercase">{format.dateTime(date, { ...dateOptions, month: "short" })}</span>
            <span className="text-xl font-bold leading-none">{format.dateTime(date, { ...dateOptions, day: "numeric" })}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium text-muted">{tType(event.type.toLowerCase())}</span>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-foreground sm:text-base">
            <Link
              href={`${UPCOMING_EVENTS_PATH}/${event.id}`}
              className="after:absolute after:inset-0 after:z-10 after:rounded-2xl focus-visible:outline-none"
            >
              {event.title}
            </Link>
          </h3>
        </div>
      </div>

      {event.description && <p className="mt-3 line-clamp-2 text-sm text-muted">{event.description}</p>}

      <div className="mt-3 space-y-1.5 text-xs text-muted">
        <p className="flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" aria-hidden="true" />
          {date ? format.dateTime(date, { ...dateOptions, weekday: "short", month: "short", day: "numeric", year: "numeric" }) : event.date}
          <span aria-hidden="true">·</span>
          {event.time}
        </p>
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{event.location}</span>
        </p>
        <p className="flex items-center gap-1.5">
          <Users className="size-3.5 shrink-0" aria-hidden="true" />
          {seatsLeft > 0 ? t("seatsLeft", { count: seatsLeft }) : t("full")}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-xs font-semibold text-foreground">{t("viewDetails")}</span>
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-full bg-gdg-yellow-accent text-gdg-dark transition-transform group-hover:scale-105"
        >
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </span>
      </div>
    </motion.article>
  );
}

/** Member-facing list of upcoming published platform events. */
export function UpcomingEventsPage({ events }: { events: PlatformEvent[] }) {
  const t = useTranslations("dashboard.upcomingEventsPage");
  const tType = useTranslations("dashboard.leader.eventFilters");
  const now = useClientNow();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EventType>("all");

  const upcoming =
    now === null
      ? []
      : events
          .filter((event) => isUpcomingEventDate(event.date, now))
          .sort(
            (a, b) =>
              (parseEventDateTime(a.date, a.time)?.getTime() ?? 0) - (parseEventDateTime(b.date, b.time)?.getTime() ?? 0),
          );

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = upcoming.filter((event) => {
    if (typeFilter !== "all" && event.type !== typeFilter) return false;
    if (!normalizedQuery) return true;
    return (
      event.title.toLowerCase().includes(normalizedQuery) ||
      event.location.toLowerCase().includes(normalizedQuery) ||
      (event.description ?? "").toLowerCase().includes(normalizedQuery)
    );
  });
  const hasActiveFilters = normalizedQuery !== "" || typeFilter !== "all";

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full space-y-6 text-foreground">
        <Link
          href="/dashboard/members-dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          {t("back")}
        </Link>

        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-semibold sm:text-3xl">{t("title")}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{t("description")}</p>
          </div>
          <Link
            href={MEMBER_EVENTS_PATH}
            className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
          >
            {t("myEvents")}
            <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </header>

        {now === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label={t("loading")}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-56 animate-pulse rounded-2xl bg-surface-muted motion-reduce:animate-none" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
            <CalendarX2 className="mx-auto size-10 text-muted" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold">{t("emptyTitle")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">{t("emptyDescription")}</p>
          </section>
        ) : (
          <>
            <section
              aria-label={t("filtersLabel")}
              className="flex flex-col gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-gdg-gray-light sm:flex-row sm:items-center sm:p-4"
            >
              <label className="relative block w-full sm:max-w-sm">
                <span className="sr-only">{t("searchLabel")}</span>
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  maxLength={255}
                  className="h-10 w-full rounded-full border border-border bg-surface-muted/60 ps-9 pe-4 text-sm text-foreground placeholder:text-muted focus:border-gdg-blue focus:bg-surface focus:outline-none focus:ring-2 focus:ring-gdg-blue/30"
                />
              </label>
              <label className="sr-only" htmlFor="upcoming-events-type">
                {t("typeLabel")}
              </label>
              <select
                id="upcoming-events-type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
                className="h-10 rounded-full border border-border bg-surface px-4 text-sm text-foreground focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-gdg-blue/30"
              >
                <option value="all">{tType("allTypes")}</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {tType(type.toLowerCase())}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setTypeFilter("all");
                  }}
                  className="h-10 rounded-full px-3 text-sm font-medium text-gdg-blue hover:underline"
                >
                  {t("clearFilters")}
                </button>
              )}
              <p className="text-xs text-muted sm:ms-auto" aria-live="polite">
                {t("resultCount", { count: filtered.length })}
              </p>
            </section>

            {filtered.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
                <SearchX className="mx-auto size-10 text-muted" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-semibold">{t("noResultsTitle")}</h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">{t("noResultsDescription")}</p>
              </section>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((event, index) => (
                  <li key={event.id}>
                    <UpcomingEventCard event={event} accent={memberEventAccents[index % memberEventAccents.length]} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        <p className="text-xs text-muted">{t("demoNote")}</p>
      </div>
    </MotionConfig>
  );
}
