"use client";

import { useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowUpRight, CalendarX2, Clock, MapPin, Search, SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useClientNow } from "@/lib/dashboard/use-client-now";
import { useDemoRegistrationChanges } from "@/lib/user-registrations/demo-state";
import { RegistrationStatusBadge } from "@/components/user-registrations/RegistrationStatusBadge";
import type {
  UserRegistration,
  UserRegistrationKind,
  UserRegistrationStatus,
  UserRegistrationsResult,
} from "@/lib/user-registrations/types";
import { MEMBER_EVENTS_PATH, memberEventAccents } from "./member-events";

type TimeFilter = "upcoming" | "past" | "all";

const timeFilters: TimeFilter[] = ["upcoming", "past", "all"];
const statuses: UserRegistrationStatus[] = [
  "pending",
  "waitlisted",
  "need-confirmation",
  "approved",
  "declined",
  "attended",
  "not-attended",
  "cancelled",
];
const kinds: UserRegistrationKind[] = ["event", "trip"];

const dateOptions = { numberingSystem: "latn" } as const;

function EventCard({ registration, accent }: { registration: UserRegistration; accent: string }) {
  const t = useTranslations("dashboard.memberEvents");
  const tr = useTranslations("userRegistrations");
  const format = useFormatter();
  const startsAt = new Date(registration.startsAt);
  const href = `${MEMBER_EVENTS_PATH}/${registration.id}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group relative flex h-full flex-col rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-gdg-gray-light transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${accent}`}>
          <span className="text-xs font-medium uppercase">
            {format.dateTime(startsAt, { ...dateOptions, month: "short" })}
          </span>
          <span className="text-xl font-bold leading-none">
            {format.dateTime(startsAt, { ...dateOptions, day: "numeric" })}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted">{tr(`kind.${registration.kind}`)}</span>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-foreground/25" />
            <RegistrationStatusBadge status={registration.status} />
          </div>
          <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-foreground sm:text-base">
            {/* The stretched link makes the whole card clickable while keeping one tab stop. */}
            <Link href={href} className="after:absolute after:inset-0 after:z-10 after:rounded-2xl focus-visible:outline-none">
              {registration.title}
            </Link>
          </h3>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted">
        <p className="flex items-center gap-1.5">
          <Clock className="size-3.5 shrink-0" aria-hidden="true" />
          {format.dateTime(startsAt, { ...dateOptions, weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          <span aria-hidden="true">·</span>
          {format.dateTime(startsAt, { ...dateOptions, timeStyle: "short" })}
        </p>
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{registration.location}</span>
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-xs font-semibold text-foreground">{t("viewDetails")}</span>
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-full bg-gdg-blue-light text-gdg-blue transition-transform group-hover:scale-105 group-focus-within:ring-2 group-focus-within:ring-gdg-blue/40"
        >
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </span>
      </div>
    </motion.article>
  );
}

/** Member-facing "My Events" page: the signed-in member's event and trip registrations. */
export function MemberEventsPage({ result }: { result: UserRegistrationsResult }) {
  const t = useTranslations("dashboard.memberEvents");
  const tr = useTranslations("userRegistrations");
  // Null until hydrated: the page is prerendered, so upcoming/past must use the browser's clock.
  const clientNow = useClientNow();
  const now = clientNow ?? 0;
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");
  const [statusFilter, setStatusFilter] = useState<"all" | UserRegistrationStatus>("all");
  const [kindFilter, setKindFilter] = useState<"all" | UserRegistrationKind>("all");
  const [query, setQuery] = useState("");

  const demo = useDemoRegistrationChanges();
  // Demo confirm/cancel changes from event details apply here too, so statuses stay consistent.
  const registrations = demo.apply(result.state === "ready" ? result.registrations : []);
  const isUpcoming = (registration: UserRegistration) => new Date(registration.startsAt).getTime() >= now;

  const counts: Record<TimeFilter, number> = {
    upcoming: registrations.filter(isUpcoming).length,
    past: registrations.filter((registration) => !isUpcoming(registration)).length,
    all: registrations.length,
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = registrations
    .filter((registration) => {
      if (timeFilter === "upcoming" && !isUpcoming(registration)) return false;
      if (timeFilter === "past" && isUpcoming(registration)) return false;
      if (statusFilter !== "all" && registration.status !== statusFilter) return false;
      if (kindFilter !== "all" && registration.kind !== kindFilter) return false;
      if (!normalizedQuery) return true;
      return (
        registration.title.toLowerCase().includes(normalizedQuery) ||
        registration.location.toLowerCase().includes(normalizedQuery)
      );
    })
    // Soonest first for upcoming events; most recent first for past ones.
    .sort((a, b) => {
      const aTime = new Date(a.startsAt).getTime();
      const bTime = new Date(b.startsAt).getTime();
      const aUpcoming = aTime >= now;
      const bUpcoming = bTime >= now;
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      return aUpcoming ? aTime - bTime : bTime - aTime;
    });

  const hasActiveFilters = normalizedQuery !== "" || statusFilter !== "all" || kindFilter !== "all";
  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setKindFilter("all");
    setTimeFilter("all");
  };

  const selectClass =
    "h-10 rounded-full border border-border bg-surface px-4 text-sm text-foreground focus:border-gdg-blue focus:outline-none focus:ring-2 focus:ring-gdg-blue/30";

  return (
    <MotionConfig reducedMotion="user">
      <div className="w-full space-y-6 text-foreground">
        <header className="min-w-0">
          <h2 className="text-2xl font-semibold sm:text-3xl">{t("title")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted sm:text-base">{t("description")}</p>
        </header>

        {result.state === "not-configured" ? (
          <section className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
            <h2 className="text-lg font-semibold">{tr("unavailableTitle")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">{tr("unavailableDescription")}</p>
          </section>
        ) : clientNow === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-2xl bg-surface-muted motion-reduce:animate-none" />
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
            <CalendarX2 className="mx-auto size-10 text-muted" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold">{t("emptyTitle")}</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">{t("emptyDescription")}</p>
          </section>
        ) : (
          <>
            <section
              aria-label={t("filtersLabel")}
              className="space-y-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-gdg-gray-light sm:p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2" role="group" aria-label={t("timeLabel")}>
                  {timeFilters.map((filter) => {
                    const active = filter === timeFilter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setTimeFilter(filter)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                          active
                            ? "border-transparent bg-[var(--dashboard-red-bg)] text-[var(--dashboard-red-text)]"
                            : "border-border bg-surface text-foreground hover:bg-surface-muted"
                        }`}
                      >
                        {t("filterWithCount", { label: t(`time.${filter}`), count: counts[filter] })}
                      </button>
                    );
                  })}
                </div>

                <label className="relative block w-full lg:max-w-xs">
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
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="member-events-status">
                  {t("statusLabel")}
                </label>
                <select
                  id="member-events-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                  className={selectClass}
                >
                  <option value="all">{t("allStatuses")}</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {tr(`status.${status}`)}
                    </option>
                  ))}
                </select>

                <label className="sr-only" htmlFor="member-events-kind">
                  {t("kindLabel")}
                </label>
                <select
                  id="member-events-kind"
                  value={kindFilter}
                  onChange={(event) => setKindFilter(event.target.value as typeof kindFilter)}
                  className={selectClass}
                >
                  <option value="all">{t("allKinds")}</option>
                  {kinds.map((kind) => (
                    <option key={kind} value={kind}>
                      {tr(`kind.${kind}`)}
                    </option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="h-10 rounded-full px-3 text-sm font-medium text-gdg-blue hover:underline"
                  >
                    {t("clearFilters")}
                  </button>
                )}

                <p className="ms-auto text-xs text-muted" aria-live="polite">
                  {t("resultCount", { count: filtered.length })}
                </p>
              </div>
            </section>

            {filtered.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center sm:p-12">
                <SearchX className="mx-auto size-10 text-muted" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-semibold">
                  {timeFilter === "upcoming" && !hasActiveFilters ? t("noUpcomingTitle") : t("noResultsTitle")}
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
                  {timeFilter === "upcoming" && !hasActiveFilters ? t("noUpcomingDescription") : t("noResultsDescription")}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-full bg-gdg-blue px-5 py-2 text-sm font-semibold text-white transition hover:bg-gdg-blue/90"
                >
                  {t("showAll")}
                </button>
              </section>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((registration) => (
                  <li key={registration.id}>
                    <EventCard
                      registration={registration}
                      accent={memberEventAccents[registrations.indexOf(registration) % memberEventAccents.length]}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </MotionConfig>
  );
}
